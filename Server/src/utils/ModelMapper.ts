import mongoose, { Types, Document } from 'mongoose';
import * as AppModels from '../models/app';
import * as DTOs from '../models/dto';
import * as DbModels from '../models/db/mongo';
import { ProgressTypeEnum, QuestionType, Roles, TaskTypeEnum } from '@/models/enums';
import { IUserDb } from '@/models/db/mongo/User';
import { ObjectId } from 'mongodb';
import { IAssignmentProgress, ICourseProgress, ILessonProgress, IModuleProgress, ITaskProgress, IUserProgress } from '@/models/app/Progress/Progress';
import { UserProgressDTO, ModuleProgressDTO, LessonProgressDTO, AssignmentProgressDTO, TaskProgressDTO, CourseProgressDTO } from '@/models/dto/Progress';


export class RoleMapper {
    static dbToDomain(role: mongoose.Types.ObjectId | DbModels.IRoleDb): AppModels.IRole {
        if (RoleMapper.isPopulatedRole(role)) {
            return {
                id: role._id.toString(),
                name: role.name,
                description: role.description
            } as AppModels.IRole;
        } else {
            return {
                id: role.toString(),
                name: '' as Roles
            } as AppModels.IRole;
        }
    }

    private static isPopulatedRole(role: any): role is DbModels.IRoleDb {
        return typeof role === 'object' && role !== null && 'name' in role;
    }

    static toDb(domain: AppModels.IRole): DbModels.IRoleDb {
        return {
            _id: new Types.ObjectId(domain.id),
            name: domain.name,
        } as DbModels.IRoleDb;
    }

    static toDto(domain: any): { name: Roles, id: string } {
        return {
            id: domain.id,
            name: domain.name,
        };
    }
}

export class UserMapper {
    static dbToDomain(userDb: IUserDb): AppModels.IUser {
        return {
            id: userDb._id.toString(),
            name: userDb.name,
            lastName: userDb.lastName,
            email: userDb.email,
            username: userDb.username,
            password: userDb.password,
            roles: userDb.roles,
            profilePicture: userDb.profilePicture,
            preferences: userDb.preferences,
            enrolledCoursesIds: userDb.enrolledCourses?.map(course => course.courseId.toString()) || [],
        };
    }

    static toDb(domain: AppModels.IUser | Partial<AppModels.IUser>): Partial<IUserDb> {
        return {
            _id: new Types.ObjectId(domain.id),
            name: domain.name,
            lastName: domain.lastName,
            email: domain.email,
            username: domain.username,
            password: domain.password,
            roles: domain.roles,
            profilePicture: domain.profilePicture,
            preferences: domain.preferences,
            enrolledCourses: domain.enrolledCourses?.map(course => ({
                courseId: new Types.ObjectId(course.courseId),
                enrollmentDate: course.enrollmentDate,
                lastAccessed: course.lastAccessed
            })) ?? [],
        } as unknown as Partial<IUserDb>;
    }

    static toResponseDto(domain: AppModels.IUser): DTOs.UserResponseDto {
        return {
            id: domain.id!,
            name: domain.name,
            lastName: domain.lastName,
            username: domain.username,
            email: domain.email,
            roles: domain.roles !== undefined ? domain.roles as Roles[] : [],
            profilePicture: domain.profilePicture!,
            preferences: domain.preferences,
            enrolledCourses: domain.enrolledCourses?.map(course => ({
                courseId: course.courseId,
                enrollmentDate: course.enrollmentDate,
                lastAccessed: course.lastAccessed
            })) ?? [],
        };
    }

    static createDtoToDomain(dto: DTOs.CreateUserDto): AppModels.IUser {
        return {
            name: dto.name,
            lastName: dto.lastName,
            email: dto.email,
            username: dto.username,
            password: dto.password,
            roles: dto.roles.map(r => r),
            profilePicture: dto.profilePicture,
            preferences: dto.preferences,
            enrolledCourses: []
        };
    }

    static updateDtoToDomain(user: AppModels.IUser, dto: DTOs.UpdateUserDto): AppModels.IUser {
        return {
            ...user,
            name: dto.name ?? user.name,
            lastName: dto.lastName ?? user.lastName,
            email: dto.email ?? user.email,
            username: dto.username ?? user.username,
            roles: dto.roles?.map(r => r) ?? user.roles,
            profilePicture: dto.profilePicture ?? user.profilePicture,
            preferences: dto.preferences ?? user.preferences,
            enrolledCourses: user.enrolledCourses // Preserving existing enrolled courses
        };
    }
}

export class CourseMapper {
    // Course Mappings
    static dbToDomain(dbCourse: DbModels.ICourseDb): AppModels.ICourse {
        return {
            id: dbCourse._id.toString(),
            title: dbCourse.title,
            description: dbCourse.description,
            instructorsId: dbCourse.instructors.map(instructor => instructor._id.toString()),
            modulesId: dbCourse.modules.map(module => module._id.toString()),
            isPublished: dbCourse.isPublished,
            categories: dbCourse.categories.map(category => category),
            xpReward: dbCourse.xpReward,
            materials: dbCourse.materials.map(material => material),
        };
    }

    static toDb(appCourse: AppModels.ICourse): Partial<DbModels.ICourseDb> {
        const dbCourse: Partial<DbModels.ICourseDb> = {
            title: appCourse.title,
            description: appCourse.description,
            isPublished: appCourse.isPublished,
            categories: appCourse.categories,
            xpReward: appCourse.xpReward,
            materials: appCourse.materials,
        };

        if (appCourse.instructors) {
            dbCourse.instructors = appCourse.instructors
                .filter((instructor): instructor is Required<Pick<AppModels.IUser, 'id' | 'name'>> =>
                    instructor.id !== undefined && instructor.name !== undefined)
                .map(instructor => ({
                    _id: new Types.ObjectId(instructor.id),
                    name: instructor.name
                }));
        }

        if (appCourse.modules) {
            dbCourse.modules = appCourse.modules
                .filter((module): module is Required<Pick<AppModels.IModule, 'id' | 'title' | 'order'>> =>
                    module.id !== undefined && module.title !== undefined && module.order !== undefined)
                .map(module => ({
                    _id: new Types.ObjectId(module.id),
                    title: module.title,
                    order: module.order
                }));
        }

        return dbCourse;
    }

    static toResponseDto(appCourse: AppModels.ICourse): DTOs.CourseResponseDto {
        return {
            id: appCourse.id ?? '',
            title: appCourse.title,
            description: appCourse.description,
            instructors: appCourse.instructors
                ?.filter((instructor): instructor is Required<Pick<AppModels.IUser, 'id' | 'name'>> =>
                    instructor.id !== undefined && instructor.name !== undefined)
                .map(instructor => ({
                    id: instructor.id,
                    name: instructor.name
                })) ?? [],
            modules: appCourse.modules
                ?.filter((module): module is Required<Pick<AppModels.IModule, 'id' | 'title' | 'order'>> =>
                    module.id !== undefined && module.title !== undefined && module.order !== undefined)
                .map(module => ({
                    id: module.id,
                    title: module.title,
                    order: module.order
                })) ?? [],
            isPublished: appCourse.isPublished,
            categories: appCourse.categories,
            xpReward: appCourse.xpReward,
            materials: appCourse.materials,
        };
    }

    static createDtoToDomain(dto: DTOs.CreateCourseDto): AppModels.ICourse {
        return {
            title: dto.title,
            description: dto.description,
            instructorsId: dto.instructors.map(i => i.id),
            modulesId: dto.modules.map(m => m.id),
            // startDate: Date;
            // endDate: Date;
            isPublished: dto.isPublished,
            categories: dto.categories,
            xpReward: dto.xpReward,
            materials: dto.materials
        };
    }

    static updateDtoToDomain(dto: DTOs.UpdateCourseDto): Partial<AppModels.ICourse> {
        return {
            title: dto.title,
            description: dto.description,
            instructorsId: dto.instructorsId.map(id => id),
            modulesId: dto.modulesId.map(id => id),
            isPublished: dto.isPublished,
            categories: dto.categories,
            xpReward: dto.xpReward,
            materials: dto.materials,
        };
    }
}

export class ModuleMapper {
    static dbToDomain(dbModule: DbModels.IModuleDb): AppModels.IModule {
        return {
            id: dbModule._id?.toString(),
            courseId: dbModule.courseId.toString(),
            title: dbModule.title,
            description: dbModule.description,
            order: dbModule.order,
            xpReward: dbModule.xpReward,
            badgeReward: dbModule.badgeReward,
            learningObjectives: dbModule.learningObjectives,
            estimatedDuration: dbModule.estimatedDuration,
            difficulty: dbModule.difficulty,
            tags: dbModule.tags,
            publishedAt: dbModule.publishedAt,
            prerequisitesModulesId: dbModule.prerequisitesModulesId!.map(id => id.toString()),
            lessonsId: dbModule.lessons!.map(l => l.order)
        } as AppModels.IModule;
    }

    static toDb(appModule: AppModels.IModule | Partial<AppModels.IModule>): Partial<DbModels.IModuleDb> {
        return {
            _id: appModule.id ? new Types.ObjectId(appModule.id) : undefined,
            courseId: new Types.ObjectId(appModule.courseId),
            title: appModule.title!,
            description: appModule.description!,
            order: appModule.order!,
            prerequisitesModulesId: appModule.prerequisitesModulesId!.map(id => new Types.ObjectId(id)),
            xpReward: appModule.xpReward!,
            badgeReward: appModule.badgeReward!,
            learningObjectives: appModule.learningObjectives!,
            estimatedDuration: appModule.estimatedDuration!,
            difficulty: appModule.difficulty!,
            tags: appModule.tags!,
            publishedAt: appModule.publishedAt!
        }
    };

    static toResponseDto(module: AppModels.IModule): DTOs.ModuleResponseDto {
        return {
            id: module.id!,
            title: module.title,
            description: module.description,
            order: module.order,
            courseId: module.courseId,
            lessonsId: module.lessonsId,
            prerequisitesModulesId: module.prerequisitesModulesId,
            xpReward: module.xpReward,
            badgeReward: module.badgeReward!,
            learningObjectives: module.learningObjectives,
            estimatedDuration: module.estimatedDuration,
            difficulty: module.difficulty!,
            tags: module.tags,
            publishedAt: module.publishedAt,
            filesId: module.filesId!
        };
    }

    static toDetailsResponseDto(module: AppModels.IModule): DTOs.ModuleDetailsResponseDto {
        return {
            ...ModuleMapper.toResponseDto(module),
            lessons: module.lessons?.map(lesson => ({
                id: lesson.id!,
                title: lesson.title,
                content: lesson.content,
                order: lesson.order,
            })),
            files: module.files?.map(file => ({
                id: file.id,
                filename: file.filename,
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                path: file.path,
                version: file.version,
                uploadedBy: file.uploadedBy,
                uploadedAt: file.uploadedAt
            })),
            assignments: module.assignments?.map(assignment => ({
                id: assignment.id,
                moduleId: assignment.moduleId,
                title: assignment.title,
                description: assignment.description,
                dueDate: assignment.dueDate,
                allowedFileTypes: assignment.allowedFileTypes,
                maxFileSize: assignment.maxFileSize,
            }))
        };
    }

    static createDtoToDomain(dto: DTOs.CreateModuleDto): AppModels.IModule {
        return {
            id: '',
            courseId: dto.courseId!,
            title: dto.title!,
            description: dto.description!,
            order: dto.order!,
            lessonsId: dto.lessonsId!,
            prerequisitesModulesId: dto.prerequisitesModulesId!,
            xpReward: dto.xpReward!,
            badgeReward: dto.badgeReward,
            learningObjectives: dto.learningObjectives,
            estimatedDuration: dto.estimatedDuration,
            difficulty: dto.difficulty!,
            tags: dto.tags,
            filesId: dto.filesId,
        };
    }

    static updateDtoToDomain(dto: Partial<DTOs.CreateModuleDto>): Partial<AppModels.IModule> {
        return {
            title: dto.title,
            description: dto.description,
            order: dto.order,
            courseId: dto.courseId,
            lessonsId: dto.lessonsId,
            prerequisitesModulesId: dto.prerequisitesModulesId,
            xpReward: dto.xpReward,
            badgeReward: dto.badgeReward!,
            learningObjectives: dto.learningObjectives,
            estimatedDuration: dto.estimatedDuration,
            difficulty: dto.difficulty!,
            tags: dto.tags,
            publishedAt: dto.publishedAt,
            filesId: dto.filesId
        }
    }
}

export class FileMapper {
    public static toDomain(db: DbModels.IFileDb): AppModels.IFile {
        return {
            id: db._id.toString(),
            filename: db.filename,
            originalname: db.originalname,
            mimetype: db.mimetype,
            size: db.size,
            path: db.url,
            version: 1,
            uploadedBy: db.uploadedBy.toString(),
            uploadedAt: db.uploadedAt
        };
    }

    public static toDatabase(domain: Partial<AppModels.IFile>): Partial<DbModels.IFileDb> {
        const db: Partial<DbModels.IFileDb> = {
            filename: domain.filename,
            originalname: domain.originalname,
            mimetype: domain.mimetype,
            size: domain.size,
            url: domain.path,
            uploadedAt: domain.uploadedAt
        };
        if (domain.id) db._id = domain.id;
        if (domain.uploadedBy) db.uploadedBy = new ObjectId(domain.uploadedBy);
        return db;
    }

    public static toResponseDto(domain: AppModels.IFile): DTOs.IFileResponseDto {
        return {
            id: domain.id!,
            filename: domain.filename,
            originalname: domain.originalname,
            mimetype: domain.mimetype,
            size: domain.size,
            uploadedBy: domain.uploadedBy,
            uploadedAt: domain.uploadedAt
        };
    }

    public static fromCreateDto(dto: DTOs.IFileRequestDto): AppModels.IFile {
        return {
            filename: dto.filename,
            originalname: dto.originalname,
            mimetype: dto.mimetype,
            size: dto.size,
            path: '',
            version: 2,
            uploadedBy: dto.uploadedBy,
            uploadedAt: dto.uploadedAt
        };
    }

    public static fromUpdateDto(dto: Partial<DTOs.IFileRequestDto>): Partial<AppModels.IFile> {
        return {
            filename: dto.filename,
            originalname: dto.originalname,
            mimetype: dto.mimetype,
            size: dto.size,
            uploadedBy: dto.uploadedBy,
            uploadedAt: dto.uploadedAt
        };
    }
}

export class AssignmentMapper {
    static dbToDomain(db: DbModels.IAssignmentDb): AppModels.IAssignment {
        return {
            id: db._id.toString(),
            courseId: db.courseId.toString(),
            moduleId: db.moduleId.toString(),
            title: db.title,
            description: db.description,
            dueDate: db.dueDate,
            totalPoints: db.totalPoints,
            assignmentType: db.assignmentType,
            tasks: db.tasks.map(TaskMapper.dbToDomain),
            rubric: db.rubric,
            peerReviewSettings: db.peerReviewSettings,
            createdAt: db.createdAt,
            updatedAt: db.updatedAt
        };
    }

    static domainToDb(domain: AppModels.IAssignment | Partial<AppModels.IAssignment>): Partial<DbModels.IAssignmentDb> {
        return {
            _id: new Types.ObjectId(domain.id),
            courseId: new Types.ObjectId(domain.courseId),
            moduleId: new Types.ObjectId(domain.moduleId),
            title: domain.title,
            description: domain.description,
            dueDate: domain.dueDate,
            totalPoints: domain.totalPoints,
            assignmentType: domain.assignmentType,
            tasks: domain.tasks!.map(task => TaskMapper.domainToDb(task as AppModels.ITask)),
            rubric: domain.rubric,
            peerReviewSettings: domain.peerReviewSettings
        };
    }

    static toResponseDto(domain: AppModels.IAssignment): DTOs.AssignmentResponseDto {
        return {
            id: domain.id!,
            courseId: domain.courseId,
            moduleId: domain.moduleId,
            title: domain.title,
            description: domain.description,
            dueDate: domain.dueDate,
            totalPoints: domain.totalPoints,
            assignmentType: domain.assignmentType,
            tasks: domain.tasks?.map(task => TaskMapper.toResponseDto(task as AppModels.ITask)) ?? [],
            rubric: domain.rubric,
            peerReviewSettings: domain.peerReviewSettings,
            createdAt: domain.createdAt,
            updatedAt: domain.updatedAt
        };
    }

    static fromCreateDto(dto: DTOs.CreateAssignmentDto): AppModels.IAssignment {
        return {
            courseId: dto.courseId,
            moduleId: dto.moduleId,
            title: dto.title,
            description: dto.description,
            dueDate: dto.dueDate,
            totalPoints: dto.totalPoints,
            assignmentType: dto.assignmentType,
            tasks: dto.tasks.map(TaskMapper.fromCreateDto),
            rubric: dto.rubric,
            peerReviewSettings: dto.peerReviewSettings,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    static fromUpdateDto(dto: Partial<DTOs.CreateAssignmentDto>): Partial<AppModels.IAssignment> {
        return {
            courseId: dto.courseId,
            moduleId: dto.moduleId,
            title: dto.title,
            description: dto.description,
            dueDate: dto.dueDate,
            totalPoints: dto.totalPoints,
            assignmentType: dto.assignmentType,
            tasks: dto.tasks!.map(TaskMapper.fromUpdateDto),
            rubric: dto.rubric,
            peerReviewSettings: dto.peerReviewSettings,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
}

export class TaskMapper {
    static dbToDomain(db: DbModels.ITaskDb): AppModels.ITask {
        const baseTask: AppModels.IBaseTask = {
            assignmentId: '',  // This needs to be set by the parent assignment
            title: db.title,
            description: db.description,
            taskType: db.taskType,
            status: db.status,
            points: db.points,
            order: db.order,
            xpReward: 0,  // Set a default or retrieve from db if available
            requiredForCompletion: false  // Set a default or retrieve from db if available
        };

        switch (db.taskType) {
            case TaskTypeEnum.MULTI_CHOICE:
                return {
                    ...baseTask,
                    content: (db as DbModels.IMultiChoiceTaskDb).content
                } as AppModels.IMultiChoiceTask;
            case TaskTypeEnum.FILE_UPLOAD:
                return {
                    ...baseTask,
                    allowedFileTypes: (db as DbModels.IFileUploadTaskDb).content.allowedFileTypes,
                    maxFileSize: (db as DbModels.IFileUploadTaskDb).content.maxFileSize,
                    //content: (db as DbModels.IFileUploadTaskDb).content.files.map(FileMapper.toDomain)
                } as AppModels.IFileUploadTask;
            case TaskTypeEnum.QUESTION:
                return {
                    ...baseTask,
                    content: (db as DbModels.IQuestionTaskDb).content
                } as AppModels.IQuestionTask;
            default:
                throw new Error(`Unsupported task type: ${db.taskType}`);
        }
    }

    static domainToDb(domain: AppModels.ITask): DbModels.ITaskDb {
        const baseTask: DbModels.IBaseTaskDb = {
            taskIndex: domain.order,
            title: domain.title,
            description: domain.description,
            taskType: domain.taskType,
            status: domain.status,
            points: domain.points,
            order: domain.order
        };

        switch (domain.taskType) {
            case TaskTypeEnum.MULTI_CHOICE:
                return {
                    ...baseTask,
                    content: {
                        question: (domain as AppModels.IMultiChoiceTask).content.question,
                        options: (domain as AppModels.IMultiChoiceTask).content.options
                    }
                } as DbModels.IMultiChoiceTaskDb;
            case TaskTypeEnum.FILE_UPLOAD:
                return {
                    ...baseTask,
                    content: {
                        allowedFileTypes: (domain as AppModels.IFileUploadTask).allowedFileTypes,
                        maxFileSize: (domain as AppModels.IFileUploadTask).maxFileSize,
                        files: (domain as AppModels.IFileUploadTask).content.map(FileMapper.toDatabase)
                    }
                } as DbModels.IFileUploadTaskDb;
            case TaskTypeEnum.QUESTION:
                return {
                    ...baseTask,
                    content: {
                        questionType: (domain as AppModels.IQuestionTask).content.questionType,
                        question: (domain as AppModels.IQuestionTask).content.question,
                        correctAnswer: (domain as AppModels.IQuestionTask).content.correctAnswer
                    }
                } as DbModels.IQuestionTaskDb;
            default:
                throw new Error(`Unsupported task type: ${domain.taskType}`);
        }
    }

    static toResponseDto(domain: AppModels.ITask): DTOs.TaskResponseDto {
        const baseTask: DTOs.BaseTaskResponseDto = {
            id: domain.id!,
            title: domain.title,
            description: domain.description,
            taskType: domain.taskType,
            status: domain.status,
            points: domain.points,
            order: domain.order,
            xpReward: domain.xpReward,
            requiredForCompletion: domain.requiredForCompletion
        };

        switch (domain.taskType) {
            case TaskTypeEnum.MULTI_CHOICE:
                return {
                    ...baseTask,
                    content: {
                        question: (domain as AppModels.IMultiChoiceTask).content.question,
                        options: (domain as AppModels.IMultiChoiceTask).content.options
                    }
                } as DTOs.MultiChoiceTaskResponseDto;
            case TaskTypeEnum.FILE_UPLOAD:
                return {
                    ...baseTask,
                    content: {
                        allowedFileTypes: (domain as AppModels.IFileUploadTask).allowedFileTypes,
                        maxFileSize: (domain as AppModels.IFileUploadTask).maxFileSize,
                        //files: (domain as AppModels.IFileUploadTask).content.map(FileMapper.toDatabase)
                    }
                } as DTOs.FileUploadTaskResponseDto;
            case TaskTypeEnum.QUESTION:
                return {
                    ...baseTask,
                    content: {
                        questionType: (domain as AppModels.IQuestionTask).content.questionType,
                        question: (domain as AppModels.IQuestionTask).content.question,
                        correctAnswer: (domain as AppModels.IQuestionTask).content.correctAnswer
                    }
                } as DTOs.QuestionTaskResponseDto;
            default:
                throw new Error(`Unsupported task type: ${domain.taskType}`);
        }
    }

    static fromCreateDto(dto: DTOs.CreateTaskDto): AppModels.ITask {
        const baseTask: AppModels.IBaseTask = {
            title: dto.title,
            description: dto.description,
            taskType: dto.taskType,
            status: ProgressTypeEnum.NOT_STARTED,
            points: dto.points,
            order: dto.order,
            xpReward: dto.xpReward,
            requiredForCompletion: dto.requiredForCompletion,
            assignmentId: dto.assignmentId
        };

        switch (dto.taskType) {
            case TaskTypeEnum.MULTI_CHOICE:
                return {
                    ...baseTask,
                    content: {
                        question: (dto as DTOs.CreateMultiChoiceTaskDto).question,
                        options: (dto as DTOs.CreateMultiChoiceTaskDto).options
                    }
                } as AppModels.IMultiChoiceTask;
            case TaskTypeEnum.FILE_UPLOAD:
                return {
                    ...baseTask,
                    allowedFileTypes: (dto as DTOs.CreateFileUploadTaskDto).allowedFileTypes,
                    maxFileSize: (dto as DTOs.CreateFileUploadTaskDto).maxFileSize,
                    content: (dto as DTOs.CreateFileUploadTaskDto).content.map(FileMapper.fromCreateDto)
                } as AppModels.IFileUploadTask;
            case TaskTypeEnum.QUESTION:
                return {
                    ...baseTask,
                    content: {
                        questionType: (dto as DTOs.CreateQuestionTaskDto).questionType,
                        question: (dto as DTOs.CreateQuestionTaskDto).question,
                        correctAnswer: (dto as DTOs.CreateQuestionTaskDto).correctAnswer
                    }
                } as AppModels.IQuestionTask;
            default:
                throw new Error(`Unsupported task type: ${dto.taskType}`);
        }
    }

    static fromUpdateDto(dto: Partial<DTOs.CreateTaskDto>): Partial<AppModels.ITask> {
        const baseTask: Partial<AppModels.IBaseTask> = {
            title: dto.title,
            description: dto.description,
            taskType: dto.taskType,
            status: ProgressTypeEnum.NOT_STARTED,
            points: dto.points,
            order: dto.order,
            xpReward: dto.xpReward,
            requiredForCompletion: dto.requiredForCompletion,
            assignmentId: dto.assignmentId
        };

        switch (dto.taskType) {
            case TaskTypeEnum.MULTI_CHOICE:
                return {
                    ...baseTask,
                    content: {
                        question: (dto as DTOs.UpdateMultiChoiceTaskDto).question,
                        options: (dto as DTOs.UpdateMultiChoiceTaskDto).options
                    }
                } as Partial<AppModels.IMultiChoiceTask>;
            case TaskTypeEnum.FILE_UPLOAD:
                return {
                    ...baseTask,
                    allowedFileTypes: (dto as DTOs.UpdateFileUploadTaskDto).allowedFileTypes,
                    maxFileSize: (dto as DTOs.UpdateFileUploadTaskDto).maxFileSize,
                    content: (dto as DTOs.UpdateFileUploadTaskDto).content.map(FileMapper.fromCreateDto)
                } as Partial<AppModels.IFileUploadTask>;
            case TaskTypeEnum.QUESTION:
                return {
                    ...baseTask,
                    content: {
                        questionType: (dto as DTOs.UpdateQuestionTaskDto).questionType,
                        question: (dto as DTOs.UpdateQuestionTaskDto).question,
                        correctAnswer: (dto as DTOs.UpdateQuestionTaskDto).correctAnswer
                    }
                } as Partial<AppModels.IQuestionTask>;
            default:
                throw new Error(`Unsupported task type: ${dto.taskType}`);
        }

    }
}

export class SubmissionMapper {
    static dbToDomain(dbModel: DbModels.ISubmissionDb): AppModels.ISubmission {
        return {
            id: dbModel._id.toString(),
            userId: dbModel.userId.toString(), // Assuming UserMapper exists
            assignmentId: dbModel.assignmentId.toString(), // Assuming AssignmentMapper exists
            answers: dbModel.answers.map(AnswerMapper.dbToDomain),
            status: dbModel.status,
            submittedAt: dbModel.submittedAt,
            lastUpdatedAt: dbModel.lastUpdatedAt,
            attemptNumber: dbModel.attemptNumber,
            timeSpent: dbModel.timeSpent,
            isLate: dbModel.isLate,
            isPartial: dbModel.isPartial
        };
    }

    static domainToDb(appModel: Partial<AppModels.ISubmission>): Partial<DbModels.ISubmissionDb> {
        return {
            _id: appModel.id ? new Types.ObjectId(appModel.id) : undefined,
            userId: appModel.user ? new Types.ObjectId(appModel.user.id) : undefined,
            assignmentId: appModel.assignment ? new Types.ObjectId(appModel.assignment.id) : undefined,
            answers: appModel.answers?.map(AnswerMapper.domainToDb),
            status: appModel.status,
            submittedAt: appModel.submittedAt,
            lastUpdatedAt: appModel.lastUpdatedAt,
            attemptNumber: appModel.attemptNumber,
            timeSpent: appModel.timeSpent,
            isLate: appModel.isLate,
            isPartial: appModel.isPartial
        };
    }

    static toResponseDto(appModel: AppModels.ISubmission): DTOs.SubmissionResponseDto {
        return {
            id: appModel.id!,
            userId: appModel.user!.id!,
            assignmentId: appModel.assignment!.id!,
            answers: appModel.answers.map(AnswerMapper.toResponseDto),
            status: appModel.status,
            submittedAt: appModel.submittedAt,
            lastUpdatedAt: appModel.lastUpdatedAt,
            attemptNumber: appModel.attemptNumber,
            timeSpent: appModel.timeSpent,
            isLate: appModel.isLate,
            isPartial: appModel.isPartial
        };
    }

    static fromCreateDto(dto: DTOs.CreateSubmissionDto): AppModels.ISubmission {
        return {
            userId: dto.userId,
            assignmentId: dto.assignmentId,
            answers: dto.answers.map(AnswerMapper.fromCreateDto),
            status: dto.status,
            submittedAt: dto.submittedAt,
            lastUpdatedAt: dto.lastUpdatedAt,
            attemptNumber: dto.attemptNumber,
            timeSpent: dto.timeSpent,
            isLate: dto.isLate,
            isPartial: dto.isPartial,
            peerReviews: dto.peerReviews
        };
    }

    static fromUpdateDto(dto: DTOs.UpdateSubmissionDto): Partial<AppModels.ISubmission> {
        return {
            status: dto.status,
            answers: dto.answers?.map(AnswerMapper.fromCreateDto),
            timeSpent: dto.timeSpent
        };
    }
}

export class AnswerMapper {
    static dbToDomain(dbModel: DbModels.IAnswerDb): AppModels.IAnswer {
        const baseAnswer: AppModels.IBaseAnswer = {
            answerIndex: dbModel.answerIndex,
            answerType: dbModel.answerType,
            taskIndex: dbModel.taskIndex,
            status: dbModel.status
        };

        switch (dbModel.answerType) {
            case TaskTypeEnum.MULTI_CHOICE:
                return {
                    ...baseAnswer,
                    selectedOptions: (dbModel as DbModels.IMultiChoiceAnswerDb).selectedOptions
                };
            case TaskTypeEnum.FILE_UPLOAD:
                return {
                    ...baseAnswer,
                    filesId: (dbModel as DbModels.IFileUploadAnswerDb).filesId.map(fileId => fileId.toString())
                } as AppModels.IFileUploadAnswer;
            case TaskTypeEnum.QUESTION:
                return {
                    ...baseAnswer,
                    response: (dbModel as DbModels.IQuestionAnswerDb).response
                };
            default:
                throw new Error(`Unsupported answer type: ${dbModel.answerType}`);
        }
    }

    static domainToDb(appModel: AppModels.IAnswer): DbModels.IAnswerDb {
        const baseAnswer: DbModels.IBaseAnswerDb = {
            taskIndex: appModel.taskIndex,
            answerType: appModel.answerType,
            status: appModel.status,
            answerIndex: appModel.answerIndex
        };

        switch (appModel.answerType) {
            case TaskTypeEnum.MULTI_CHOICE:
                return {
                    ...baseAnswer,
                    selectedOptions: (appModel as AppModels.IMultiChoiceAnswer).selectedOptions
                } as DbModels.IMultiChoiceAnswerDb;
            case TaskTypeEnum.FILE_UPLOAD:
                return {
                    ...baseAnswer,
                    filesId: (appModel as AppModels.IFileUploadAnswer).filesId.map(id => new Types.ObjectId(id))
                } as DbModels.IFileUploadAnswerDb;
            case TaskTypeEnum.QUESTION:
                return {
                    ...baseAnswer,
                    response: (appModel as AppModels.IQuestionAnswer).response
                } as DbModels.IQuestionAnswerDb;
            default:
                throw new Error(`Unsupported answer type: ${appModel.answerType}`);
        }
    }

    static toResponseDto(appModel: AppModels.IAnswer): DTOs.AnswerResponseDto {
        const baseDto: DTOs.BaseAnswerResponseDto = {
            taskIndex: appModel.taskIndex,
            answerType: appModel.answerType,
            status: appModel.status,
            score: appModel.score,
            feedback: appModel.feedback,
            answerIndex: appModel.answerIndex
        };

        switch (appModel.answerType) {
            case TaskTypeEnum.MULTI_CHOICE:
                return {
                    ...baseDto,
                    selectedOptions:  (appModel as AppModels.IMultiChoiceAnswer).selectedOptions 
                } as DTOs.ResponseMultiChoiceAnswerDto;
            case TaskTypeEnum.FILE_UPLOAD:
                return {
                    ...baseDto,
                    files: (appModel as AppModels.IFileUploadAnswer).files?.map(FileMapper.toResponseDto) 
                } as DTOs.ResponseFileUploadAnswerDto;
            case TaskTypeEnum.QUESTION:
                return {
                    ...baseDto,
                    response: (appModel as AppModels.IQuestionAnswer).response
                } as DTOs.ResponseQuestionAnswerDto;
            default:
                throw new Error(`Unsupported answer type: ${appModel.answerType}`);
        }
    }

    static fromCreateDto(dto: DTOs.CreateAnswerDto): AppModels.IAnswer {
        const baseAnswer: Partial<AppModels.IBaseAnswer> = {
            taskIndex: dto.taskIndex,
            answerType: dto.answerType
        };

        switch (dto.answerType) {
            case TaskTypeEnum.MULTI_CHOICE:
                return {
                    ...baseAnswer,
                    selectedOptions: (dto as DTOs.CreateMultiChoiceAnswerDto).selectedOptions
                } as AppModels.IMultiChoiceAnswer;
            case TaskTypeEnum.FILE_UPLOAD:
                return {
                    ...baseAnswer,
                    files: (dto as DTOs.CreateFileUploadAnswerDto).files.map(FileMapper.fromCreateDto)
                } as AppModels.IFileUploadAnswer;
            case TaskTypeEnum.QUESTION:
                return {
                    ...baseAnswer,
                    response: (dto as DTOs.CreateQuestionAnswerDto).response
                } as AppModels.IQuestionAnswer;
            default:
                throw new Error(`Unsupported answer type: ${dto.answerType}`);
        }
    }

    static fromUpdateDto(dto: DTOs.UpdateAnswerDto): Partial<AppModels.IAnswer> {
        return {
            score: dto.score,
            feedback: dto.feedback
        };
    }
}

export class ProgressMapper {
    // DB to App Model
    static userProgressDbToAppModel(userProgressDb: DbModels.IUserProgressDb): IUserProgress {
        return {
            id: userProgressDb._id.toString(),
            userId: userProgressDb.userId.toString(),
            totalXP: userProgressDb.totalXP,
            level: userProgressDb.level,
            overallProgress: userProgressDb.overallProgress,
            courseProgress: userProgressDb.courseProgress.map(this.coursesToAppModel)
        };
    }

    private static coursesToAppModel(dbCourse: any): ICourseProgress {
        return {
            courseId: dbCourse.courseId.toString(),
            totalXP: dbCourse.totalXP,
            level: dbCourse.level,
            overallProgress: dbCourse.overallProgress,
            moduleProgress: dbCourse.moduleProgress.map(this.moduleToAppModel)
        };
    }

    private static moduleToAppModel(dbModule: any): IModuleProgress {
        return {
            moduleId: dbModule.moduleId.toString(),
            completed: dbModule.completed,
            earnedXP: dbModule.earnedXP,
            progressPercentage: dbModule.progressPercentage,
            lessonProgress: dbModule.lessonProgress.map(this.lessonToAppModel)
        };
    }

    private static lessonToAppModel(dbLesson: any): ILessonProgress {
        return {
            lessonId: dbLesson.lessonId.toString(),
            completed: dbLesson.completed,
            earnedXP: dbLesson.earnedXP,
            progressPercentage: dbLesson.progressPercentage,
            assignmentProgress: dbLesson.assignmentProgress.map(this.assignmentToAppModel)
        };
    }

    private static assignmentToAppModel(dbAssignment: any): IAssignmentProgress {
        return {
            assignmentId: dbAssignment.assignmentId.toString(),
            submitted: dbAssignment.submitted,
            submissionId: dbAssignment.submissionId?.toString(),
            earnedXP: dbAssignment.earnedXP,
            progressPercentage: dbAssignment.progressPercentage,
            taskProgress: dbAssignment.taskProgressIds.map(this.taskProgressIdToAppModel)
        };
    }

    private static taskProgressIdToAppModel(taskProgressId: ObjectId): ITaskProgress {
        return {
            taskId: taskProgressId.toString(),
            completed: false,  // These will be updated when actual task progress is fetched
            earnedXP: 0
        };
    }

    static taskProgressDbToAppModel(dbTask: DbModels.ITaskProgressDb): ITaskProgress {
        return {
            taskId: dbTask.taskId.toString(),
            completed: dbTask.completed,
            earnedXP: dbTask.earnedXP
        };
    }

    // App Model to DB
    static userProgressToDbModel(appModel: Partial<IUserProgress>): Partial<DbModels.IUserProgressDb> {
        return {
            userId: new ObjectId(appModel.userId),
            totalXP: appModel.totalXP,
            level: appModel.level,
            overallProgress: appModel.overallProgress,
            courseProgress: appModel.courseProgress?.map(this.courseToDbModel) ?? []
        } as unknown as Partial<DbModels.IUserProgressDb>;
    }

    private static courseToDbModel(appCourse: ICourseProgress): any {
        return {
            courseId: new ObjectId(appCourse.courseId),
            totalXP: appCourse.totalXP,
            level: appCourse.level,
            overallProgress: appCourse.overallProgress,
            moduleProgress: appCourse.moduleProgress.map(this.moduleToDbModel)
        };
    }

    private static moduleToDbModel(appModule: IModuleProgress): any {
        return {
            moduleId: new ObjectId(appModule.moduleId),
            completed: appModule.completed,
            earnedXP: appModule.earnedXP,
            progressPercentage: appModule.progressPercentage,
            lessonProgress: appModule.lessonProgress.map(this.lessonToDbModel)
        };
    }

    private static lessonToDbModel(appLesson: ILessonProgress): any {
        return {
            lessonId: new ObjectId(appLesson.lessonId),
            completed: appLesson.completed,
            earnedXP: appLesson.earnedXP,
            progressPercentage: appLesson.progressPercentage,
            assignmentProgress: appLesson.assignmentProgress.map(this.assignmentToDbModel)
        };
    }

    private static assignmentToDbModel(appAssignment: IAssignmentProgress): any {
        return {
            assignmentId: new ObjectId(appAssignment.assignmentId),
            submitted: appAssignment.submitted,
            submissionId: appAssignment.submissionId ? new ObjectId(appAssignment.submissionId) : undefined,
            earnedXP: appAssignment.earnedXP,
            progressPercentage: appAssignment.progressPercentage,
            taskProgressIds: appAssignment.taskProgress.map(task => new ObjectId(task.taskId))
        };
    }

    static taskProgressToDbModel(appTask: Partial<ITaskProgress>): DbModels.ITaskProgressDb {
        return {
            _id: new ObjectId(), // This should be set if available
            userId: new ObjectId(), // This should be set properly
            assignmentId: new ObjectId(), // This should be set properly
            taskId: new ObjectId(appTask.taskId),
            completed: appTask.completed,
            earnedXP: appTask.earnedXP
        } as unknown as DbModels.ITaskProgressDb;
    }

    // App Model to DTO
    static toDto(appModel: IUserProgress): UserProgressDTO {
        return {
            id: appModel.id!,
            userId: appModel.userId,
            totalXP: appModel.totalXP,
            level: appModel.level,
            overallProgress: appModel.overallProgress,
            courseProgress: appModel.courseProgress.map(this.courseToDto)
        };
    }

    private static courseToDto(appCourse: ICourseProgress): CourseProgressDTO {
        return {
            courseId: appCourse.courseId,
            level: appCourse.level,
            totalXP: appCourse.totalXP,
            overallProgress: appCourse.overallProgress,
            moduleProgress: appCourse.moduleProgress.map(this.moduleToDto)
        };
    }

    private static moduleToDto(appModule: IModuleProgress): ModuleProgressDTO {
        return {
            moduleId: appModule.moduleId,
            completed: appModule.completed,
            earnedXP: appModule.earnedXP,
            progressPercentage: appModule.progressPercentage,
            lessonProgress: appModule.lessonProgress.map(this.lessonToDto)
        };
    }

    private static lessonToDto(appModule: ILessonProgress): LessonProgressDTO {
        return {
            lessonId: appModule.lessonId,
            completed: appModule.completed,
            earnedXP: appModule.earnedXP,
            progressPercentage: appModule.progressPercentage,
            assignmentProgress: appModule.assignmentProgress.map(this.assignmentToDto)
        };
    }

    private static assignmentToDto(appAssignment: IAssignmentProgress): AssignmentProgressDTO {
        return {
            assignmentId: appAssignment.assignmentId,
            submitted: appAssignment.submitted,
            submissionId: appAssignment.submissionId,
            earnedXP: appAssignment.earnedXP,
            progressPercentage: appAssignment.progressPercentage,
            taskProgress: appAssignment.taskProgress.map(this.taskToDto)
        };
    }

    static taskToDto(appTask: ITaskProgress): TaskProgressDTO {
        return {
            taskId: appTask.taskId,
            completed: appTask.completed,
            earnedXP: appTask.earnedXP
        };
    }

    // DTO to App Model
    static fromDto(dto: UserProgressDTO): IUserProgress {
        return {
            id: dto.id,
            userId: dto.userId,
            totalXP: dto.totalXP,
            level: dto.level,
            overallProgress: dto.overallProgress,
            courseProgress: dto.courseProgress.map(this.courseFromDto)
        };
    }

    private static courseFromDto(dto: CourseProgressDTO): ICourseProgress {
        return {
            courseId: dto.courseId,
            level: dto.level,
            totalXP: dto.totalXP,
            overallProgress: dto.overallProgress,
            moduleProgress: dto.moduleProgress.map(this.moduleFromDto)
        };
    }

    private static moduleFromDto(dto: ModuleProgressDTO): IModuleProgress {
        return {
            moduleId: dto.moduleId,
            completed: dto.completed,
            earnedXP: dto.earnedXP,
            progressPercentage: dto.progressPercentage,
            lessonProgress: dto.lessonProgress.map(this.lessonFromDto)
        };
    }

    private static lessonFromDto(dto: LessonProgressDTO): ILessonProgress {
        return {
            lessonId: dto.lessonId,
            completed: dto.completed,
            earnedXP: dto.earnedXP,
            progressPercentage: dto.progressPercentage,
            assignmentProgress: dto.assignmentProgress.map(this.assignmentFromDto)
        };
    }

    private static assignmentFromDto(dto: AssignmentProgressDTO): IAssignmentProgress {
        return {
            assignmentId: dto.assignmentId,
            submitted: dto.submitted,
            submissionId: dto.submissionId,
            earnedXP: dto.earnedXP,
            progressPercentage: dto.progressPercentage,
            taskProgress: dto.taskProgress.map(this.taskFromDto)
        };
    }

    static taskFromDto(dto: TaskProgressDTO): ITaskProgress {
        return {
            taskId: dto.taskId,
            completed: dto.completed,
            earnedXP: dto.earnedXP
        };
    }
}




// export class SubmissionMapper {
//     // Submission Mappings
//     static submissionDbToApp(dbSubmission: DbModels.ISubmissionDb): AppModels.ISubmission {
//         return {
//             id: dbSubmission._id.toString(),
//             userId: dbSubmission.userId.toString(),
//             assignmentId: dbSubmission.assignmentId.toString(),
//             courseId: dbSubmission.courseId.toString(),
//             submittedAt: dbSubmission.submittedAt,
//             answers: dbSubmission.answers.map(answer => ({
//                 taskId: answer.taskId.toString(),
//                 answer: answer.answer,
//                 score: answer.score
//             })),
//             totalScore: dbSubmission.totalScore,
//             feedback: dbSubmission.feedback,
//             peerReviews: dbSubmission.peerReviews?.map(review => ({
//                 reviewerId: review.reviewerId.toString(),
//                 score: review.score,
//                 comments: review.comments
//             })),
//             plagiarismScore: dbSubmission.plagiarismScore
//         };
//     }

//     static submissionAppToDb(appSubmission: AppModels.ISubmission): DbModels.ISubmissionDb {
//         return {
//             _id: new Types.ObjectId(appSubmission.id),
//             userId: new Types.ObjectId(appSubmission.userId),
//             assignmentId: new Types.ObjectId(appSubmission.assignmentId),
//             courseId: new Types.ObjectId(appSubmission.courseId),
//             submittedAt: appSubmission.submittedAt,
//             answers: appSubmission.answers.map(answer => ({
//                 taskId: new Types.ObjectId(answer.taskId),
//                 answer: answer.answer,
//                 score: answer.score
//             })),
//             totalScore: appSubmission.totalScore,
//             feedback: appSubmission.feedback,
//             peerReviews: appSubmission.peerReviews?.map(review => ({
//                 reviewerId: new Types.ObjectId(review.reviewerId),
//                 score: review.score,
//                 comments: review.comments
//             })),
//             plagiarismScore: appSubmission.plagiarismScore
//         };
//     }

//     static submissionToDto(submission: AppModels.ISubmission): DTOs.SubmissionResponseDto {
//         return {
//             id: submission.id,
//             userId: submission.userId,
//             assignmentId: submission.assignmentId,
//             courseId: submission.courseId,
//             submittedAt: submission.submittedAt,
//             answers: submission.answers,
//             totalScore: submission.totalScore,
//             feedback: submission.feedback,
//             peerReviews: submission.peerReviews,
//             plagiarismScore: submission.plagiarismScore
//         };
//     }
// }
// export class ProgressMapper {
//     // Progress Mappings
//     static progressDbToApp(dbProgress: DbModels.IProgressDb): AppModels.IProgress {
//         return {
//             id: dbProgress._id.toString(),
//             userId: dbProgress.userId.toString(),
//             courseId: dbProgress.courseId.toString(),
//             moduleProgress: dbProgress.moduleProgress.map(mp => ({
//                 moduleId: mp.moduleId.toString(),
//                 completed: mp.completed,
//                 lastAccessedAt: mp.lastAccessedAt
//             })),
//             assignmentProgress: dbProgress.assignmentProgress.map(ap => ({
//                 assignmentId: ap.assignmentId.toString(),
//                 status: ap.status,
//                 score: ap.score,
//                 submittedAt: ap.submittedAt
//             })),
//             attendance: dbProgress.attendance,
//             overallProgress: dbProgress.overallProgress,
//             lastUpdated: dbProgress.lastUpdated
//         };
//     }

//     static progressAppToDb(appProgress: AppModels.IProgress): DbModels.IProgress {
//         return {
//             _id: new Types.ObjectId(appProgress.id),
//             userId: new Types.ObjectId(appProgress.userId),
//             courseId: new Types.ObjectId(appProgress.courseId),
//             moduleProgress: appProgress.moduleProgress.map(mp => ({
//                 moduleId: new Types.ObjectId(mp.moduleId),
//                 completed: mp.completed,
//                 lastAccessedAt: mp.lastAccessedAt
//             })),
//             assignmentProgress: appProgress.assignmentProgress.map(ap => ({
//                 assignmentId: new Types.ObjectId(ap.assignmentId),
//                 status: ap.status,
//                 score: ap.score,
//                 submittedAt: ap.submittedAt
//             })),
//             attendance: appProgress.attendance,
//             overallProgress: appProgress.overallProgress,
//             lastUpdated: appProgress.lastUpdated
//         };
//     }

//     static progressToDto(progress: AppModels.IProgress): DTOs.ProgressResponseDto {
//         return {
//             id: progress.id,
//             userId: progress.userId,
//             courseId: progress.courseId,
//             moduleProgress: progress.moduleProgress,
//             assignmentProgress: progress.assignmentProgress,
//             attendance: progress.attendance,
//             overallProgress: progress.overallProgress,
//             lastUpdated: progress.lastUpdated
//         };
//     }
// }


// // class SubmissionMapper extends BaseMapper<AppModels.ISubmission, DbModels.ISubmissionDb, DTOs.CreateSubmissionDto, DTOs.UpdateSubmissionDto, DTOs.SubmissionResponseDto> {
// //     constructor(private answerMapper: AnswerMapper) {
// //         super();
// //     }

// //     toDomain(db: DbModels.ISubmissionDb): AppModels.ISubmission {
// //         return {
// //             id: this.toString(db._id),
// //             user: { id: this.toString(db.userId) },
// //             assignment: { id: this.toString(db.assignmentId) },
// //             answers: db.answers.map(answer => this.answerMapper.toDomain(answer as DbModels.IBaseAnswerDb)),
// //             status: db.status,
// //             submittedAt: db.submittedAt,
// //             lastUpdatedAt: db.lastUpdatedAt,
// //             attemptNumber: db.attemptNumber,
// //             timeSpent: db.timeSpent,
// //             isLate: db.isLate,
// //             isPartial: db.isPartial
// //         };
// //     }

// //     toDatabase(domain: Partial<AppModels.ISubmission>): Partial<DbModels.ISubmissionDb> {
// //         const db: Partial<DbModels.ISubmissionDb> = {
// //             status: domain.status,
// //             submittedAt: domain.submittedAt,
// //             lastUpdatedAt: domain.lastUpdatedAt,
// //             attemptNumber: domain.attemptNumber,
// //             timeSpent: domain.timeSpent,
// //             isLate: domain.isLate,
// //             isPartial: domain.isPartial
// //         };
// //         if (domain.id) db._id = this.toObjectId(domain.id);
// //         if (domain.user) db.userId = this.toObjectId(domain.user.id);
// //         if (domain.assignment) db.assignmentId = this.toObjectId(domain.assignment.id);
// //         if (domain.answers) db.answers = domain.answers.map(answer => this.answerMapper.toDatabase(answer));
// //         return db;
// //     }

// //     toResponseDto(domain: AppModels.ISubmission): DTOs.SubmissionResponseDto {
// //         return {
// //             id: domain.id,
// //             userId: domain.user.id,
// //             assignmentId: domain.assignment.id,
// //             answers: domain.answers.map(answer => this.answerMapper.toResponseDto(answer)),
// //             status: domain.status,
// //             submittedAt: domain.submittedAt,
// //             lastUpdatedAt: domain.lastUpdatedAt,
// //             attemptNumber: domain.attemptNumber,
// //             timeSpent: domain.timeSpent,
// //             isLate: domain.isLate,
// //             isPartial: domain.isPartial
// //         };
// //     }

// //     fromCreateDto(dto: DTOs.CreateSubmissionDto): Partial<AppModels.ISubmission> {
// //         return {
// //             status: dto.status,
// //             submittedAt: new Date(),
// //             lastUpdatedAt: new Date(),
// //             attemptNumber: 1,
// //             timeSpent: dto.timeSpent,
// //             isLate: dto.isLate,
// //             isPartial: dto.isPartial,
// //             answers: dto.answers.map(answerDto => this.answerMapper.fromCreateDto(answerDto))
// //         };
// //     }

// //     fromUpdateDto(dto: Partial<DTOs.UpdateSubmissionDto>): Partial<AppModels.ISubmission> {
// //         const submission: Partial<AppModels.ISubmission> = {
// //             status: dto.status,
// //             lastUpdatedAt: new Date(),
// //             timeSpent: dto.timeSpent,
// //             isLate: dto.isLate,
// //             isPartial: dto.isPartial
// //         };
// //         if (dto.answers) {
// //             submission.answers = dto.answers.map(answerDto => this.answerMapper.fromUpdateDto(answerDto));
// //         }
// //         return submission;
// //     }
// // }
// // class AnswerMapper extends BaseMapper<AppModels.IBaseAnswer, DbModels.IBaseAnswerDb, DTOs.AnswerCreateDto, DTOs.AnswerUpdateDto, DTOs.AnswerResponseDto> {
// //     toDomain(db: IBaseAnswerDb): IBaseAnswer {
// //         const baseAnswer: IBaseAnswer = {
// //             id: this.toString(db._id),
// //             taskType: db.taskType as TaskTypeEnum,
// //             task: { id: this.toString(db.taskId) },
// //             submission: { id: this.toString(db.submissionId) },
// //             score: db.score,
// //             feedback: db.feedback
// //         };

// //         switch (db.taskType) {
// //             case TaskTypeEnum.MULTI_CHOICE:
// //                 return {
// //                     ...baseAnswer,
// //                     selectedOptions: (db as IMultiChoiceAnswerDb).selectedOptions
// //                 } as IMultiChoiceAnswer;
// //             case TaskTypeEnum.QUESTION:
// //                 return {
// //                     ...baseAnswer,
// //                     response: (db as IQuestionAnswerDb).response
// //                 } as IQuestionAnswer;
// //             case TaskTypeEnum.FILE_UPLOAD:
// //                 return {
// //                     ...baseAnswer,
// //                     file: { id: this.toString((db as IFileUploadAnswerDb).file) }
// //                 } as IFileUploadAnswer;
// //             default:
// //                 return baseAnswer;
// //         }
// //     }

// //     toDatabase(domain: Partial<IBaseAnswer>): Partial<IBaseAnswerDb> {
// //         const db: Partial<IBaseAnswerDb> = {
// //             taskType: domain.taskType,
// //             score: domain.score,
// //             feedback: domain.feedback
// //         };
// //         if (domain.id) db._id = this.toObjectId(domain.id);
// //         if (domain.task) db.taskId = this.toObjectId(domain.task.id);
// //         if (domain.submission) db.submissionId = this.toObjectId(domain.submission.id);

// //         switch (domain.taskType) {
// //             case TaskTypeEnum.MULTI_CHOICE:
// //                 (db as Partial<IMultiChoiceAnswerDb>).selectedOptions = (domain as IMultiChoiceAnswer).selectedOptions;
// //                 break;
// //             case TaskTypeEnum.QUESTION:
// //                 (db as Partial<IQuestionAnswerDb>).response = (domain as IQuestionAnswer).response;
// //                 break;
// //             case TaskTypeEnum.FILE_UPLOAD:
// //                 (db as Partial<IFileUploadAnswerDb>).file = this.toObjectId((domain as IFileUploadAnswer).file.id);
// //                 break;
// //         }

// //         return db;
// //     }

// //     toResponseDto(domain: IBaseAnswer): AnswerResponseDto {
// //         const responseDto: AnswerResponseDto = {
// //             id: domain.id,
// //             taskType: domain.taskType,
// //             taskId: domain.task.id,
// //             submissionId: domain.submission.id,
// //             score: domain.score,
// //             feedback: domain.feedback,
// //             content: {}
// //         };

// //         switch (domain.taskType) {
// //             case TaskTypeEnum.MULTI_CHOICE:
// //                 responseDto.content = { selectedOptions: (domain as IMultiChoiceAnswer).selectedOptions };
// //                 break;
// //             case TaskTypeEnum.QUESTION:
// //                 responseDto.content = { response: (domain as IQuestionAnswer).response };
// //                 break;
// //             case TaskTypeEnum.FILE_UPLOAD:
// //                 responseDto.content = { fileId: (domain as IFileUploadAnswer).file.id };
// //                 break;
// //         }

// //         return responseDto;
// //     }

// //     fromCreateDto(dto: AnswerCreateDto): Partial<IBaseAnswer> {
// //         const baseAnswer: Partial<IBaseAnswer> = {
// //             taskType: dto.taskType,
// //             task: { id: dto.taskId },
// //             submission: { id: dto.submissionId }
// //         };

// //         switch (dto.taskType) {
// //             case TaskTypeEnum.MULTI_CHOICE:
// //                 return {
// //                     ...baseAnswer,
// //                     selectedOptions: dto.content.selectedOptions
// //                 } as Partial<IMultiChoiceAnswer>;
// //             case TaskTypeEnum.QUESTION:
// //                 return {
// //                     ...baseAnswer,
// //                     response: dto.content.response
// //                 } as Partial<IQuestionAnswer>;
// //             case TaskTypeEnum.FILE_UPLOAD:
// //                 return {
// //                     ...baseAnswer,
// //                     file: { id: dto.content.fileId }
// //                 } as Partial<IFileUploadAnswer>;
// //             default:
// //                 return baseAnswer;
// //         }
// //     }

// //     fromUpdateDto(dto: AnswerUpdateDto): Partial<IBaseAnswer> {
// //         const baseAnswer: Partial<IBaseAnswer> = {
// //             score: dto.score,
// //             feedback: dto.feedback
// //         };

// //         if (dto.taskType) {
// //             baseAnswer.taskType = dto.taskType;
// //             switch (dto.taskType) {
// //                 case TaskTypeEnum.MULTI_CHOICE:
// //                     (baseAnswer as Partial<IMultiChoiceAnswer>).selectedOptions = dto.content?.selectedOptions;
// //                     break;
// //                 case TaskTypeEnum.QUESTION:
// //                     (baseAnswer as Partial<IQuestionAnswer>).response = dto.content?.response;
// //                     break;
// //                 case TaskTypeEnum.FILE_UPLOAD:
// //                     (baseAnswer as Partial<IFileUploadAnswer>).file = { id: dto.content?.fileId };
// //                     break;
// //             }
// //         }

// //         return baseAnswer;
// //     }
// // }

