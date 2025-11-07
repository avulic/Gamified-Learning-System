import { Container } from 'inversify';
import { Types } from 'mongoose';
import { TYPES } from '@/types';
import { CourseService } from '@/services/CourseService';
import { ModuleService } from '@/services/ModuleService';
import { FileService } from '@/services/FileService';
import { AssignmentService } from '@/services/AssignmentService';
import { Course, Module, Assignment, Task, BaseTask, FileUploadTask, QuestionTask, TrueFalseQuestion, 
    MultiChoiceQuestion, TextQuestion, CodeSubmission, QuizTask, CodeTask, BaseTaskSubmission, FileUploadSubmission, QuizSubmission } from '@/models/app';
import { ParentType } from '@/models/app/Assignment.entity';
import { TestMocks, setupTestContainer } from '@/__tests__/testContainer';
import { TaskTypeEnum, ProgressTypeEnum, QuestionType, GradingStatus, SubmissionStatus, SubmissionTypeEnum } from '@/models/enums';
import { TaskService } from '@/services/TaskService';
import { SubmissionService } from '@/services/SubmissionService';

describe('Service Layer Tests', () => {
    let container: Container;
    let mocks: TestMocks;
    let courseService: CourseService;
    let moduleService: ModuleService;
    let assignmentService: AssignmentService;
    let submissionService: SubmissionService;
    let taskService: TaskService;

    beforeEach(async () => {
        ({container, mocks}  = await setupTestContainer());
        courseService = container.get(TYPES.CourseService);
        moduleService = container.get(TYPES.ModuleService);
        assignmentService = container.get(TYPES.AssignmentService);
        taskService = container.get(TYPES.TaskService);
    });

    describe('CourseService', () => {
        const mockCourse = {
            title: 'Test Course',
            description: 'Test Description',
            categories: ['Programming'],
            enrollmentCode: 'TEST123',
            xpReward: 100
        } as Course;

        describe('createCourse', () => {
            it('should create a course successfully', async () => {
                const courseWithId = { ...mockCourse, id: new Types.ObjectId().toString() };
                mocks.courseRepository.create.mockResolvedValue(courseWithId);

                const result = await courseService.createCourse(mockCourse);

                expect(result).toBeDefined();
                expect(result.title).toBe(mockCourse.title);
                expect(mocks.courseRepository.create).toHaveBeenCalledWith(mockCourse);
            });

            it('should handle creation error', async () => {
                mocks.courseRepository.create.mockRejectedValue(new Error('Creation failed'));
                await expect(courseService.createCourse(mockCourse)).rejects.toThrow('Creation failed');
            });
        });

        describe('findOperations', () => {
            it('should find course by id', async () => {
                const courseId = new Types.ObjectId().toString();
                const course = { ...mockCourse, id: courseId };
                mocks.courseRepository.findById.mockResolvedValue(course);

                const result = await courseService.getCourseById(courseId);

                expect(result).toBeDefined();
                expect(result.id).toBe(courseId);
            });

            it('should find all courses', async () => {
                const courses = [
                    { ...mockCourse, id: new Types.ObjectId().toString() },
                    { ...mockCourse, id: new Types.ObjectId().toString(), title: 'Course 2' }
                ];
                mocks.courseRepository.findAll.mockResolvedValue(courses);

                const result = await courseService.getAllCourses();

                expect(result).toHaveLength(2);
                expect(mocks.courseRepository.findAll).toHaveBeenCalled();
            });
        });
    });

    describe('ModuleService', () => {
        const mockModule = {
            title: 'Test Module',
            description: 'Test Description',
            order: 1,
            courseId: new Types.ObjectId().toString()
        } as Module;

        describe('createModule', () => {
            it('should create a module successfully', async () => {
                const moduleWithId = { ...mockModule, id: new Types.ObjectId().toString() };
                mocks.moduleRepository.create.mockResolvedValue(moduleWithId);

                const result = await moduleService.createModule(mockModule);

                expect(result).toBeDefined();
                expect(result.title).toBe(mockModule.title);
                expect(mocks.moduleRepository.create).toHaveBeenCalledWith(mockModule);
            });

            it('should handle creation error', async () => {
                mocks.moduleRepository.create.mockRejectedValue(new Error('Creation failed'));
                await expect(moduleService.createModule(mockModule)).rejects.toThrow('Creation failed');
            });
        });

        describe('findOperations', () => {
            it('should find module by id', async () => {
                const moduleId = new Types.ObjectId().toString();
                const module = { ...mockModule, id: moduleId };
                mocks.moduleRepository.findById.mockResolvedValue(module);

                const result = await moduleService.getModuleById(moduleId);

                expect(result).toBeDefined();
                expect(result.id).toBe(moduleId);
            });

            it('should find all modules', async () => {
                const modules = [
                    { ...mockModule, id: new Types.ObjectId().toString() },
                    { ...mockModule, id: new Types.ObjectId().toString(), title: 'Module 2' }
                ];
                mocks.moduleRepository.findAll.mockResolvedValue(modules);

                const result = await moduleService.getAllModules();

                expect(result).toHaveLength(2);
                expect(mocks.moduleRepository.findAll).toHaveBeenCalled();
            });
        });
    });

    describe('AssignmentService', () => {
        const mockAssignment: Assignment = {
            title: 'Test Assignment',
            description: 'Test Description',
            parentType: ParentType.COURSE,
            parentId: new Types.ObjectId().toString(),
            createdBy: new Types.ObjectId().toString(),
            tasks: [],
            rubric: {
                criteria: [{
                    criterion: 'Test Criterion',
                    points: 10
                }]
            },
            peerReviewSettings: {
                enabled: false,
                reviewsPerStudent: 0,
                dueDate: new Date()
            },
            submissionWindow: {
                start: new Date(),
                end: new Date(),
                allowLateSubmissions: false,
                lateSubmissionPenalty: 0
            },
            maxAttempts: 1,
            passingScore: 100,
            points: 100
        };

        describe('createAssignment', () => {
            it('should create an assignment successfully', async () => {
                const assignmentId = new Types.ObjectId().toString();
                const assignmentWithId = { ...mockAssignment, id: assignmentId };
                mocks.assignmentRepository.create.mockResolvedValue(assignmentWithId);

                const result: Assignment = await assignmentService.createAssignment(assignmentWithId);

                expect(result).toBeDefined();
                expect(result.title).toBe(mockAssignment.title);
                expect(mocks.assignmentRepository.create).toHaveBeenCalledTimes(1);
                expect(mocks.assignmentRepository.create).toHaveBeenCalledWith(assignmentWithId, {});
            });

            it('should handle creation error', async () => {
                const assignmentWithEmptyId = { ...mockAssignment, id: "" };
                mocks.assignmentRepository.create.mockRejectedValue(new Error('Creation failed'));
                await expect(assignmentService.createAssignment(assignmentWithEmptyId)).rejects.toThrow('Creation failed');
            });
        });

        describe('findOperations', () => {
            it('should find assignment by id', async () => {
                const assignmentId = new Types.ObjectId().toString();
                const assignment = { ...mockAssignment, id: assignmentId };
                mocks.assignmentRepository.findById.mockResolvedValue(assignment);

                const result = await assignmentService.getAssignmentById(assignmentId);

                expect(result).toBeDefined();
                expect(result.id).toBe(assignmentId);
            });

            it('should find all assignments', async () => {
                const assignments = [
                    { ...mockAssignment, id: new Types.ObjectId().toString() },
                    { ...mockAssignment, id: new Types.ObjectId().toString(), title: 'Assignment 2' }
                ];
                mocks.assignmentRepository.findAll.mockResolvedValue(assignments);

                const result = await assignmentService.getAllAssignments();

                expect(result).toHaveLength(2);
                expect(mocks.assignmentRepository.findAll).toHaveBeenCalled();
            });
        });
    });


    describe('TaskService Type-Specific Tests', () => {
        const assignmentId = new Types.ObjectId().toString();

        // Base task properties that all tasks share
        const baseTaskProps: BaseTask = {
            title: 'Test Task',
            description: 'Test Description',
            points: 10,
            order: 1,
            xpReward: 100,
            requiredForCompletion: true,
            assignmentId,
            taskType: TaskTypeEnum.FILE_UPLOAD,
            submissionWindow: {
                start: new Date(),
                end: new Date(Date.now() + 24 * 60 * 60 * 1000),
                allowLateSubmissions: false,
                lateSubmissionPenalty: 0.01  // percentage
            }
        };

        describe('File Upload Task', () => {
            it('should create a file upload task', async () => {
                const fileUploadTask: FileUploadTask = {
                    ...baseTaskProps,
                    taskType: TaskTypeEnum.FILE_UPLOAD,
                    content: {
                        allowedFileTypes: ['.pdf', '.doc'],
                        maxFileSize: 5242880 // 5MB
                    }
                };

                const taskWithId = {
                    ...fileUploadTask,
                    id: new Types.ObjectId().toString()
                };
                mocks.taskRepository.create.mockResolvedValue(taskWithId);

                const result = await taskService.createTask(assignmentId, fileUploadTask) as FileUploadTask;

                expect(result.taskType).toBe(TaskTypeEnum.FILE_UPLOAD);
                expect(result.content.allowedFileTypes).toEqual(['.pdf', '.doc']);
                expect(result.content.maxFileSize).toBe(5242880);
            });
        });

        describe('Question Tasks', () => {
            it('should create a multiple choice question task', async () => {
                const multiChoiceTask: QuestionTask = {
                    ...baseTaskProps,
                    taskType: TaskTypeEnum.QUESTION,
                    content: {
                        question: 'What is 2+2?',
                        questionType: QuestionType.MULTI_CHOICE,
                        options: [
                            { text: '3', isCorrect: false },
                            { text: '4', isCorrect: true },
                            { text: '5', isCorrect: false }
                        ]
                    }
                };

                const taskWithId = {
                    ...multiChoiceTask,
                    id: new Types.ObjectId().toString()
                };
                mocks.taskRepository.create.mockResolvedValue(taskWithId);

                const result = await taskService.createTask(assignmentId, multiChoiceTask) as QuestionTask;

                expect(result.taskType).toBe(TaskTypeEnum.QUESTION);
                expect(result.content.questionType).toBe(QuestionType.MULTI_CHOICE);
                expect((result.content as MultiChoiceQuestion).options).toHaveLength(3);
                expect((result.content as MultiChoiceQuestion).options.filter(opt => opt.isCorrect)).toHaveLength(1);
            });

            it('should create a true/false question task', async () => {
                const trueFalseTask: QuestionTask = {
                    ...baseTaskProps,
                    taskType: TaskTypeEnum.QUESTION,
                    content: {
                        question: 'Is JavaScript a compiled language?',
                        questionType: QuestionType.TRUE_FALSE,
                        correctAnswer: false
                    } as TrueFalseQuestion
                };

                const taskWithId = {
                    ...trueFalseTask,
                    id: new Types.ObjectId().toString()
                };
                mocks.taskRepository.create.mockResolvedValue(taskWithId);

                const result = await taskService.createTask(assignmentId, trueFalseTask) as QuestionTask;

                expect(result.taskType).toBe(TaskTypeEnum.QUESTION);
                expect(result.content.questionType).toBe(QuestionType.TRUE_FALSE);
                expect((result.content as TrueFalseQuestion).correctAnswer).toBe(false);
            });

            it('should create a text question task', async () => {
                const textTask: QuestionTask = {
                    ...baseTaskProps,
                    taskType: TaskTypeEnum.QUESTION,
                    content: {
                        question: 'What is the capital of France?',
                        questionType: QuestionType.TEXT,
                        correctAnswer: 'Paris'
                    }
                };

                const taskWithId = {
                    ...textTask,
                    id: new Types.ObjectId().toString()
                };
                mocks.taskRepository.create.mockResolvedValue(taskWithId);

                const result = await taskService.createTask(assignmentId, textTask) as QuestionTask;

                expect(result.taskType).toBe(TaskTypeEnum.QUESTION);
                expect(result.content.questionType).toBe(QuestionType.TEXT);
                expect((result.content as TextQuestion).correctAnswer).toBe('Paris');
            });
        });

        describe('Code Task', () => {
            it('should create a code task', async () => {
                const codeTask: CodeTask = {
                    ...baseTaskProps,
                    taskType: TaskTypeEnum.CODE,
                    content: {
                        language: 'python',
                        question: 'Write a function that adds two numbers',
                        initialCode: 'def add(a, b):',
                        testCases: [
                            {
                                input: '2, 3',
                                expectedOutput: '5',
                                isHidden: false
                            },
                            {
                                input: '0, 0',
                                expectedOutput: '0',
                                isHidden: true
                            }
                        ]
                    }
                };

                const taskWithId = {
                    ...codeTask,
                    id: new Types.ObjectId().toString()
                };
                mocks.taskRepository.create.mockResolvedValue(taskWithId);

                const result = await taskService.createTask(assignmentId, codeTask) as CodeTask;

                expect(result.taskType).toBe(TaskTypeEnum.CODE);
                expect(result.content.language).toBe('python');
                expect(result.content.testCases).toHaveLength(2);
                expect(result.content.testCases[0].isHidden).toBe(false);
                expect(result.content.testCases[1].isHidden).toBe(true);
            });
        });

        describe('Quiz Task', () => {
            it('should create a quiz task with multiple question types', async () => {
                const quizTask: QuizTask = {
                    ...baseTaskProps,
                    taskType: TaskTypeEnum.QUIZ,
                    content: {
                        questions: [
                            {
                                question: 'What is 2+2?',
                                questionType: QuestionType.MULTI_CHOICE,
                                options: [
                                    { text: '3', isCorrect: false },
                                    { text: '4', isCorrect: true },
                                    { text: '5', isCorrect: false }
                                ]
                            },
                            {
                                question: 'Is Python interpreted?',
                                questionType: QuestionType.TRUE_FALSE,
                                correctAnswer: true
                            },
                            {
                                question: 'What does SQL stand for?',
                                questionType: QuestionType.TEXT,
                                correctAnswer: 'Structured Query Language'
                            }
                        ],
                        timeLimit: 1800, // 30 minutes
                        passingScore: 70,
                        maxAttempts: 2
                    }
                };

                const taskWithId = {
                    ...quizTask,
                    id: new Types.ObjectId().toString()
                };
                mocks.taskRepository.create.mockResolvedValue(taskWithId);

                const result = await taskService.createTask(assignmentId, quizTask) as QuizTask;

                expect(result.taskType).toBe(TaskTypeEnum.QUIZ);
                expect(result.content.questions).toHaveLength(3);
                expect(result.content.questions[0].questionType).toBe(QuestionType.MULTI_CHOICE);
                expect(result.content.questions[1].questionType).toBe(QuestionType.TRUE_FALSE);
                expect(result.content.questions[2].questionType).toBe(QuestionType.TEXT);
                expect(result.content.timeLimit).toBe(1800);
                expect(result.content.passingScore).toBe(70);
                expect(result.content.maxAttempts).toBe(2);
            });
        });

        describe('Error Handling for Different Task Types', () => {
            it('should handle invalid multiple choice question (no correct answer)', async () => {
                const invalidMultiChoiceTask: Task = {
                    ...baseTaskProps,
                    taskType: TaskTypeEnum.QUESTION,
                    content: {
                        question: 'What is 2+2?',
                        questionType: QuestionType.MULTI_CHOICE,
                        options: [
                            { text: '3', isCorrect: false },
                            { text: '4', isCorrect: false },
                            { text: '5', isCorrect: false }
                        ]
                    }
                };

                mocks.taskRepository.create.mockRejectedValue(
                    new Error('At least one option must be marked as correct')
                );

                await expect(taskService.createTask(assignmentId, invalidMultiChoiceTask))
                    .rejects.toThrow('At least one option must be marked as correct');
            });

            it('should handle invalid code task (no test cases)', async () => {
                const invalidCodeTask: Task = {
                    ...baseTaskProps,
                    taskType: TaskTypeEnum.CODE,
                    content: {
                        language: 'python',
                        question: 'Write a function',
                        testCases: []
                    }
                };

                mocks.taskRepository.create.mockRejectedValue(
                    new Error('At least one test case is required')
                );

                await expect(taskService.createTask(assignmentId, invalidCodeTask))
                    .rejects.toThrow('At least one test case is required');
            });
        });
    });



    // describe('SubmissionService Tests', () => {
    //     let submissionService: SubmissionService;
    //     const userId = new Types.ObjectId().toString();
    //     const assignmentId = new Types.ObjectId().toString();

    //     beforeEach(async () => {
    //         submissionService = container.get(TYPES.SubmissionService);
    //         mocks.unitOfWork.beginTransaction.mockResolvedValue({} as any);
    //     });

    //     const mockAssignment: Assignment = {
    //         id: assignmentId,
    //         title: 'Test Assignment',
    //         description: 'Test Description',
    //         dueDate: new Date(),
    //         tasks: [],
    //         submissionWindow: {
    //             start: new Date(),
    //             end: new Date(),
    //             allowLateSubmissions: false,
    //             lateSubmissionPenalty: 0
    //         },
    //         parentType: ParentType.COURSE,
    //         parentId: new Types.ObjectId().toString(),
    //         createdBy: new Types.ObjectId().toString(),
    //         rubric: {
    //             criteria: [{
    //                 criterion: 'Test Criterion',
    //                 points: 10
    //             }]
    //         },
    //         peerReviewSettings: {
    //             enabled: false,
    //             reviewsPerStudent: 0,
    //             dueDate: new Date()
    //         },
    //         maxAttempts: 1,
    //         passingScore: 100,
    //         points: 100,
    //         timeLimit: 60
    //     } as Assignment;

    //     describe('createSubmission', () => {
    //         describe('Quiz Submission', () => {
    //             const mockQuizTask: QuizTask = {
    //                 id: new Types.ObjectId().toString(),
    //                 taskType: TaskTypeEnum.QUIZ,
    //                 points: 10,
    //                 content: {
    //                     questions: [
    //                         {
    //                             questionType: QuestionType.MULTI_CHOICE,
    //                             options: [
    //                                 { text: 'Option 1', isCorrect: true },
    //                                 { text: 'Option 2', isCorrect: false }
    //                             ]
    //                         }
    //                     ]
    //                 }
    //             } as QuizTask;

    //             it('should create a valid quiz submission', async () => {
    //                 const quizSubmission: QuizSubmission = {
    //                     userId,
    //                     assignmentId,
    //                     taskId: mockQuizTask.id!,
    //                     taskType: SubmissionTypeEnum.QUIZ_SUBMISSION,
    //                     currentState: {
    //                         status: SubmissionStatus.SUBMITTED,
    //                         attemptNumber: 1,
    //                         submittedAt: new Date(),
    //                         content: {
    //                             answers: [{
    //                                 questionType: QuestionType.MULTI_CHOICE,
    //                                 selectedOptionIds: ['option1']
    //                             }]
    //                         }
    //                     }
    //                 } as QuizSubmission;

    //                 mockAssignment.tasks = [mockQuizTask];
    //                 if (!mockAssignment.id)
    //                     mockAssignment.id = new Types.ObjectId().toString();

    //                 mocks.assignmentRepository.findById.mockResolvedValue({ ...mockAssignment });
    //                 mocks.submissionRepository.create.mockResolvedValue({ ...quizSubmission, id: new Types.ObjectId().toString() });

    //                 const result = await submissionService.createSubmission(quizSubmission);

    //                 expect(result).toBeDefined();
    //                 expect(result.taskType).toBe(TaskTypeEnum.QUIZ);
    //                 expect(result.currentState.status).toBe(SubmissionStatus.SUBMITTED);
    //                 expect(mocks.submissionRepository.create).toHaveBeenCalled();
    //             });

              
    //         });

    //         describe('File Upload Submission', () => {
    //             const mockFileTask: FileUploadTask = {
    //                 id: new Types.ObjectId().toString(),
    //                 taskType: TaskTypeEnum.FILE_UPLOAD,
    //                 points: 10,
    //                 content: {
    //                     allowedFileTypes: ['.pdf'],
    //                     maxFileSize: 5242880
    //                 }
    //             } as FileUploadTask;

    //             it('should create a valid file upload submission', async () => {
    //                 const fileSubmission: FileUploadSubmission = {
    //                     userId,
    //                     assignmentId,
    //                     taskId: mockFileTask.id!,
    //                     taskType: TaskTypeEnum.FILE_UPLOAD,
    //                     currentState: {
    //                         status: SubmissionStatus.SUBMITTED,
    //                         attemptNumber: 1,
    //                         submittedAt: new Date(),
    //                         content: {
    //                             fileUrls: ['https://example.com/file.pdf']
    //                         }
    //                     }
    //                 } as FileUploadSubmission;

    //                 mockAssignment.tasks = [mockFileTask];
    //                 if (!mockAssignment.id)
    //                     mockAssignment.id = new Types.ObjectId().toString();
    //                 mocks.assignmentRepository.findById.mockResolvedValue({ ...mockAssignment });

    //                 mocks.submissionRepository.create.mockResolvedValue({ ...fileSubmission, id: new Types.ObjectId().toString() });

    //                 const result = await submissionService.createSubmission(fileSubmission);

    //                 expect(result).toBeDefined();
    //                 expect(result.taskType).toBe(TaskTypeEnum.FILE_UPLOAD);
    //                 expect(result.currentState.content.fileUrls).toHaveLength(1);
    //             });

    //             it('should reject submission with no files', async () => {
    //                 const invalidSubmission: FileUploadSubmission = {
    //                     userId,
    //                     assignmentId,
    //                     taskId: mockFileTask.id!,
    //                     taskType: TaskTypeEnum.FILE_UPLOAD,
    //                     currentState: {
    //                         status: SubmissionStatus.SUBMITTED,
    //                         attemptNumber: 1,
    //                         submittedAt: new Date(),
    //                         content: {
    //                             fileUrls: []
    //                         }
    //                     }
    //                 } as FileUploadSubmission;

    //                 mockAssignment.tasks = [mockFileTask];
    //                 if (!mockAssignment.id)
    //                     mockAssignment.id = new Types.ObjectId().toString();
    //                 mocks.assignmentRepository.findById.mockResolvedValue({ ...mockAssignment });

    //                 await expect(submissionService.createSubmission(invalidSubmission))
    //                     .rejects.toThrow('At least one file must be uploaded');
    //             });
    //         });
    //     });

    //     describe('findSubmission', () => {
    //         const mockSubmission: BaseTaskSubmission = {
    //             id: new Types.ObjectId().toString(),
    //             userId,
    //             assignmentId,
    //             taskId: new Types.ObjectId().toString(),
    //             taskType: TaskTypeEnum.QUIZ,
    //             currentState: {
    //                 status: SubmissionStatus.SUBMITTED,
    //                 attemptNumber: 1,
    //                 submittedAt: new Date(),
    //                 content: {}
    //             },
    //             grading: {
    //                 status: GradingStatus.NOT_GRADED
    //             }
    //         } as BaseTaskSubmission;

    //         it('should find submission by id', async () => {
    //             mocks.submissionRepository.findById.mockResolvedValue(mockSubmission);

    //             const result = await submissionService.getSubmissionById(mockSubmission.id!);

    //             expect(result).toBeDefined();
    //             expect(result.id).toBe(mockSubmission.id);
    //             expect(mocks.submissionRepository.findById).toHaveBeenCalledWith(mockSubmission.id);
    //         });

    //         it('should throw NotFoundError for non-existent submission', async () => {
    //             mocks.submissionRepository.findById.mockResolvedValue(null);

    //             await expect(submissionService.getSubmissionById('non-existent-id'))
    //                 .rejects.toThrow('Submission not found');
    //         });

    //         it('should find submissions by assignment', async () => {
    //             const submissions = [
    //                 mockSubmission,
    //                 { ...mockSubmission, id: new Types.ObjectId().toString() }
    //             ];
    //             mocks.submissionRepository.findByAssignment.mockResolvedValue(submissions);

    //             const result = await submissionService.getSubmissionsByAssignment(assignmentId);

    //             expect(result).toHaveLength(2);
    //             expect(mocks.submissionRepository.findByAssignment).toHaveBeenCalledWith(assignmentId);
    //         });

    //         it('should find submissions by user', async () => {
    //             const submissions = [
    //                 mockSubmission,
    //                 { ...mockSubmission, id: new Types.ObjectId().toString() }
    //             ];
    //             mocks.submissionRepository.findByUser.mockResolvedValue(submissions);

    //             const result = await submissionService.getSubmissionsByUser(userId);

    //             expect(result).toHaveLength(2);
    //             expect(mocks.submissionRepository.findByUser).toHaveBeenCalledWith(userId);
    //         });
    //     });
    // });
});



