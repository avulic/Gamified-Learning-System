import { Course, Assignment, BaseTask, FileUploadTask, Role, User, Module, File, MultiChoiceAnswer, MultiChoiceQuestion, Question, QuizSubmission, TextAnswer, TextQuestion, CodeTask, QuestionTask, QuizTask, Task, FileUploadTaskContent, TrueFalseQuestion } from "@/models/app";
import { ParentType } from "@/models/app/Assignment.entity";
import { FileStatus } from "@/models/app/File.entity";
import { Lesson } from "@/models/app/Lesson.entity";
import { Preferences, EnrolledCourse } from "@/models/app/User.entity";
import { IAssignmentDb, IBaseAnswerDb, ICodeTaskDb, ICourseDb, IFileDb, IFileUploadTaskDb, IModuleDb, IMultiChoiceAnswerDb, IQuestionTaskDb, IQuizSubmissionDb, IQuizTaskDb, IRoleDb, ITextAnswerDb, IUserDb } from "@/models/db/mongo";
import { IBaseQuestionDb, IMultiChoiceQuestionDb, ITextQuestionDb } from "@/models/db/mongo/Question.db";
import { CreateAssignmentDto, CreateBaseTaskDto, CreateCourseDetailsDto, CreateFileDto, CreateFileUploadTaskDto, CreateLessonDto, CreateModuleDto, CreateTaskDto, CreateUserDto, InstructorDto, PreferencesDto } from "@/models/dto/request";
import { CreateTextAnswerDto } from "@/models/dto/request/CreateAnswer.dto";
import { CreateQuestionDto, CreateTextQuestionDto } from "@/models/dto/request/CreateQuestion.dto";
import { TaskTypeEnum, ProgressTypeEnum, SubmissionStatus, Roles, GradingStatus, QuestionType, SubmissionTypeEnum } from "@/models/enums";
import { answerMapper, assignmentMapper, courseMapper,  fileMapper,  moduleMapper, questionMapper, roleMapper,  taskMapper,  userMapper } from "@/utils/mapper/autoMapper";
import { Types } from "mongoose";


describe('CourseMapper', () => {
    const mockIds = {
        courseId: new Types.ObjectId().toString(),
        moduleIds: Array(3).fill(null).map(() => new Types.ObjectId().toString()),
        instructorIds: Array(2).fill(null).map(() => new Types.ObjectId().toString()),
        assignmentIds: Array(4).fill(null).map(() => new Types.ObjectId().toString()),
        fileIds: Array(5).fill(null).map(() => new Types.ObjectId().toString()),
        prerequisiteIds: Array(2).fill(null).map(() => new Types.ObjectId().toString())
    };

    describe('toEntity', () => {
        it('should correctly map ICourseDb to Course entity', () => {
            const mockCourseDb: Partial<ICourseDb> = {
                _id: new Types.ObjectId(mockIds.courseId),
                title: 'Test Course',
                description: 'Test Description',
                modules: [{
                    _id: new Types.ObjectId(mockIds.moduleIds[0]),
                    title: 'Test Module',
                    order: 1
                }],
                instructors: [{
                    _id: new Types.ObjectId(mockIds.instructorIds[0]),
                    name: 'Test Instructor'
                }],
                categories: ['Software Engineering'],
                enrollmentCode: 'TEST123',
                isPublished: false,
                version: 1,
                lastUpdated: new Date('2024-01-01'),
                enrolledStudentCount: 0,
                xpReward: 100,
                assignmentIds: [new Types.ObjectId(mockIds.assignmentIds[0])],
                fileIds: [new Types.ObjectId(mockIds.fileIds[0])]
            };

            const result = courseMapper.toEntity(mockCourseDb as ICourseDb);

            //expect(result).toBeInstanceOf(Course);
            expect(result.id).toBe(mockIds.courseId);
            expect(result.title).toBe(mockCourseDb.title);
            expect(result.description).toBe(mockCourseDb.description);
            expect(result.modules).toHaveLength(1);
            expect(result.modules[0].title).toBe(mockCourseDb.modules![0].title);
            expect(result.instructors).toHaveLength(1);
            expect(result.instructors[0].name).toBe(mockCourseDb.instructors![0].name);
            expect(result.categories).toEqual(mockCourseDb.categories);
            expect(result.enrollmentCode).toBe(mockCourseDb.enrollmentCode);
            expect(result.isPublished).toBe(mockCourseDb.isPublished);
            expect(result.version).toBe(mockCourseDb.version);
            expect(result.lastUpdated).toEqual(mockCourseDb.lastUpdated);
            expect(result.enrolledStudentCount).toBe(mockCourseDb.enrolledStudentCount);
            expect(result.xpReward).toBe(mockCourseDb.xpReward);
        });

        it('should handle null/undefined values correctly', () => {
            const mockCourseDb: Partial<ICourseDb> = {
                _id: new Types.ObjectId(mockIds.courseId),
                title: 'Test Course',
                description: 'Test Description',
                modules: undefined,
                instructors: undefined,
                categories: [],
                enrollmentCode: 'TEST123',
                isPublished: false,
                version: 1,
                lastUpdated: new Date(),
                enrolledStudentCount: 0,
                xpReward: 100,
                assignmentIds: undefined,
                fileIds: undefined
            };

            const result = courseMapper.toEntity(mockCourseDb as ICourseDb);

            //expect(result).toBeInstanceOf(Course);
            expect(result.modules).toBe(undefined);
            expect(result.instructors).toBe(undefined);
            expect(result.assignments).toBe(undefined);
            expect(result.materials).toBe(undefined);
            expect(result.prerequisites).toBe(undefined);
            expect(result.categories).toHaveLength(0);
        });
    });

    describe('toDb', () => {
        it('should correctly map Course entity to ICourseDb', () => {
            const courseEntity = new Course();
            Object.assign(courseEntity, {
                id: mockIds.courseId,
                title: 'Test Course',
                description: 'Test Description',
                modules: [{
                    id: mockIds.moduleIds[0],
                    title: 'Test Module',
                    order: 1
                }],
                instructors: [{
                    id: mockIds.instructorIds[0],
                    name: 'Test Instructor'
                }],
                categories: ['Software Engineering'],
                enrollmentCode: 'TEST123',
                isPublished: false,
                version: 1,
                lastUpdated: new Date('2024-01-01'),
                enrolledStudentCount: 0,
                xpReward: 100,
                assignments: [{
                    id: mockIds.assignmentIds[0]
                } as Assignment],
                materials: [{
                    id: mockIds.fileIds[0]
                }]
            });

            const result = courseMapper.toDb(courseEntity);

            expect(result._id?.toString()).toBe(mockIds.courseId);
            expect(result.title).toBe(courseEntity.title);
            expect(result.description).toBe(courseEntity.description);
            expect(result.modules).toHaveLength(1);
            expect(result.modules![0].title).toBe(courseEntity.modules[0].title);
            expect(result.instructors).toHaveLength(1);
            expect(result.instructors![0].name).toBe(courseEntity.instructors[0].name);
            expect(result.categories).toEqual(courseEntity.categories);
            expect(result.enrollmentCode).toBe(courseEntity.enrollmentCode);
            expect(result.isPublished).toBe(courseEntity.isPublished);
            expect(result.assignmentIds).toHaveLength(1);
            expect(result.fileIds).toHaveLength(1);
        });
    });

    describe('fromRequest', () => {
        it('should correctly map CreateCourseDetailsDto to Course entity', () => {
            const mockDto: CreateCourseDetailsDto = {
                title: 'Test Course',
                description: 'Test Description',
                instructors: [{
                    id: mockIds.instructorIds[0],
                    name: 'Test Instructor'
                }],
                modules: [],
                categories: ['Software Engineering'],
                xpReward: 100,
                materials: [],
                enrollmentCode: 'TEST123',
                assignments: [],
                isPublished: false,
                prerequisitesCourseIds: []
            };

            const result = courseMapper.fromRequest(mockDto);

            //expect(result).toBeInstanceOf(Course);
            expect(result.title).toBe(mockDto.title);
            expect(result.description).toBe(mockDto.description);
            expect(result.instructors).toHaveLength(1);
            expect(result.instructors[0].id).toBe(mockDto.instructors[0].id);
            expect(result.categories).toEqual(mockDto.categories);
            expect(result.enrollmentCode).toBe(mockDto.enrollmentCode);
            expect(result.xpReward).toBe(mockDto.xpReward);
        });

        it('should handle complex course structure with nested relationships', () => {
            const mockDto: CreateCourseDetailsDto = {
                title: 'Advanced Course',
                description: 'Complex course structure',
                instructors: mockIds.instructorIds.map(id => ({
                    id,
                    name: `Instructor ${id}`
                })),
                modules: mockIds.moduleIds.map((id, index) => ({
                    id,
                    courseId: mockIds.courseId,
                    title: `Module ${index + 1}`,
                    description: `Description ${index + 1}`,
                    order: index + 1,
                    xpReward: 100 * (index + 1),
                    badgeReward: index + 1,
                    learningObjectives: ['Objective 1'],
                    estimatedDuration: 60,
                    difficulty: 3,
                    tags: ['tag1'],
                    publishedAt: new Date(),
                    prerequisitesModulesId: [],
                    lessons: []
                })),
                categories: ['Advanced', 'Engineering'],
                xpReward: 500,
                materials: mockIds.fileIds.map(id => ({
                    id,
                    originalName: `file-${id}.pdf`,
                    size: 1024,
                    mimetype: 'application/pdf',
                    encoding: 'utf-8',
                    status: FileStatus.COMPLETED,
                    uploadedBy: mockIds.instructorIds[0],
                    uploadedAt: new Date(),
                    isPublic: true,
                    tags: [],
                    url: "",
                    parentType: "COURSE",
                    parentId: new Types.ObjectId(mockIds.courseId).toString()
                })),
                enrollmentCode: 'ADV123',
                assignments: [],
                isPublished: true,
                prerequisitesCourseIds: mockIds.prerequisiteIds
            };

            const result = courseMapper.fromRequest(mockDto);

            //expect(result).toBeInstanceOf(Course);
            expect(result.modules).toHaveLength(mockIds.moduleIds.length);
            expect(result.instructors).toHaveLength(mockIds.instructorIds.length);
            expect(result.materials).toHaveLength(mockIds.fileIds.length);
            expect(result.prerequisites).toHaveLength(mockIds.prerequisiteIds.length);
            
            // Verify nested structures
            result.modules.forEach((module, index) => {
                expect(module.id).toBe(mockIds.moduleIds[index]);
                expect(module.title).toBe(`Module ${index + 1}`);
                expect(module.xpReward).toBe(100 * (index + 1));
            });
        });
    });
});

describe('ModuleMapper', () => {
    const mockIds = {
        moduleId: new Types.ObjectId().toString(),
        courseId: new Types.ObjectId().toString(),
        lessonIds: Array(2).fill(null).map(() => new Types.ObjectId().toString()),
        assignmentIds: Array(2).fill(null).map(() => new Types.ObjectId().toString()),
        fileIds: Array(2).fill(null).map(() => new Types.ObjectId().toString()),
        prerequisiteIds: Array(2).fill(null).map(() => new Types.ObjectId().toString())
    };

    describe('toEntity', () => {
        it('should correctly map IModuleDb to Module entity', () => {
            const mockModuleDb: Partial<IModuleDb> = {
                _id: new Types.ObjectId(mockIds.moduleId),
                courseId: new Types.ObjectId(mockIds.courseId),
                title: 'Test Module',
                description: 'Test Description',
                order: 1,
                xpReward: 100,
                badgeReward: '500',
                learningObjectives: ['Objective 1', 'Objective 2'],
                estimatedDuration: 60,
                difficulty: 3,
                tags: ['test'],
                publishedAt: new Date(),
                lessons: [{
                    _id: new Types.ObjectId(mockIds.lessonIds[0]),
                    title: 'Test Lesson',
                    content: 'Test Content',
                    order: 1,
                    assignmentIds: [new Types.ObjectId(mockIds.assignmentIds[0])],
                    fileIds: [new Types.ObjectId(mockIds.fileIds[0])]
                }],
                prerequisitesModulesId: [new Types.ObjectId(mockIds.prerequisiteIds[0])]
            };

            const result = moduleMapper.toEntity(mockModuleDb as IModuleDb);

            //expect(result).toBeInstanceOf(Module);
            expect(result.id).toBe(mockIds.moduleId);
            expect(result.courseId).toBe(mockIds.courseId);
            expect(result.title).toBe(mockModuleDb.title);
            expect(result.description).toBe(mockModuleDb.description);
            expect(result.order).toBe(mockModuleDb.order);
            expect(result.xpReward).toBe(mockModuleDb.xpReward);
            expect(result.badgeReward).toBe(mockModuleDb.badgeReward!);
            expect(result.learningObjectives).toEqual(mockModuleDb.learningObjectives);
            expect(result.lessons).toHaveLength(1);
            expect(result.prerequisites).toHaveLength(1);
        });

        it('should handle null/undefined values correctly', () => {
            const mockModuleDb: Partial<IModuleDb> = {
                _id: new Types.ObjectId(mockIds.moduleId),
                courseId: new Types.ObjectId(mockIds.courseId),
                title: 'Test Module',
                description: 'Test Description',
                order: 1,
                lessons: undefined,
                prerequisitesModulesId: undefined
            };

            const result = moduleMapper.toEntity(mockModuleDb as IModuleDb);

            expect(result.lessons).toBeUndefined();
            expect(result.prerequisites).toBeUndefined();
            expect(result.files).toBeUndefined();
            expect(result.assignments).toBeUndefined();
        });
    });

    describe('toDb', () => {
        it('should correctly map Module entity to IModuleDb', () => {
            const moduleEntity = new Module();
            Object.assign(moduleEntity, {
                id: mockIds.moduleId,
                courseId: mockIds.courseId,
                title: 'Test Module',
                description: 'Test Description',
                order: 1,
                xpReward: 100,
                badgeReward: 500,
                learningObjectives: ['Objective 1'],
                estimatedDuration: 60,
                difficulty: 3,
                publishedAt: new Date(),
                lessons: [{
                    id: mockIds.lessonIds[0],
                    title: 'Test Lesson',
                    content: 'Test Content',
                    order: 1,
                    assignments: [{ id: mockIds.assignmentIds[0] } as unknown as Assignment],
                    files: [{ id: mockIds.fileIds[0] }] as File[]
                } as unknown as Lesson]
            });

            const result = moduleMapper.toDb(moduleEntity);

            expect(result._id?.toString()).toBe(mockIds.moduleId);
            expect(result.courseId.toString()).toBe(mockIds.courseId);
            expect(result.title).toBe(moduleEntity.title);
            expect(result.lessons).toHaveLength(1);
            expect(result.lessons[0].assignmentIds).toHaveLength(1);
            expect(result.lessons[0].fileIds).toHaveLength(1);
        });
    });

    describe('fromRequest', () => {
        it('should correctly map CreateModuleDto to Module entity', () => {
            const mockDto: CreateModuleDto = {
                id: mockIds.moduleId,
                courseId: mockIds.courseId,
                title: 'Test Module',
                description: 'Test Description',
                order: 1,
                xpReward: 100,
                badgeReward: 500,
                learningObjectives: ['Objective 1'],
                estimatedDuration: 60,
                difficulty: 3,
                tags: ['test'],
                publishedAt: new Date(),
                prerequisitesModulesId: [mockIds.prerequisiteIds[0]],
                lessons: [{
                    id: mockIds.lessonIds[0],
                    title: 'Test Lesson',
                    content: 'Test Content',
                    order: 1
                } as CreateLessonDto]
            };

            const result = moduleMapper.fromRequest(mockDto);

            //expect(result).toBeInstanceOf(Module);
            expect(result.id).toBe(mockIds.moduleId);
            expect(result.courseId).toBe(mockIds.courseId);
            expect(result.title).toBe(mockDto.title);
            expect(result.lessons).toHaveLength(1);
            expect(result.lessons[0].id?.toString()).toEqual(mockIds.lessonIds[0]);
            expect(result.prerequisites).toHaveLength(1);
        });
    });
});

describe('AssignmentMapper', () => {
    const mockIds = {
        assignmentId: new Types.ObjectId().toString(),
        parentId: new Types.ObjectId().toString(),
        createdById: new Types.ObjectId().toString(),
    };

    describe('toEntity', () => {
        it('should correctly map IAssignmentDb to Assignment entity', () => {
            const mockAssignmentDb: Partial<IAssignmentDb> = {
                _id: new Types.ObjectId(mockIds.assignmentId),
                title: 'Test Assignment',
                description: 'Test Description',
                parentType: ParentType.COURSE,
                parentId: new Types.ObjectId(mockIds.parentId),
                createdBy: new Types.ObjectId(mockIds.createdById),
                rubric: {
                    criteria: [{
                        criterion: 'Quality',
                        points: 10
                    }]
                },
                peerReviewSettings: {
                    enabled: true,
                    reviewsPerStudent: 2,
                    dueDate: new Date()
                },
                maxAttempts: 3,
                passingScore: 70,
                points: 100,
                submissionWindow: {
                    start: new Date(),
                    end: new Date(),
                    allowLateSubmissions: true,
                    lateSubmissionPenalty: 10
                }
            };

            const result = assignmentMapper.toEntity(mockAssignmentDb as IAssignmentDb);

            //expect(result).toBeInstanceOf(Assignment);
            expect(result.id).toBe(mockIds.assignmentId);
            expect(result.title).toBe(mockAssignmentDb.title);
            expect(result.parentType).toBe(mockAssignmentDb.parentType);
            expect(result.parentId).toBe(mockIds.parentId);
            expect(result.createdBy).toBe(mockIds.createdById);
            expect(result.rubric).toBeDefined();
            expect(result.rubric?.criteria).toHaveLength(1);
            expect(result.peerReviewSettings?.enabled).toBe(true);
            expect(result.submissionWindow.allowLateSubmissions).toBe(true);
        });

        it('should handle null/undefined values correctly', () => {
            const mockAssignmentDb: Partial<IAssignmentDb> = {
                _id: new Types.ObjectId(mockIds.assignmentId),
                title: 'Test Assignment',
                description: 'Test Description',
                parentType: ParentType.COURSE,
                parentId: new Types.ObjectId(mockIds.parentId),
                createdBy: new Types.ObjectId(mockIds.createdById),
                submissionWindow: {
                    start: new Date(),
                    end: new Date(),
                    allowLateSubmissions: false,
                    lateSubmissionPenalty: 0
                }
            };

            const result: Assignment = assignmentMapper.toEntity(mockAssignmentDb as IAssignmentDb);

            expect(result.rubric).toBeUndefined();
            expect(result.peerReviewSettings).toBeUndefined();
            //expect(result.maxAttempts).toBe(1); // default value
        });
    });

    describe('toDb', () => {
        it('should correctly map Assignment entity to IAssignmentDb', () => {
            const assignmentEntity = new Assignment();
            Object.assign(assignmentEntity, {
                id: mockIds.assignmentId,
                title: 'Test Assignment',
                description: 'Test Description',
                parentType: ParentType.COURSE,
                parentId: mockIds.parentId,
                createdBy: mockIds.createdById,
                rubric: {
                    criteria: [{
                        criterion: 'Quality',
                        points: 10
                    }]
                },
                peerReviewSettings: {
                    enabled: true,
                    reviewsPerStudent: 2,
                    dueDate: new Date()
                },
                submissionWindow: {
                    start: new Date(),
                    end: new Date(),
                    allowLateSubmissions: true,
                    lateSubmissionPenalty: 10
                }
            });

            const result = assignmentMapper.toDb(assignmentEntity);

            expect(result._id?.toString()).toBe(mockIds.assignmentId);
            expect(result.title).toBe(assignmentEntity.title);
            expect(result.parentType).toBe(assignmentEntity.parentType);
            expect(result.parentId.toString()).toBe(assignmentEntity.parentId);
            expect(result.rubric?.criteria).toHaveLength(1);
            expect(result.peerReviewSettings?.enabled).toBe(true);
            expect(result.submissionWindow.allowLateSubmissions).toBe(true);
        });
    });

    describe('fromRequest', () => {
        it('should correctly map CreateAssignmentDto to Assignment entity', () => {
            const mockDtoTask  = {
                title: 'Test Assignment',
                description: 'Test Description',
                taskType: TaskTypeEnum.FILE_UPLOAD,
                points: 10,
                order: 1,
                xpReward: 10,
                requiredForCompletion: true,
                dueDate: new Date(),
                assignmentId: mockIds.assignmentId,
                prerequisites: [],
                maxAttempts: 1,
                content: {
                    question: 'What is the answer?',
                    questionType: QuestionType.MULTI_CHOICE,
                    correctAnswer: 'Yes',
                } as CreateTextQuestionDto
            } as CreateTaskDto

            const mockDto: CreateAssignmentDto = {
                title: 'Test Assignment',
                description: 'Test Description',
                parentType: ParentType.COURSE,
                parentId: mockIds.parentId,
                rubric: {
                    criteria: [{
                        criterion: 'Quality',
                        points: 10
                    }]
                },
                peerReviewSettings: {
                    enabled: true,
                    reviewsPerStudent: 2,
                    dueDate: new Date()
                },
                submissionWindow: {
                    start: new Date(),
                    end: new Date(),
                    allowLateSubmissions: true,
                    lateSubmissionPenalty: 10
                },
                createdBy: mockIds.createdById,
                passingScore: 100,
                points: 588,
                tasks: [mockDtoTask]
            };

            const result = assignmentMapper.fromRequest(mockDto);

            //expect(result).toBeInstanceOf(Assignment);
            expect(result.title).toBe(mockDto.title);
            expect(result.parentType).toBe(mockDto.parentType);
            expect(result.parentId).toBe(mockDto.parentId);
            expect(result.rubric?.criteria).toHaveLength(1);
            expect(result.peerReviewSettings?.enabled).toBe(true);
            expect(result.submissionWindow.allowLateSubmissions).toBe(true);
        });
    });
});


describe('UserMapper', () => {
    const mockIds = {
        userId: new Types.ObjectId().toString(),
        courseIds: Array(2).fill(null).map(() => new Types.ObjectId().toString()),
        roleId: new Types.ObjectId().toString()
    };

    describe('toEntity', () => {
        it('should correctly map IUserDb to User entity', () => {
            const mockUserDb: Partial<IUserDb> = {
                _id: new Types.ObjectId(mockIds.userId),
                name: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                username: 'johndoe',
                password: 'hashedpassword',
                roles: [{_id: new Types.ObjectId(mockIds.roleId), name: Roles.STUDENT}],
                profilePicture: 'profile.jpg',
                preferences: {
                    notifications: true,
                    theme: 'dark',
                    language: 'en'
                },
                enrolledCourses: [{
                    courseId: new Types.ObjectId(mockIds.courseIds[0]),
                    courseName: 'Test Course'
                }]
            };

            const result = userMapper.toEntity(mockUserDb as IUserDb);

            //expect(result).toBeInstanceOf(User);
            expect(result.id).toBe(mockIds.userId);
            expect(result.name).toBe(mockUserDb.name);
            expect(result.lastName).toBe(mockUserDb.lastName);
            expect(result.email).toBe(mockUserDb.email);
            expect(result.username).toBe(mockUserDb.username);
            //expect(result.roles).toEqual(mockUserDb.roles);
            expect(result.preferences?.theme).toBe(mockUserDb.preferences?.theme);
            expect(result.enrolledCourses).toHaveLength(1);
            expect(result.enrolledCourses![0].courseId).toBe(mockIds.courseIds[0]);
        });

        it('should handle null/undefined values correctly', () => {
            const mockUserDb: Partial<IUserDb> = {
                _id: new Types.ObjectId(mockIds.userId),
                name: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                username: 'johndoe',
                password: 'hashedpassword',
                roles:  [{_id: new Types.ObjectId(mockIds.roleId), name: Roles.STUDENT}],
                preferences: {
                    notifications: true,
                    theme: 'light',
                    language: 'en'
                }
            };

            const result = userMapper.toEntity(mockUserDb as IUserDb);

            expect(result.profilePicture).toBeUndefined();
            expect(result.enrolledCourses).toBeUndefined();
        });
    });

    describe('toDb', () => {
        it('should correctly map User entity to IUserDb', () => {
            const userEntity = new User();
            Object.assign(userEntity, {
                id: mockIds.userId,
                name: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                username: 'johndoe',
                password: 'hashedpassword',
                roles: [{id:mockIds.roleId,name:Roles.STUDENT}],
                profilePicture: 'profile.jpg',
                preferences: {
                    notifications: true,
                    theme: 'dark',
                    language: 'en'
                } as Preferences,
                enrolledCourses: [{
                    courseId: mockIds.courseIds[0],
                    courseName: 'Test Course'
                }] as EnrolledCourse[]
            });

            const result = userMapper.toDb(userEntity);

            expect(result._id?.toString()).toBe(mockIds.userId);
            expect(result.name).toBe(userEntity.name);
            expect(result.lastName).toBe(userEntity.lastName);
            expect(result.email).toBe(userEntity.email);
            expect(result.username).toBe(userEntity.username);

            expect(result.roles).toBeDefined();
            expect(result.roles).toHaveLength(1);
            expect(result.roles[0]._id?.toString()).toBe(mockIds.roleId);
            expect(result.roles[0].name).toBe(Roles.STUDENT);

            expect(result.preferences?.theme).toBe(userEntity.preferences?.theme);
            expect(result.enrolledCourses).toHaveLength(1);
            expect(result.enrolledCourses![0].courseId.toString()).toBe(mockIds.courseIds[0]);
        });
    });

    describe('fromRequest', () => {
        it('should correctly map CreateUserDto to User entity', () => {
            const mockDto: CreateUserDto = {
                name: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                username: 'johndoe',
                password: 'password123',
                roles: [Roles.STUDENT],
                profilePicture: 'profile.jpg',
                preferences: {
                    notifications: true,
                    theme: 'dark',
                    language: 'en'
                } as PreferencesDto,
                enrolledCourses: [{
                    courseId: mockIds.courseIds[0],
                    courseName: 'Test Course'
                }]
            };

            const result = userMapper.fromRequest(mockDto);

            //expect(result).toBeInstanceOf(User);
            expect(result.name).toBe(mockDto.name);
            expect(result.lastName).toBe(mockDto.lastName);
            expect(result.email).toBe(mockDto.email);
            expect(result.username).toBe(mockDto.username);
            expect(result.password).toBe(mockDto.password);
            expect(result.roles).toEqual(mockDto.roles.map(name => ({id:"",name:name})));  
            expect(result.preferences?.theme).toBe(mockDto.preferences?.theme);
            expect(result.enrolledCourses).toHaveLength(1);
            expect(result.enrolledCourses![0].courseId).toBe(mockIds.courseIds[0]);
        });

        it('should handle minimal user creation', () => {
            const mockDto: CreateUserDto = {
                name: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                username: 'johndoe',
                password: 'password123',
                roles: [Roles.STUDENT]
            };

            const result = userMapper.fromRequest(mockDto);

            //expect(result).toBeInstanceOf(User);
            expect(result.name).toBe(mockDto.name);
            expect(result.preferences).toBeUndefined();
            expect(result.enrolledCourses).toBeUndefined();
        });
    });
});


describe('RoleMapper', () => {
    const mockIds = {
        roleId: new Types.ObjectId().toString()
    };

    describe('toEntity', () => {
        it('should correctly map IRoleDb to Role entity', () => {
            const mockRoleDb: Partial<IRoleDb> = {
                _id: new Types.ObjectId(mockIds.roleId),
                name: Roles.ADMIN,
                description: 'Administrator role'
            };

            const result = roleMapper.toEntity(mockRoleDb as IRoleDb);

            //expect(result).toBeInstanceOf(Role);
            expect(result.id).toBe(mockIds.roleId);
            expect(result.name).toBe(mockRoleDb.name);
            expect(result.description).toBe(mockRoleDb.description);
        });

        it('should handle null/undefined values correctly', () => {
            const mockRoleDb: Partial<IRoleDb> = {
                _id: new Types.ObjectId(mockIds.roleId),
                name: Roles.STUDENT
            };

            const result = roleMapper.toEntity(mockRoleDb as IRoleDb);

            expect(result.description).toBeUndefined();
        });
    });

    describe('toDb', () => {
        it('should correctly map Role entity to IRoleDb', () => {
            const roleEntity = new Role();
            Object.assign(roleEntity, {
                id: mockIds.roleId,
                name: Roles.ADMIN,
                description: 'Administrator role'
            });

            const result = roleMapper.toDb(roleEntity);

            expect(result._id?.toString()).toBe(mockIds.roleId);
            expect(result.name).toBe(roleEntity.name);
            expect(result.description).toBe(roleEntity.description);
        });

        it('should handle minimal role mapping', () => {
            const roleEntity = new Role();
            Object.assign(roleEntity, {
                id: mockIds.roleId,
                name: Roles.STUDENT
            });

            const result = roleMapper.toDb(roleEntity);

            expect(result._id?.toString()).toBe(mockIds.roleId);
            expect(result.name).toBe(roleEntity.name);
            expect(result.description).toBeUndefined();
        });
    });

    describe('Edge Cases', () => {
        it('should handle enum validation for role names', () => {
            const mockRoleDb: Partial<IRoleDb> = {
                _id: new Types.ObjectId(mockIds.roleId),
                name: 'INVALID_ROLE' as Roles,
                description: 'Invalid role'
            };

            expect(() => roleMapper.toEntity(mockRoleDb as IRoleDb))
                .toThrow(Error(`Invalid role name: INVALID_ROLE`));
        });

        it('should preserve optional fields when present', () => {
            const roleEntity = new Role();
            Object.assign(roleEntity, {
                id: mockIds.roleId,
                name: Roles.PROFESSOR,
                description: 'Course instructor'
            });

            const dbModel = roleMapper.toDb(roleEntity);
            const rehydratedEntity = roleMapper.toEntity(dbModel);

            expect(rehydratedEntity.description).toBe(roleEntity.description);
        });
    });
});


describe('FileMapper', () => {
    const mockIds = {
        fileId: new Types.ObjectId().toString(),
        uploaderId: new Types.ObjectId().toString(),
        parentId: new Types.ObjectId().toString()
    };

    describe('toEntity', () => {
        it('should correctly map IFileDb to File entity', () => {
            const mockFileDb: IFileDb = {
                _id: new Types.ObjectId(mockIds.fileId),
                originalName: 'test.pdf',
                size: 1024,
                mimetype: 'application/pdf',
                encoding: 'utf-8',
                uploadedBy: new Types.ObjectId(mockIds.uploaderId),
                uploadedAt: new Date(),
                isPublic: true,
                status: FileStatus.COMPLETED,
                tags: ['test'],
                url: 'test.pdf',
                parentType: ParentType.COURSE,
                parentId: new Types.ObjectId(mockIds.parentId),
                filename: 'test.pdf',
                lastModified: new Date(),
                version: 1
            };

            const result = fileMapper.toEntity(mockFileDb);

            expect(result.id).toBe(mockIds.fileId);
            expect(result.originalName).toBe(mockFileDb.originalName);
            expect(result.size).toBe(mockFileDb.size);
            expect(result.status).toBe(mockFileDb.status);
        });
    });

    describe('toDb', () => {
        it('should correctly map File entity to IFileDb', () => {
            const fileEntity = new File();
            Object.assign(fileEntity, {
                id: mockIds.fileId,
                originalName: 'test.pdf',
                size: 1024,
                uploadedBy: mockIds.uploaderId,
                status: FileStatus.COMPLETED
            });

            const result = fileMapper.toDb(fileEntity);

            expect(result._id?.toString()).toBe(mockIds.fileId);
            expect(result.originalName).toBe(fileEntity.originalName);
            expect(result.uploadedBy?.toString()).toBe(fileEntity.uploadedBy);
        });
    });
});

describe('QuestionMapper', () => {
    const mockIds = {
        questionId: new Types.ObjectId().toString()
    };

    describe('toEntity', () => {
        it('should correctly map MultiChoiceQuestion', () => {
            const mockQuestionDb: IMultiChoiceQuestionDb = {
                _id: new Types.ObjectId(mockIds.questionId),
                question: 'Test question?',
                questionType: QuestionType.MULTI_CHOICE,
                options: [
                    { _id: new Types.ObjectId(), text: 'Option 1', isCorrect: true },
                    { _id: new Types.ObjectId(), text: 'Option 2', isCorrect: false }
                ]
            };

            const result = questionMapper.toEntity(mockQuestionDb);

            expect(result.id).toBe(mockIds.questionId);
            expect(result.question).toBe(mockQuestionDb.question);
            expect(result.questionType).toBe(QuestionType.MULTI_CHOICE);
            expect((result as MultiChoiceQuestion).options).toHaveLength(2);
        });

        it('should correctly map TextQuestion', () => {
            const mockQuestionDb: ITextQuestionDb = {
                _id: new Types.ObjectId(mockIds.questionId),
                question: 'Test question?',
                questionType: QuestionType.TEXT,
                correctAnswer: 'Correct answer'
            };

            const result = questionMapper.toEntity(mockQuestionDb);

            expect(result.id).toBe(mockIds.questionId);
            expect(result.question).toBe(mockQuestionDb.question);
            expect((result as TextQuestion).correctAnswer).toBe(mockQuestionDb.correctAnswer);
        });
    });

    describe('toDb', () => {
        it('should throw error for invalid question type', () => {
            const invalidQuestion = {
                id: mockIds.questionId,
                question: 'Test?',
                questionType: 'INVALID' as QuestionType
            };

            expect(() => questionMapper.toDb(invalidQuestion as Question))
                .toThrow('Unknown question type: INVALID');
        });
    });
});

describe('AnswerMapper', () => {
    const mockIds = {
        answerId: new Types.ObjectId().toString(),
        taskId: new Types.ObjectId().toString(),
        questionId: new Types.ObjectId().toString()
    };

    describe('toEntity', () => {
        it('should correctly map MultiChoiceAnswer', () => {
            const mockAnswerDb: IMultiChoiceAnswerDb = {
                _id: new Types.ObjectId(mockIds.answerId),
                questionId: new Types.ObjectId(mockIds.questionId),
                questionType: QuestionType.MULTI_CHOICE,
                submittedAt: new Date(),
                isCorrect: true,
                score: 10,
                selectedOptionIds: ['1', '2']
            };

            const result = answerMapper.toEntity(mockAnswerDb);

            expect(result.id).toBe(mockIds.answerId);
            expect((result as MultiChoiceAnswer).selectedOptionIds).toEqual(['1', '2']);
        });

        it('should correctly map TextAnswer', () => {
            const mockAnswerDb: ITextAnswerDb = {
                _id: new Types.ObjectId(mockIds.answerId),
                questionId: new Types.ObjectId(mockIds.questionId),
                questionType: QuestionType.TEXT,
                submittedAt: new Date(),
                isCorrect: true,
                score: 10,
                answer: 'Test answer'
            };

            const result = answerMapper.toEntity(mockAnswerDb);

            expect(result.id).toBe(mockIds.answerId);
            expect((result as TextAnswer).answer).toBe(mockAnswerDb.answer);
        });
    });

    describe('toDb', () => {
        it('should correctly map MultiChoiceAnswer to DB', () => {
            const answerEntity: MultiChoiceAnswer = {
                id: mockIds.answerId,
                taskId: mockIds.taskId,
                questionId: mockIds.questionId,
                questionType: QuestionType.MULTI_CHOICE,
                submittedAt: new Date(),
                isCorrect: true,
                score: 10,
                selectedOptionIds: ['1', '2']
            };

            const result = answerMapper.toDb(answerEntity);

            expect(result._id?.toString()).toBe(mockIds.answerId);
            expect((result as IMultiChoiceAnswerDb).selectedOptionIds).toEqual(['1', '2']);
        });
    });

    describe('fromRequest', () => {
        it('should initialize not default values', () => {
            const mockDto = {
                taskId: mockIds.taskId,
                questionId: mockIds.questionId,
                questionType: QuestionType.TEXT,
                answer: 'Test answer'
            };

            const result = answerMapper.fromRequest(mockDto as CreateTextAnswerDto);

            expect(result.taskId).toBe(mockIds.taskId);
            expect(result.isCorrect).toBeUndefined();
            expect(result.score).toBeUndefined();
        });
    });
});


describe('TaskMapper', () => {
    const mockIds = {
        taskId: new Types.ObjectId().toString(),
        assignmentId: new Types.ObjectId().toString(),
        questionId: new Types.ObjectId().toString()
    };

    describe('FileUpload Task Mapping', () => {
        it('should correctly map FileUploadTask entity to DB model', () => {
            // Arrange
            const taskEntity = new FileUploadTask();
            Object.assign(taskEntity, {
                id: mockIds.taskId,
                title: 'Upload Assignment',
                description: 'Please upload your work',
                taskType: TaskTypeEnum.FILE_UPLOAD,
                status: ProgressTypeEnum.NOT_STARTED,
                points: 100,
                order: 1,
                xpReward: 50,
                requiredForCompletion: true,
                assignmentId: mockIds.assignmentId,
                content: {
                    allowedFileTypes: ['.pdf', '.doc'],
                    maxFileSize: 5000000, // 5MB
                } as FileUploadTaskContent
            });

            // Act
            const result = taskMapper.toDb(taskEntity) as IFileUploadTaskDb;

            // Assert
            expect(result._id?.toString()).toBe(mockIds.taskId);
            expect(result.taskType).toBe(TaskTypeEnum.FILE_UPLOAD);
            expect(result.content.allowedFileTypes).toEqual(['.pdf', '.doc']);
            expect(result.content.maxFileSize).toBe(5000000);
        });

        it('should correctly map FileUpload DB model to entity', () => {
            // Arrange
            const dbModel: IFileUploadTaskDb = {
                _id: new Types.ObjectId(mockIds.taskId),
                title: 'Upload Assignment',
                description: 'Please upload your work',
                taskType: TaskTypeEnum.FILE_UPLOAD,
                points: 100,
                order: 1,
                xpReward: 50,
                requiredForCompletion: true,
                assignmentId: new Types.ObjectId(mockIds.assignmentId),
                content: {
                    allowedFileTypes: ['.pdf', '.doc'],
                    maxFileSize: 5000000,
                },
                submissionWindow: {
                    start: new Date(),
                    end: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    allowLateSubmissions: false,
                    lateSubmissionPenalty: 0.01  // percentage
                }
            };

            // Act
            const result = taskMapper.toEntity(dbModel) as FileUploadTask;

            // Assert
            //expect(result).toBeInstanceOf(FileUploadTask);
            expect(result.id).toBe(mockIds.taskId);
            expect(result.content.allowedFileTypes).toEqual(['.pdf', '.doc']);
        });
    });

    describe('Question Task Mapping', () => {
        it('should correctly map QuestionTask entity to DB model', () => {
            // Arrange
            const taskEntity = new QuestionTask();
            Object.assign(taskEntity, {
                id: mockIds.taskId,
                title: 'Theory Question',
                description: 'Explain the concept',
                taskType: TaskTypeEnum.QUESTION,
                status: ProgressTypeEnum.NOT_STARTED,
                points: 50,
                order: 2,
                xpReward: 30,
                requiredForCompletion: true,
                assignmentId: mockIds.assignmentId,
                content: {
                    question: 'What is dependency injection?',
                    questionType: QuestionType.TEXT,
                    correctAnswer: 'A design pattern where dependencies are passed in',
                }  as TextQuestion
            });

            // Act
            const result = taskMapper.toDb(taskEntity) as IQuestionTaskDb;

            // Assert
            expect(result._id?.toString()).toBe(mockIds.taskId);
            expect(result.taskType).toBe(TaskTypeEnum.QUESTION);
            expect(result.content.question).toBe('What is dependency injection?');
            expect((result.content as ITextQuestionDb).correctAnswer).toBe('A design pattern where dependencies are passed in');
        });
    });

    describe('Quiz Task Mapping', () => {
        it('should correctly map QuizTask with multiple question types', () => {
            // Arrange
            const quizTask = new QuizTask();
            Object.assign(quizTask, {
                id: mockIds.taskId,
                title: 'Module Quiz',
                description: 'Final quiz for the module',
                taskType: TaskTypeEnum.QUIZ,
                status: ProgressTypeEnum.NOT_STARTED,
                points: 100,
                order: 3,
                xpReward: 75,
                requiredForCompletion: true,
                assignmentId: mockIds.assignmentId,
                content: {
                    timeLimit: 30, // minutes
                    questions: [
                        {
                            id: new Types.ObjectId().toString(),
                            question: 'Which pattern is used for dependency management?',
                            questionType: QuestionType.MULTI_CHOICE,
                            options: [
                                { text: 'Dependency Injection', isCorrect: true },
                                { text: 'Singleton', isCorrect: false },
                                { text: 'Factory', isCorrect: false }
                            ]
                        } as MultiChoiceQuestion,
                        {
                            id: new Types.ObjectId().toString(),
                            question: 'Is TypeScript a superset of JavaScript?',
                            questionType: QuestionType.TRUE_FALSE,
                            correctAnswer: true
                        } as TrueFalseQuestion
                    ],
                    passingScore: 70
                }
            });

            // Act
            const result = taskMapper.toDb(quizTask) as IQuizTaskDb;

            // Assert
            expect(result._id?.toString()).toBe(mockIds.taskId);
            expect(result.taskType).toBe(TaskTypeEnum.QUIZ);
            expect(result.content.questions).toHaveLength(2);
            expect(result.content.timeLimit).toBe(30);
           
        });
    });

    describe('Code Task Mapping', () => {
        it('should correctly map CodeTask entity to DB model', () => {
            // Arrange
            const taskEntity = new CodeTask();
            Object.assign(taskEntity, {
                id: mockIds.taskId,
                title: 'Coding Challenge',
                description: 'Implement a sorting algorithm',
                taskType: TaskTypeEnum.CODE,
                status: ProgressTypeEnum.NOT_STARTED,
                points: 150,
                order: 4,
                xpReward: 100,
                requiredForCompletion: true,
                assignmentId: mockIds.assignmentId,
                content: {
                    language: 'typescript',
                    starterCode: 'function sort(arr: number[]): number[] {\n  // Your code here\n}',
                    testCases: [
                        {
                            input: '[5,2,8,1,9]',
                            expectedOutput: '[1,2,5,8,9]',
                            isHidden: false
                        }
                    ],
                    timeLimit: 2000, // ms
                    memoryLimit: 256 // MB
                }
            });

            // Act
            const result = taskMapper.toDb(taskEntity) as ICodeTaskDb;

            // Assert
            expect(result._id?.toString()).toBe(mockIds.taskId);
            expect(result.taskType).toBe(TaskTypeEnum.CODE);
            expect(result.content.language).toBe('typescript');
            expect(result.content.testCases).toHaveLength(1);
        });
    });

    describe('Task DTO Mapping', () => {
        it('should correctly map FileUpload DTO to entity', () => {
            // Arrange
            const dto: CreateFileUploadTaskDto = {
                title: 'Upload Assignment',
                description: 'Please upload your work',
                taskType: TaskTypeEnum.FILE_UPLOAD,
                points: 100,
                order: 1,
                xpReward: 50,
                requiredForCompletion: true,
                assignmentId: mockIds.assignmentId,
                content: {
                    allowedFileTypes: ['.pdf', '.doc'],
                    maxFileSize: 5000000,
                },
                dueDate: new Date()
            };

            // Act
            const result = taskMapper.fromRequest(dto) as FileUploadTask;

            // Assert
            //expect(result).toBeInstanceOf(FileUploadTask);
            expect(result.title).toBe(dto.title);
            expect(result.content.allowedFileTypes).toEqual(dto.content.allowedFileTypes);
        });
    });

    // describe('Error Handling', () => {
    //     it('should throw error for invalid task type', () => {
    //         // Arrange
    //         const invalidTask = {
    //             id: mockIds.taskId,
    //             title: 'Invalid Task',
    //             taskType: 'INVALID_TYPE' as TaskTypeEnum,
    //             assignmentId: mockIds.assignmentId
    //         };

    //         // Act & Assert
    //         expect(() => taskMapper.toDb(invalidTask as Task))
    //             .toThrow('Unknown task type: INVALID_TYPE');
    //     });

    //     it('should handle missing content gracefully', () => {
    //         // Arrange
    //         const incompleteTask = new FileUploadTask();
    //         Object.assign(incompleteTask, {
    //             id: mockIds.taskId,
    //             title: 'Incomplete Task',
    //             taskType: TaskTypeEnum.FILE_UPLOAD,
    //             assignmentId: mockIds.assignmentId
    //         });

    //         // Act
    //         const result = taskMapper.toDb(incompleteTask) as IFileUploadTaskDb;

    //         // Assert
    //         expect(result._id?.toString()).toBe(mockIds.taskId);
    //         expect(result.content).toBeDefined();
    //         expect(result.content.allowedFileTypes).toEqual([]);
    //     });
    // });

    // describe('Validation', () => {
    //     // it('should validate required fields in QuestionTask', () => {
    //     //     // Arrange
    //     //     const invalidQuestionTask = new QuestionTask();
    //     //     Object.assign(invalidQuestionTask, {
    //     //         id: mockIds.taskId,
    //     //         taskType: TaskTypeEnum.QUESTION,
    //     //         assignmentId: mockIds.assignmentId
    //     //         // Missing title and content
    //     //     });

    //     //     // Act & Assert
    //     //     expect(() => taskMapper.toDb(invalidQuestionTask))
    //     //         .toThrow(/required/i);
    //     // });

    //     // it('should validate file size limits in FileUploadTask', () => {
    //     //     // Arrange
    //     //     const taskWithInvalidLimits = new FileUploadTask();
    //     //     Object.assign(taskWithInvalidLimits, {
    //     //         id: mockIds.taskId,
    //     //         title: 'Invalid Limits',
    //     //         taskType: TaskTypeEnum.FILE_UPLOAD,
    //     //         assignmentId: mockIds.assignmentId,
    //     //         content: {
    //     //             maxFileSize: -1, // Invalid negative size
    //     //             allowedFileTypes: []
    //     //         }
    //     //     });

    //     //     // Act & Assert
    //     //     expect(() => taskMapper.toDb(taskWithInvalidLimits))
    //     //         .toThrow(/invalid file size/i);
    //     // });
    // });
});