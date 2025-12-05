import {
    BaseTaskSubmission, QuizSubmission, QuestionSubmission, FileUploadSubmission,
    CodeSubmission, Task, QuizTaskContent, Assignment, Answer, Question, MultiChoiceAnswer, TrueFalseAnswer, TextAnswer,
    Grade
} from "@/models/app";
import { ClientError } from "@/models/app/Errors/ClientError";
import { NotFoundError } from "@/models/app/Errors/NotFoundError";
import { AssignmentProgress } from "@/models/app/Progress/AssignmentProgress.entity";
import { SubmissionStatus, ProgressTypeEnum, TaskTypeEnum, GradingStatus, QuestionType, SubmissionTypeEnum, ProgressType } from "@/models/enums";
import { MongoUnitOfWork } from "@/repository/MongoUnitOfWork";
import { SubmissionRepository } from "@/repository/SubmissionRepository";
import { TYPES } from "@/types";
import { injectable, inject } from "inversify";
import { ClientSession, Types } from "mongoose";
import { Logger } from "winston";
import AssignmentService from "./AssignmentService";
import { TaskService } from "./TaskService";
import { ServerError } from "@/models/app/Errors/ServerError";
import AssignmentProgressRepository from "@/repository/Progress/AssignmentProgressRepository";
import { AssignmentSubmissionDto, TaskSubmissionDto, QuizContentDto, QuestionContentDto, FileUploadContentDto, CodeContentDto } from "@/models/dto/request";

import { UserToken } from "@/models/app/User.entity";
import { canUnlockAssignment, evaluateSubmissionTime } from "@/access/casbin/policies/timePolicies";
import ProgressTrackingService from "./ProgressTrackingService";
import { AccessService } from "@/access/AccessService";

@injectable()
export class SubmissionService {
    constructor(
        @inject(TYPES.SubmissionRepository) private submissionRepo: SubmissionRepository,
        @inject(TYPES.AssignmentProgressRepository) private progressRepo: AssignmentProgressRepository,
        @inject(TYPES.AssignmentService) private assignmentService: AssignmentService,
        @inject(TYPES.ProgressTrackingService) private progressTrackingService: ProgressTrackingService,
        @inject(TYPES.TaskService) private taskService: TaskService,
        @inject(TYPES.MongoUnitOfWork) private unitOfWork: MongoUnitOfWork,
        @inject(TYPES.AccessService) private accessService: AccessService,
        @inject(TYPES.Logger) private logger: Logger
    ) { }

    // async submitSingleTask(
    //     userId: string,
    //     assignmentId: string,
    //     taskSubmissionDto: any, // TaskSubmissionDto
    // ): Promise<any> { // returns updated AssignmentProgress
    //     const session = await this.unitOfWork.beginTransaction();

    //     try {
    //         // 1. validate assignment exists
    //         const assignment = await this.assignmentService.getAssignmentById(assignmentId);
    //         if (!assignment) throw new NotFoundError('Assignment not found');

    //         // Optionally run ABAC/RBAC check before starting transaction
    //         // await AccessService.authorize(user, 'assignment', 'submit', assignment, ctx, { throwOnDeny: true });

    //         // 2. Get or create progress (inside transaction)
    //         let progress = await this.progressRepo.findByUserAndAssignment(userId, assignmentId, session);
    //         if (!progress) {
    //             const tasks = await this.taskService.getTasksByAssignmentId(assignmentId, session);
    //             const tasksProgress = tasks.map(task => ({
    //                 taskId: task.id!,
    //                 status: SubmissionStatus.NOT_SUBMITTED,
    //                 attempts: 0,
    //                 timeSpent: 0
    //             }));
    //             progress = await this.progressRepo.create({
    //                 userId,
    //                 assignmentId,
    //                 status: ProgressTypeEnum.IN_PROGRESS,
    //                 startedAt: new Date(),
    //                 lastActivityAt: new Date(),
    //                 tasksProgress,
    //                 metrics: {
    //                     totalTasksAttempted: 0,
    //                     totalTasksCompleted: 0,
    //                     averageAttemptsPerTask: 0,
    //                     averageTimePerTask: 0,
    //                     totalTimeSpent: 0,
    //                     timeSpentByTaskType: {},
    //                     taskCompletionByType: {}
    //                 }
    //             } as any, {}, session);
    //         }

    //         // 3. Validate task exists in assignment
    //         const task = (assignment.tasks || []).find(t => t.id === taskSubmissionDto.taskId) ||
    //             (await this.taskService.getTaskById(taskSubmissionDto.taskId));
    //         if (!task) throw new NotFoundError(`Task ${taskSubmissionDto.taskId} not found`);

    //         // 4. Validate prerequisites
    //         await this.validatePrerequisitesCompleted(progress, task);

    //         // 5. validate attempt limits
    //         await this.validateAttemptLimits(progress, task);

    //         // 6. Build submission object
    //         const attemptNumber = this.getNextAttemptNumber(progress, taskSubmissionDto.taskId);
    //         const baseSubmission: BaseTaskSubmission = {
    //             userId,
    //             assignmentId,
    //             taskId: taskSubmissionDto.taskId,
    //             taskType: taskSubmissionDto.taskType,
    //             timeSpent: taskSubmissionDto.timeSpent || 0,
    //             currentState: {
    //                 status: SubmissionStatus.SUBMITTED,
    //                 attemptNumber,
    //                 submittedAt: new Date(),
    //                 content: taskSubmissionDto.content
    //             },
    //             version: 1,
    //             history: []
    //         };

    //         // Create specific typed submission
    //         let submissionToCreate: BaseTaskSubmission;
    //         switch (taskSubmissionDto.taskType) {
    //             case SubmissionTypeEnum.QUIZ_SUBMISSION:
    //                 submissionToCreate = { ...baseSubmission, taskType: SubmissionTypeEnum.QUIZ_SUBMISSION, answers: taskSubmissionDto.content?.answers || [] } as QuizSubmission;
    //                 break;
    //             case SubmissionTypeEnum.QUESTION_SUBMISSION:
    //                 submissionToCreate = { ...baseSubmission, taskType: SubmissionTypeEnum.QUESTION_SUBMISSION, answer: taskSubmissionDto.content?.answer } as QuestionSubmission;
    //                 break;
    //             case SubmissionTypeEnum.FILE_UPLOAD_SUBMISSION:
    //                 submissionToCreate = { ...baseSubmission, taskType: SubmissionTypeEnum.FILE_UPLOAD_SUBMISSION, fileUrls: taskSubmissionDto.content?.fileUrls || [] } as FileUploadSubmission;
    //                 break;
    //             case SubmissionTypeEnum.CODE_SUBMISSION:
    //                 submissionToCreate = { ...baseSubmission, taskType: SubmissionTypeEnum.CODE_SUBMISSION, code: taskSubmissionDto.content?.code || '' } as CodeSubmission;
    //                 break;
    //             default:
    //                 throw new ClientError(`Unsupported submission type: ${taskSubmissionDto.taskType}`);
    //         }

    //         // 7. Persist submission (append-only)
    //         const createdSubmission = await this.submissionRepo.create(submissionToCreate, {}, session);

    //         // 8. Optionally auto-grade (synchronous for quizzes/questions)
    //         let gradedSubmission = createdSubmission;
    //         if (this.canAutoGrade(task.taskType)) {
    //             gradedSubmission = await this.autoGradeSubmission(createdSubmission, task, session);
    //             if (!gradedSubmission) {
    //                 throw new Error('Auto-grading failed');
    //             }
    //         }

    //         // 9. Delegate to ProgressTrackingService for canonical update, metrics, gamification
    //         // This will atomically update the AssignmentProgress according to policies
    //         const progressUpdateResult = await this.progressTrackingService.updateProgressFromSubmissions(
    //             progress,
    //             [gradedSubmission],
    //             session
    //         );

    //         // 10. commit transaction
    //         await this.unitOfWork.commitTransaction(session);

    //         return progressUpdateResult.updatedProgress;

    //     } catch (error) {
    //         await this.unitOfWork.rollbackTransaction(session);
    //         this.logger.error('submitSingleTask failed', { error });
    //         throw error;
    //     }
    // }

    // Batch submit many tasks - uses same sub-flow for each

    async submitTasks(
        user: UserToken,
        submissionData: any // AssignmentSubmissionDto
    ): Promise<any> {
        const assignmentId = submissionData.assignmentId;
        const session = await this.unitOfWork.beginTransaction();

        try {
            // permission checks / ABAC should happen here (optionally)
            const assignment = await this.assignmentService.getAssignmentById(assignmentId);
            if (!assignment) throw new NotFoundError('Assignment not found');

            // load tasks
            const tasks = await this.taskService.getTasksByAssignmentId(assignmentId, session);
            assignment.tasks = tasks;


            // Build a fast map for ProgressTrackingService
            const tasksById = new Map<string, Task>();
            for (const t of tasks)
                tasksById.set(t.id!, t);


            // get or create progress
            let progress = await this.progressTrackingService.getOrCreateProgress(user.id, assignmentId, session);

            // preload submissionHistory once for this user/assignment (array)
            const submissionHistory = await this.submissionRepo.findByUserAndAssignment(user.id, assignmentId, {}, session);


            // process each submission sequentially but inside same transaction
            var createdSubmissions: BaseTaskSubmission[] = [];
            for (const taskSubmissionDto of submissionData.tasks) {

                const taskId = taskSubmissionDto.taskId;
                const task = tasksById.get(taskId);

                if (!task) {
                    throw new NotFoundError(`Task ${taskSubmissionDto.taskId} not found`);
                }
                // compute attemptNumber taking into account progress and submissions created so far in this batch
                const baseAttempts = progress.tasksProgress.find(tp => tp.taskId.toString() === taskId)?.attempts || 0;
                const batchAttempts = createdSubmissions.filter(s => s.taskId === taskId).length;
                const attemptNumber = baseAttempts + batchAttempts + 1;

                // prepare ABAC context for submission-level guard (if you want attempt-limits enforced here)
                const ctx = {
                    progress,
                    assignment,
                    submittedAt: new Date(),
                    submissionHistory,    // array of previous submissions (policy expects this shape when checking attempt limits)
                    attemptNumber,
                };

                // authorize submit; use injected accessService
                await AccessService.authorize(user, 'submission', 'submit', task, ctx, { throwOnDeny: true });

                const baseSubmission: BaseTaskSubmission = {
                    userId: user.id,
                    assignmentId,
                    taskId,
                    taskType: taskSubmissionDto.taskType,
                    timeSpent: taskSubmissionDto.timeSpent || 0,
                    currentState: {
                        status: ProgressTypeEnum.IN_PROGRESS,
                        attemptNumber,
                        submittedAt: new Date(),
                        content: taskSubmissionDto.content
                    },
                    version: 1,
                    history: []
                };


                let submissionToCreate: BaseTaskSubmission;
                switch (taskSubmissionDto.taskType) {
                    case SubmissionTypeEnum.QUIZ_SUBMISSION:
                        submissionToCreate = { ...baseSubmission, taskType: SubmissionTypeEnum.QUIZ_SUBMISSION, answers: taskSubmissionDto.content?.answers || [] } as QuizSubmission;
                        break;
                    case SubmissionTypeEnum.QUESTION_SUBMISSION:
                        submissionToCreate = { ...baseSubmission, taskType: SubmissionTypeEnum.QUESTION_SUBMISSION, answer: taskSubmissionDto.content?.answer } as QuestionSubmission;
                        break;
                    case SubmissionTypeEnum.FILE_UPLOAD_SUBMISSION:
                        submissionToCreate = { ...baseSubmission, taskType: SubmissionTypeEnum.FILE_UPLOAD_SUBMISSION, fileUrls: taskSubmissionDto.content?.fileUrls || [] } as FileUploadSubmission;
                        break;
                    case SubmissionTypeEnum.CODE_SUBMISSION:
                        submissionToCreate = { ...baseSubmission, taskType: SubmissionTypeEnum.CODE_SUBMISSION, code: taskSubmissionDto.content?.code || '' } as CodeSubmission;
                        break;
                    default:
                        throw new ClientError(`Unsupported submission type: ${taskSubmissionDto.taskType}`);
                }

                let created = await this.submissionRepo.create(submissionToCreate, {}, session);

                if (this.canAutoGrade(task.taskType)) {
                    created = await this.autoGradeSubmission(created, task, session);
                    if (!created) throw new Error('Auto-grading failed for submission');
                }

                createdSubmissions.push(created);
            }

            // ----------------------------
            // progress update
            // ----------------------------
            const result = await this.progressTrackingService.updateProgressFromSubmissions(
                progress,
                createdSubmissions,
                assignment,
                tasksById,
                user,
                session
            );

            await this.unitOfWork.commitTransaction(session);
            return result.updatedProgress;
        } catch (error) {
            await this.unitOfWork.rollbackTransaction(session);
            this.logger.error('submitTasks failed', { error });
            throw error;
        }
    }

    // private async createSubmissionFromDto(
    //     userId: string,
    //     assignmentId: string,
    //     taskSubmissionDto: TaskSubmissionDto,
    //     progress: AssignmentProgress
    // ): Promise<BaseTaskSubmission> {
    //     // Common properties for all submission types
    //     const baseSubmission = {
    //         userId,
    //         assignmentId,
    //         taskId: taskSubmissionDto.taskId,
    //         timeSpent: taskSubmissionDto.timeSpent,
    //         currentState: {
    //             status: SubmissionStatus.SUBMITTED,
    //             attemptNumber: this.getNextAttemptNumber(progress, taskSubmissionDto.taskId),
    //             submittedAt: new Date(),
    //             content: taskSubmissionDto.content
    //         },
    //         version: 1,
    //         history: [] as Array<{
    //             submittedAt: Date;
    //             content: any;
    //             attemptNumber: number;
    //         }>
    //     };

    //     // Create specific submission type based on taskType
    //     switch (taskSubmissionDto.taskType) {
    //         case SubmissionTypeEnum.QUIZ_SUBMISSION:
    //             const quizContent = taskSubmissionDto.content as QuizContentDto;
    //             return {
    //                 ...baseSubmission,
    //                 taskType: SubmissionTypeEnum.QUIZ_SUBMISSION,
    //                 answers: quizContent.answers
    //             } as QuizSubmission;

    //         case SubmissionTypeEnum.QUESTION_SUBMISSION:
    //             const questionContent = taskSubmissionDto.content as QuestionContentDto;
    //             return {
    //                 ...baseSubmission,
    //                 taskType: SubmissionTypeEnum.QUESTION_SUBMISSION,
    //                 answer: questionContent.answer
    //             } as QuestionSubmission;

    //         case SubmissionTypeEnum.FILE_UPLOAD_SUBMISSION:
    //             const fileContent = taskSubmissionDto.content as FileUploadContentDto;
    //             return {
    //                 ...baseSubmission,
    //                 taskType: SubmissionTypeEnum.FILE_UPLOAD_SUBMISSION,
    //                 fileUrls: fileContent.fileUrls
    //             } as FileUploadSubmission;

    //         case SubmissionTypeEnum.CODE_SUBMISSION:
    //             const codeContent = taskSubmissionDto.content as CodeContentDto;
    //             return {
    //                 ...baseSubmission,
    //                 taskType: SubmissionTypeEnum.CODE_SUBMISSION,
    //                 code: codeContent.code
    //             } as CodeSubmission;

    //         default:
    //             throw new ClientError(`Unsupported submission type: ${taskSubmissionDto.taskType}`);
    //     }
    // }




    private getNextAttemptNumber(progress: any, taskId: string): number {
        const taskProgress = progress.tasksProgress.find((tp: any) => tp.taskId.toString() === taskId);
        return taskProgress ? (taskProgress.attempts || 0) + 1 : 1;
    }

    private canAutoGrade(taskType: TaskTypeEnum): boolean {
        return [TaskTypeEnum.QUIZ, TaskTypeEnum.QUESTION].includes(taskType);
    }

    // autoGradeSubmission (almost same as your previous, adjusted to update submission using repo)
    private async autoGradeSubmission(
        submission: BaseTaskSubmission,
        task: Task,
        session?: ClientSession
    ): Promise<BaseTaskSubmission> {
        try {
            let score = 0;
            let feedback = '';
            let isCorrect = false;

            switch (submission.taskType) {
                case SubmissionTypeEnum.QUIZ_SUBMISSION:
                    ({ score, feedback, isCorrect } = this.gradeQuizSubmission(submission, task));
                    break;
                case SubmissionTypeEnum.QUESTION_SUBMISSION:
                    ({ score, feedback, isCorrect } = this.gradeQuestionSubmission(submission, task));
                    break;
                case SubmissionTypeEnum.CODE_SUBMISSION:
                    ({ score, feedback, isCorrect } = await this.gradeCodeSubmission(submission, task));
                    break;
                default:
                    return submission;
            }

            const grade: Grade = {
                id: "",
                status: GradingStatus.GRADED,
                gradedBy: undefined as any,
                gradedAt: new Date(),
                score,
                feedback,
                version: 1,
                history: []
            };

            submission.grade = grade;
            submission.currentState.status = isCorrect ? ProgressTypeEnum.COMPLETED : ProgressTypeEnum.IN_PROGRESS;

            const updated = await this.submissionRepo.update(submission.id!, submission, session);
            if (!updated) throw new Error('Failed to persist graded submission');
            return updated;

        } catch (error) {
            this.logger.error('Auto-grading failed', { taskId: task.id, submissionId: submission.id, error });
            throw error;
        }
    }

    // grading helpers (same logic as existing)
    private gradeQuizSubmission(submission: BaseTaskSubmission, task: Task) {
        const quizContent = task.content as any;
        const answers = (submission as QuizSubmission).answers || [];
        let correctCount = 0;
        const totalQuestions = (quizContent.questions || []).length;

        answers.forEach((answer: any, index: number) => {
            const question = quizContent.questions[index];
            if (this.isAnswerCorrect(answer, question)) correctCount++;
        });

        const score = (correctCount / Math.max(totalQuestions, 1)) * (task.points || 0);
        const passing = quizContent.passingScore ?? (task.points * 0.6);
        const isCorrect = score >= passing;
        return {
            score,
            feedback: `Scored ${correctCount} out of ${totalQuestions}`,
            isCorrect
        };
    }

    private gradeQuestionSubmission(submission: BaseTaskSubmission, task: Task) {
        const answer = (submission as QuestionSubmission).answer;
        const question = task.content as any;
        const isCorrect = this.isAnswerCorrect(answer, question);
        return {
            score: isCorrect ? task.points : 0,
            feedback: isCorrect ? 'Correct' : 'Incorrect',
            isCorrect
        };
    }

    private async gradeCodeSubmission(submission: BaseTaskSubmission, task: Task) {
        return {
            score: 0,
            feedback: 'Code grading requires manual review',
            isCorrect: false
        };
    }

    private isAnswerCorrect(answer: any, question: any): boolean {
        if (!question) return false;
        switch (question.questionType) {
            case QuestionType.MULTI_CHOICE:
                const selected = new Set(answer.selectedOptionIds || []);
                const correct = (question.options || []).filter((o: any) => o.isCorrect).map((o: any) => o.id);
                if (selected.size !== correct.length) return false;
                return correct.every((id: string) => selected.has(id));
            case QuestionType.TRUE_FALSE:
                return (answer as any).answer === question.correctAnswer;
            case QuestionType.TEXT:
                return (answer as any).answer?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim();
            default:
                return false;
        }
    }




    // private async calculateProgressMetrics(progress: AssignmentProgress): Promise<any> {
    //     // Get counts
    //     const totalTasks = progress.tasksProgress.length;
    //     const tasksAttempted = progress.tasksProgress.filter(tp => tp.attempts > 0).length;
    //     const tasksCompleted = progress.tasksProgress.filter(tp => tp.status === SubmissionStatus.COMPLETED).length;
    //     const totalAttempts = progress.tasksProgress.reduce((sum, tp) => sum + tp.attempts, 0);
    //     const totalTimeSpent = progress.tasksProgress.reduce((sum, tp) => sum + (tp.timeSpent || 0), 0);

    //     // Calculate averages
    //     const avgAttempts = tasksAttempted > 0 ? totalAttempts / tasksAttempted : 0;
    //     const avgTimePerTask = tasksAttempted > 0 ? totalTimeSpent / tasksAttempted : 0;

    //     // Get all task details to calculate type-specific metrics
    //     const taskIds = progress.tasksProgress.map(tp => tp.taskId);
    //     const tasks = await Promise.all(
    //         taskIds.map(id => this.taskService.getTaskById(id.toString()))
    //     );

    //     // Calculate time spent by task type
    //     const timeByType = {} as any;
    //     const completionByType = {} as any;

    //     // Initialize counters for each task type
    //     Object.values(TaskTypeEnum).forEach(type => {
    //         timeByType[type] = 0;
    //         completionByType[type] = {
    //             attempted: 0,
    //             completed: 0
    //         };
    //     });

    //     // Aggregate metrics by task type
    //     tasks.forEach((task, index) => {
    //         const taskProgress = progress.tasksProgress[index];
    //         const type = task.taskType;

    //         // Add time spent
    //         timeByType[type] += taskProgress.timeSpent || 0;

    //         // Count attempts and completions
    //         if (taskProgress.attempts > 0) {
    //             completionByType[type].attempted++;
    //         }

    //         if (taskProgress.status === SubmissionStatus.COMPLETED) {
    //             completionByType[type].completed++;
    //         }
    //     });

    //     return {
    //         totalTasksAttempted: tasksAttempted,
    //         totalTasksCompleted: tasksCompleted,
    //         averageAttemptsPerTask: avgAttempts,
    //         averageTimePerTask: avgTimePerTask,
    //         totalTimeSpent,
    //         timeSpentByTaskType: timeByType,
    //         taskCompletionByType: completionByType
    //     };
    // }

    // private isAssignmentComplete(progress: AssignmentProgress, assignment: Assignment): boolean {
    //     const requiredTasks = assignment.tasks?.filter(task => task.requiredForCompletion) || [];

    //     // If no required tasks, can't be complete //TO-DO: FIX this logic
    //     if (requiredTasks.length === 0) {
    //         return false;
    //     }

    //     // Check if all required tasks are completed
    //     for (const task of requiredTasks) {
    //         const taskProgress = progress.tasksProgress.find(
    //             tp => tp.taskId.toString() === task.id!.toString()
    //         );

    //         if (!taskProgress || taskProgress.status !== SubmissionStatus.COMPLETED) {
    //             return false;
    //         }
    //     }

    //     return true;
    // }

    // private async gradeSubmission(user: any, assignmentId: string, gradeValue: number) {

    //     // const assignment = await AssignmentModel.findById(id);
    //     // const resource = { ...assignment, type: 'assignment' };

    //     // const enrollment = await EnrollmentModel.findOne({ userId: user.id, courseId: assignment.courseId });
    //     // const submissionHistory = await SubmissionModel.find({ userId: user.id, assignmentId: id });

    //     // await AccessService.authorize(
    //     //     user,
    //     //     'assignment',        // RBAC target
    //     //     'submit',            // RBAC action
    //     //     resource,            // ABAC resource (must include type)
    //     //     { enrollment, submissionHistory, submittedAt: new Date() }
    //     // );


    //     // // Continue if allowed
    //     // submission.grade = gradeValue;
    //     // return submission.save();
    // }

    // private checkMultiChoiceAnswer(answer: MultiChoiceAnswer, question: any): boolean {
    //     const selectedOptions = new Set(answer.selectedOptionIds);
    //     const correctOptions = question.options
    //         .filter((opt: any) => opt.isCorrect)
    //         .map((opt: any) => opt.id);

    //     // Must have the same number of selections
    //     if (selectedOptions.size !== correctOptions.length) {
    //         return false;
    //     }

    //     // All selected options must be correct
    //     return correctOptions.every(optId => selectedOptions.has(optId));
    // }

    // private checkTextAnswer(submitted: string, correct: string): boolean {
    //     // Basic exact matching (could be enhanced with fuzzy matching)
    //     return submitted.toLowerCase().trim() === correct.toLowerCase().trim();
    // }

    // private getHighestScore(current?: number, new_?: number): number | undefined {
    //     if (current === undefined) return new_;
    //     if (new_ === undefined) return current;
    //     return Math.max(current, new_);
    // }






    async updateSubmission(id: string, updateData: Partial<BaseTaskSubmission>): Promise<BaseTaskSubmission> {
        const session = await this.unitOfWork.beginTransaction();

        try {
            const existingSubmission = await this.submissionRepo.findById(id);
            if (!existingSubmission) {
                throw new NotFoundError('Submission not found');
            }

            // Store current state in history
            const updatedSubmission = {
                ...existingSubmission,
                ...updateData,
                version: existingSubmission.version + 1,
                history: [
                    ...existingSubmission.history,
                    {
                        submittedAt: existingSubmission.currentState.submittedAt,
                        content: existingSubmission.currentState.content,
                        attemptNumber: existingSubmission.currentState.attemptNumber
                    }
                ]
            };

            const result = await this.submissionRepo.update(id, updatedSubmission, session);
            if (!result) {
                throw new ServerError('Failed to update submission');
            }

            await this.unitOfWork.commitTransaction(session);
            return result;

        } catch (error) {
            await this.unitOfWork.rollbackTransaction(session);
            this.logger.error('Failed to update submission', { error });
            throw error;
        }
    }

    async getSubmissionById(id: string): Promise<BaseTaskSubmission> {
        const submission = await this.submissionRepo.findById(id);
        if (!submission) {
            throw new NotFoundError('Submission not found');
        }
        return submission;
    }

    async getSubmissionsByAssignment(assignmentId: string): Promise<BaseTaskSubmission[]> {
        return this.submissionRepo.findByAssignment(assignmentId);
    }

    async getSubmissionsByUser(userId: string): Promise<BaseTaskSubmission[]> {
        return this.submissionRepo.findByUser(userId);
    }

    async deleteSubmission(id: string): Promise<boolean> {
        const deleted = await this.submissionRepo.delete(id);
        if (!deleted) {
            throw new NotFoundError('Submission not found');
        }
        return true;
    }
}