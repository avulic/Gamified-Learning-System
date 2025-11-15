import { BaseTaskSubmission, QuizSubmission, QuestionSubmission, FileUploadSubmission, CodeSubmission, Task, QuizTaskContent, Assignment, Answer, Question, MultiChoiceAnswer, TrueFalseAnswer, TextAnswer, IGrade } from "@/models/app";
import { ClientError } from "@/models/app/Errors/ClientError";
import { NotFoundError } from "@/models/app/Errors/NotFoundError";
import { AssignmentProgress } from "@/models/app/Progress/AssignmentProgress.entity";
import { SubmissionStatus, ProgressTypeEnum, TaskTypeEnum, GradingStatus, QuestionType, SubmissionTypeEnum } from "@/models/enums";
import { MongoUnitOfWork } from "@/repository/MongoUnitOfWork";
import { SubmissionRepository } from "@/repository/SubmissionRepository";
import { TYPES } from "@/types";
import { injectable, inject } from "inversify";
import { ClientSession, Types } from "mongoose";
import { Logger } from "winston";
import AssignmentService from "./AssignmentService";
import { TaskService } from "./TaskService";
import { ServerError } from "@/models/app/Errors/ServerError";
import AssignmentProgressRepository from "@/repository/AssignmentProgressRepository";
import { AssignmentSubmissionDto, TaskSubmissionDto, QuizContentDto, QuestionContentDto, FileUploadContentDto, CodeContentDto } from "@/models/dto/request";

import { UserToken } from "@/models/app/User.entity";
import { canUnlockAssignment, evaluateSubmissionTime } from "@/access/casbin/policies/timePolicies";
import { AccessService } from "@/access/AccessService";

@injectable()
export class SubmissionService {
    constructor(
        @inject(TYPES.SubmissionRepository) private submissionRepo: SubmissionRepository,
        @inject(TYPES.AssignmentProgressRepository) private progressRepo: AssignmentProgressRepository,
        @inject(TYPES.AssignmentService) private assignmentService: AssignmentService,
        @inject(TYPES.TaskService) private taskService: TaskService,
        @inject(TYPES.MongoUnitOfWork) private unitOfWork: MongoUnitOfWork,
        @inject(TYPES.Logger) private logger: Logger
    ) { }

    async submitSingleTask(
        userId: string,
        assignmentId: string,
        taskSubmission: TaskSubmissionDto
    ): Promise<AssignmentProgress> {
        const session = await this.unitOfWork.beginTransaction();

        try {
            // 1. Validate assignment exists
            const assignment = await this.assignmentService.getAssignmentById(assignmentId);
            if (!assignment) {
                throw new NotFoundError('Assignment not found');
            }

            // 2. Get or create assignment progress
            let progress = await this.getOrCreateProgress(userId, assignmentId, session);

            // 3. Process task submission
            // Create appropriate submission entity based on task type
            const submission = await this.createSubmissionFromDto(
                userId,
                assignmentId,
                taskSubmission,
                progress
            );

            // Validate task exists
            const task = assignment.tasks?.find(t => t.id === submission.taskId);
            if (!task) {
                throw new NotFoundError(`Task ${submission.taskId} not found in assignment`);
            }

            // Check if prerequisites are completed
            await this.validatePrerequisitesCompleted(progress, task);

            // Check attempt limits
            await this.validateAttemptLimits(progress, task);

            // Create submission
            const createdSubmission = await this.submissionRepo.create(submission, {}, session);

            // Auto-grade if applicable
            if (this.canAutoGrade(task.taskType)) {
                await this.autoGradeSubmission(createdSubmission, task, session);
            }

            // 4. Update progress
            progress = await this.updateProgress(progress, [createdSubmission], session);

            await this.unitOfWork.commitTransaction(session);
            return progress;

        } catch (error) {
            await this.unitOfWork.rollbackTransaction(session);
            this.logger.error('Failed to submit task', { error });
            throw error;
        }
    }


    async submitTasks(
        user: UserToken,
        submissionData: AssignmentSubmissionDto
    ): Promise<AssignmentProgress> {
        const assignmentId = submissionData.assignmentId;
        const session = await this.unitOfWork.beginTransaction();

        try {
            const assignment = await this.assignmentService.getAssignmentById(assignmentId);
            if (!assignment) {
                throw new NotFoundError('Assignment not found');
            }



            // 3. Load user enrollment
            //const enrollment = await this.enrollmentService.getEnrollmentByUserAndCourse(user.id, assignment.courseId);
            //if (!enrollment) throw new ForbiddenError('User not enrolled in this course');

            const submissionHistory = await this.submissionRepo.findByAssignment(assignmentId);

            // This is what ABAC policies need
            // const ctx = {
            //     // enrollment,
            //     submissionHistory,
            //     submittedAt: new Date()
            // };

            // // 🔥 RBAC + ABAC check
            // await AccessService.authorize(
            //     user,
            //     'assignment',     // RBAC object
            //     'submit',         // RBAC action
            //     assignment,       // ABAC resource
            //     ctx,               // ABAC attributes
            //     { throwOnDeny: true }
            // );


            // 4. ABAC unlock rules
            // const unlock = canUnlockAssignment(enrollment, assignment, user.attrs);
            // if (!unlock.allowed) {
            //     await AuditLogModel.create({
            //         userId: user.id,
            //         action: 'submit_attempt',
            //         resourceType: 'assignment',
            //         resourceId: assignmentId,
            //         decision: 'deny',
            //         meta: { reason: unlock.reason }
            //     });
            //     throw new ForbiddenError(unlock.reason);
            // }

            // 5. Load assignment tasks
            const tasks = await this.taskService.getTasksByAssignmentId(assignmentId, session);
            assignment.tasks = tasks;

            // 6. Get or create assignment progress
            let progress = await this.getOrCreateProgress(user.id, assignmentId, session);

            // 7. Compute late penalties (ABAC time logic)
            const now = new Date();
            //const penaltyInfo = evaluateSubmissionTime(assignment, now);
            //if (!penaltyInfo.allowed) throw new ForbiddenError(penaltyInfo.reason);


            // 7. Process each task submission
            const processedSubmissions = await Promise.all(
                submissionData.tasks.map(async (taskSubmissionDto) => {
                    // Create appropriate submission entity based on task type
                    const submission = await this.createSubmissionFromDto(
                        user.id,
                        assignmentId,
                        taskSubmissionDto,
                        progress
                    );

                    // Validate task exists
                    const task = assignment.tasks?.find(t => t.id === submission.taskId);
                    if (!task) {
                        throw new NotFoundError(`Task ${submission.taskId} not found in assignment`);
                    }

                    // Check if prerequisites are completed
                    await this.validatePrerequisitesCompleted(progress, task);

                    // Check attempt limits
                    await this.validateAttemptLimits(progress, task);

                    // Create submission
                    let createdSubmission = await this.submissionRepo.create(submission, {}, session);
                    let gradedSubmission;
                    //progress.tasksProgress.find(t => t.taskId === createdSubmission.taskId.toString())!.lastSubmissionId = createdSubmission.id;


                    // Auto-grade if applicable
                    if (this.canAutoGrade(task.taskType)) {
                        gradedSubmission = await this.autoGradeSubmission(createdSubmission, task, session);
                        if (!gradedSubmission) {
                            throw new Error('Auto-grading failed');
                        }
                        createdSubmission = gradedSubmission;
                    }

                    return createdSubmission;
                })
            );

            progress = await this.updateProgress(progress, processedSubmissions, session);

            // 9. Audit success
            // await AuditLogModel.create({
            //     userId: user.id,
            //     action: 'submit',
            //     resourceType: 'assignment',
            //     resourceId: assignmentId,
            //     decision: 'allow',
            //     meta: { penalty: penaltyInfo.penaltyPct, daysLate: penaltyInfo.daysLate }
            // });


            await this.unitOfWork.commitTransaction(session);
            return progress;

        } catch (error) {
            await this.unitOfWork.rollbackTransaction(session);
            this.logger.error('Failed to submit tasks', { error });
            throw error;

        } finally {
            //await session.endSession();
        }
    }





    private async createSubmissionFromDto(
        userId: string,
        assignmentId: string,
        taskSubmissionDto: TaskSubmissionDto,
        progress: AssignmentProgress
    ): Promise<BaseTaskSubmission> {
        // Common properties for all submission types
        const baseSubmission = {
            userId,
            assignmentId,
            taskId: taskSubmissionDto.taskId,
            timeSpent: taskSubmissionDto.timeSpent,
            currentState: {
                status: SubmissionStatus.SUBMITTED,
                attemptNumber: this.getNextAttemptNumber(progress, taskSubmissionDto.taskId),
                submittedAt: new Date(),
                content: taskSubmissionDto.content
            },
            version: 1,
            history: [] as Array<{
                submittedAt: Date;
                content: any;
                attemptNumber: number;
            }>
        };

        // Create specific submission type based on taskType
        switch (taskSubmissionDto.taskType) {
            case SubmissionTypeEnum.QUIZ_SUBMISSION:
                const quizContent = taskSubmissionDto.content as QuizContentDto;
                return {
                    ...baseSubmission,
                    taskType: SubmissionTypeEnum.QUIZ_SUBMISSION,
                    answers: quizContent.answers
                } as QuizSubmission;

            case SubmissionTypeEnum.QUESTION_SUBMISSION:
                const questionContent = taskSubmissionDto.content as QuestionContentDto;
                return {
                    ...baseSubmission,
                    taskType: SubmissionTypeEnum.QUESTION_SUBMISSION,
                    answer: questionContent.answer
                } as QuestionSubmission;

            case SubmissionTypeEnum.FILE_UPLOAD_SUBMISSION:
                const fileContent = taskSubmissionDto.content as FileUploadContentDto;
                return {
                    ...baseSubmission,
                    taskType: SubmissionTypeEnum.FILE_UPLOAD_SUBMISSION,
                    fileUrls: fileContent.fileUrls
                } as FileUploadSubmission;

            case SubmissionTypeEnum.CODE_SUBMISSION:
                const codeContent = taskSubmissionDto.content as CodeContentDto;
                return {
                    ...baseSubmission,
                    taskType: SubmissionTypeEnum.CODE_SUBMISSION,
                    code: codeContent.code
                } as CodeSubmission;

            default:
                throw new ClientError(`Unsupported submission type: ${taskSubmissionDto.taskType}`);
        }
    }

    private async getOrCreateProgress(
        userId: string,
        assignmentId: string,
        session: ClientSession
    ): Promise<AssignmentProgress> {
        // Try to find existing progress
        let progress = await this.progressRepo.findByUserAndAssignment(userId, assignmentId, session);

        // If no progress exists, create a new one
        if (!progress) {
            const assignment = await this.assignmentService.getAssignmentById(assignmentId);
            const tasks = await this.taskService.getTasksByAssignmentId(assignmentId, session);

            // Initialize empty progress for each task
            const tasksProgress = tasks.map(task => ({
                taskId: task.id!,
                status: SubmissionStatus.NOT_SUBMITTED,
                attempts: 0,
                timeSpent: 0
            }));

            // Create new progress record
            const newProgress: AssignmentProgress = {
                userId,
                assignmentId,
                status: ProgressTypeEnum.IN_PROGRESS,
                startedAt: new Date(),
                lastActivityAt: new Date(),
                tasksProgress,
                metrics: {
                    totalTasksAttempted: 0,
                    totalTasksCompleted: 0,
                    averageAttemptsPerTask: 0,
                    averageTimePerTask: 0,
                    totalTimeSpent: 0,
                    timeSpentByTaskType: 0,
                    taskCompletionByType: 0
                }
            };

            progress = await this.progressRepo.create(newProgress, {}, session);
        }

        return progress;
    }

    private async validatePrerequisitesCompleted(
        progress: AssignmentProgress,
        task: Task
    ): Promise<void> {
        if (!task.prerequisites || task.prerequisites.length === 0) {
            return;
        }

        // Check each prerequisite task
        for (const prerequisiteId of task.prerequisites) {
            const prereqProgress = progress.tasksProgress.find(
                tp => tp.taskId.toString() === prerequisiteId.toString()
            );

            if (!prereqProgress || prereqProgress.status !== SubmissionStatus.COMPLETED) {
                throw new ClientError(
                    `Prerequisite task ${prerequisiteId} must be completed before attempting this task`
                );
            }
        }
    }

    private async validateAttemptLimits(
        progress: AssignmentProgress,
        task: Task
    ): Promise<void> {
        // Find task progress
        const taskProgress = progress.tasksProgress.find(
            tp => tp.taskId.toString() === task.id!.toString()
        );

        // No attempts yet
        if (!taskProgress) {
            return;
        }

        // Check if max attempts is set and reached
        const maxAttempts = task.maxAttempts || -1; // -1 for unlimited
        if (maxAttempts > 0 && taskProgress.attempts >= maxAttempts) {
            throw new ClientError(
                `Maximum number of attempts (${maxAttempts}) reached for this task`
            );
        }

        // For quizzes, check quiz-specific attempt limit
        if (task.taskType === TaskTypeEnum.QUIZ) {
            const quizContent = task.content as QuizTaskContent;
            if (
                quizContent.maxAttempts &&
                quizContent.maxAttempts > 0 &&
                taskProgress.attempts >= quizContent.maxAttempts
            ) {
                throw new ClientError(
                    `Maximum number of quiz attempts (${quizContent.maxAttempts}) reached`
                );
            }
        }
    }

    private getNextAttemptNumber(progress: AssignmentProgress, taskId: string): number {
        const taskProgress = progress.tasksProgress.find(
            tp => tp.taskId.toString() === taskId
        );

        return taskProgress ? taskProgress.attempts + 1 : 1;
    }

    private async updateProgress(
        progress: AssignmentProgress,
        submissions: BaseTaskSubmission[],
        session: ClientSession
    ): Promise<AssignmentProgress> {
        const now = new Date();

        // Update task progress for each submission
        for (const submission of submissions) {
            const taskIndex = progress.tasksProgress.findIndex(
                tp => tp.taskId.toString() === submission.taskId.toString()
            );

            if (taskIndex >= 0) {
                // Update existing task progress
                const taskProgress = progress.tasksProgress[taskIndex];

                // Update task progress
                progress.tasksProgress[taskIndex] = {
                    ...taskProgress,
                    status: submission.currentState.status,
                    attempts: submission.currentState.attemptNumber,
                    lastSubmissionId: submission.id,
                    lastAttemptAt: now,
                    firstAttemptAt: taskProgress.firstAttemptAt || now,
                    // If there's grading information, update score
                    ...(submission.grade && { bestScore: this.getHighestScore(taskProgress.bestScore, submission.grade.score) })
                };
            } else {
                // Add new task progress
                progress.tasksProgress.push({
                    taskId: submission.taskId,
                    status: submission.currentState.status,
                    attempts: 1,
                    lastSubmissionId: submission.id,
                    firstAttemptAt: now,
                    lastAttemptAt: now,
                    timeSpent: 0,
                    ...(submission.grade && { bestScore: submission.grade.score })
                });
            }
        }

        // Update progress metadata
        progress.lastActivityAt = now;

        // Calculate all metrics
        progress.metrics = await this.calculateProgressMetrics(progress);

        // Check if assignment is now complete
        const assignment = await this.assignmentService.getAssignmentById(progress.assignmentId);
        if (this.isAssignmentComplete(progress, assignment)) {
            progress.status = ProgressTypeEnum.COMPLETED;
            progress.completedAt = now;
        }

        const updatedAssignmentProgress = await this.progressRepo.update(progress.id!, progress, session);
        if (!updatedAssignmentProgress) {
            throw new Error('Failed to update assignment progress');
        }
        return updatedAssignmentProgress;
    }

    private async calculateProgressMetrics(progress: AssignmentProgress): Promise<any> {
        // Get counts
        const totalTasks = progress.tasksProgress.length;
        const tasksAttempted = progress.tasksProgress.filter(tp => tp.attempts > 0).length;
        const tasksCompleted = progress.tasksProgress.filter(tp => tp.status === SubmissionStatus.COMPLETED).length;
        const totalAttempts = progress.tasksProgress.reduce((sum, tp) => sum + tp.attempts, 0);
        const totalTimeSpent = progress.tasksProgress.reduce((sum, tp) => sum + (tp.timeSpent || 0), 0);

        // Calculate averages
        const avgAttempts = tasksAttempted > 0 ? totalAttempts / tasksAttempted : 0;
        const avgTimePerTask = tasksAttempted > 0 ? totalTimeSpent / tasksAttempted : 0;

        // Get all task details to calculate type-specific metrics
        const taskIds = progress.tasksProgress.map(tp => tp.taskId);
        const tasks = await Promise.all(
            taskIds.map(id => this.taskService.getTaskById(id.toString()))
        );

        // Calculate time spent by task type
        const timeByType = {} as any;
        const completionByType = {} as any;

        // Initialize counters for each task type
        Object.values(TaskTypeEnum).forEach(type => {
            timeByType[type] = 0;
            completionByType[type] = {
                attempted: 0,
                completed: 0
            };
        });

        // Aggregate metrics by task type
        tasks.forEach((task, index) => {
            const taskProgress = progress.tasksProgress[index];
            const type = task.taskType;

            // Add time spent
            timeByType[type] += taskProgress.timeSpent || 0;

            // Count attempts and completions
            if (taskProgress.attempts > 0) {
                completionByType[type].attempted++;
            }

            if (taskProgress.status === SubmissionStatus.COMPLETED) {
                completionByType[type].completed++;
            }
        });

        return {
            totalTasksAttempted: tasksAttempted,
            totalTasksCompleted: tasksCompleted,
            averageAttemptsPerTask: avgAttempts,
            averageTimePerTask: avgTimePerTask,
            totalTimeSpent,
            timeSpentByTaskType: timeByType,
            taskCompletionByType: completionByType
        };
    }

    private isAssignmentComplete(progress: AssignmentProgress, assignment: Assignment): boolean {
        const requiredTasks = assignment.tasks?.filter(task => task.requiredForCompletion) || [];

        // If no required tasks, can't be complete //TO-DO: FIX this logic
        if (requiredTasks.length === 0) {
            return false;
        }

        // Check if all required tasks are completed
        for (const task of requiredTasks) {
            const taskProgress = progress.tasksProgress.find(
                tp => tp.taskId.toString() === task.id!.toString()
            );

            if (!taskProgress || taskProgress.status !== SubmissionStatus.COMPLETED) {
                return false;
            }
        }

        return true;
    }



    private async gradeSubmission(user: any, assignmentId: string, gradeValue: number) {

        // const assignment = await AssignmentModel.findById(id);
        // const resource = { ...assignment, type: 'assignment' };

        // const enrollment = await EnrollmentModel.findOne({ userId: user.id, courseId: assignment.courseId });
        // const submissionHistory = await SubmissionModel.find({ userId: user.id, assignmentId: id });

        // await AccessService.authorize(
        //     user,
        //     'assignment',        // RBAC target
        //     'submit',            // RBAC action
        //     resource,            // ABAC resource (must include type)
        //     { enrollment, submissionHistory, submittedAt: new Date() }
        // );


        // // Continue if allowed
        // submission.grade = gradeValue;
        // return submission.save();
    }


    private async autoGradeSubmission(
        submission: BaseTaskSubmission,
        task: Task,
        session: ClientSession
    ): Promise<BaseTaskSubmission | null> {
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
                    return null; // Not auto-gradable
            }

            // Create grade record
            const grade: IGrade = {
                status: GradingStatus.GRADED,
                gradedAt: new Date(),
                score,
                feedback,
                version: 1,
                history: [],
                id: ""
            };

            // Save grade
            //const savedGrade = await this.gradeRepo.create(grade, {}, session);

            // Update submission with grade reference and status
            submission.grade = grade;
            submission.currentState.status = isCorrect
                ? SubmissionStatus.COMPLETED
                : SubmissionStatus.SUBMITTED;

            // Update submission
            return await this.submissionRepo.update(submission.id!, submission, session);

        } catch (error) {
            this.logger.error('Auto-grading failed', {
                taskId: task.id,
                submissionId: submission.id,
                error
            });
            throw error;
        }
    }

    private canAutoGrade(taskType: TaskTypeEnum): boolean {
        return [
            TaskTypeEnum.QUIZ,
            TaskTypeEnum.QUESTION
        ].includes(taskType);
    }

    private gradeQuizSubmission(
        submission: BaseTaskSubmission,
        task: Task
    ): { score: number; feedback: string; isCorrect: boolean } {
        const quizContent = task.content as QuizTaskContent;
        const answers = (submission as QuizSubmission).answers;

        let correctCount = 0;
        let totalQuestions = quizContent.questions.length;

        // Grade each answer
        answers.forEach((answer: Answer, index: number) => {
            const question = quizContent.questions[index];
            if (this.isAnswerCorrect(answer, question)) {
                correctCount++;
            }
        });

        const score = (correctCount / totalQuestions) * task.points;
        const isCorrect = score >= (quizContent.passingScore || (task.points * 0.6)); // Default 60% passing

        return {
            score,
            feedback: `Scored ${correctCount} out of ${totalQuestions} questions correctly (${Math.round(score * 100 / task.points)}%)`,
            isCorrect
        };
    }

    private gradeQuestionSubmission(
        submission: BaseTaskSubmission,
        task: Task
    ): { score: number; feedback: string; isCorrect: boolean } {
        const answer = (submission as QuestionSubmission).answer;
        const question = task.content as Question;
        const isCorrect = this.isAnswerCorrect(answer, question);

        return {
            score: isCorrect ? task.points : 0,
            feedback: isCorrect ? 'Correct answer' : 'Incorrect answer',
            isCorrect
        };
    }

    private async gradeCodeSubmission(
        submission: BaseTaskSubmission,
        task: Task
    ): Promise<{ score: number; feedback: string; isCorrect: boolean }> {
        // TODO - This would connect to a code execution service

        return {
            score: 0,
            feedback: 'Code grading requires manual review',
            isCorrect: false
        };
    }



    private isAnswerCorrect(answer: Answer, question: any): boolean {
        switch (question.questionType) {
            case QuestionType.MULTI_CHOICE:
                return this.checkMultiChoiceAnswer(answer as MultiChoiceAnswer, question);
            case QuestionType.TRUE_FALSE:
                return (answer as TrueFalseAnswer).answer === question.correctAnswer;
            case QuestionType.TEXT:
                return this.checkTextAnswer((answer as TextAnswer).answer, question.correctAnswer);
            default:
                return false;
        }
    }

    private checkMultiChoiceAnswer(answer: MultiChoiceAnswer, question: any): boolean {
        const selectedOptions = new Set(answer.selectedOptionIds);
        const correctOptions = question.options
            .filter((opt: any) => opt.isCorrect)
            .map((opt: any) => opt.id);

        // Must have the same number of selections
        if (selectedOptions.size !== correctOptions.length) {
            return false;
        }

        // All selected options must be correct
        return correctOptions.every(optId => selectedOptions.has(optId));
    }

    private checkTextAnswer(submitted: string, correct: string): boolean {
        // Basic exact matching (could be enhanced with fuzzy matching)
        return submitted.toLowerCase().trim() === correct.toLowerCase().trim();
    }

    private getHighestScore(current?: number, new_?: number): number | undefined {
        if (current === undefined) return new_;
        if (new_ === undefined) return current;
        return Math.max(current, new_);
    }






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