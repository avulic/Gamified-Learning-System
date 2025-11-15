
import { Answer, Assignment, Course, Module, Role, Task, User, File, BaseTask, BaseAnswer, BaseTaskSubmission, FileUploadTask, QuestionTask, QuizTask, CodeTask, CodeSubmission, FileUploadSubmission, MultiChoiceQuestion, Question, QuestionSubmission, QuizSubmission, TaskSubmission, TextQuestion, TrueFalseQuestion, BaseQuestion, MultiChoiceAnswer, TextAnswer, TrueFalseAnswer, QuizTaskContent, MultiChoiceOption, IGrade } from "@/models/app";
import { Lesson } from "@/models/app/Lesson.entity";
import { AssignmentProgress } from "@/models/app/Progress/AssignmentProgress.entity";
import { EnrolledCourse, Preferences } from "@/models/app/User.entity";
import { IFileDb, IBaseTaskDb, IAssignmentDb, ICourseDb, IModuleDb, IRoleDb, IUserDb, IBaseAnswerDb, IFileUploadTaskDb, IQuestionTaskDb, ITaskDb, IQuizTaskDb, ICodeTaskDb, ILessonDb, IMultiChoiceAnswerDb, ITextAnswerDb, ITrueFalseAnswerDb } from "@/models/db/mongo";
import AssignmentProgressModel, { IAssignmentProgressDb } from "@/models/db/mongo/AssignmentProgress.db";
import { IGradeDb } from "@/models/db/mongo/Grade.db";
import { IQuestionDb, IMultiChoiceQuestionDb, ITrueFalseQuestionDb, ITextQuestionDb, IBaseQuestionDb, IMultiChoiceOptionDb } from "@/models/db/mongo/Question.db";
import SubmissionDb, { IBaseTaskSubmissionDb, ICodeSubmissionDb, IFileUploadSubmissionDb, IQuestionSubmissionDb, IQuizSubmissionDb, ITaskSubmissionDb } from "@/models/db/mongo/Submission.db";
import {
    AssignmentSubmissionDto, AssignmentSubmissionResponseDto, CreateAssignmentDto,
    CreateBaseTaskDto, CreateCourseDetailsDto, CreateCourseDto,
    CreateFileDto, CreateModuleDto,
    CreateUserDto,
    TaskSubmissionDto,
} from "@/models/dto/request";
import { CreateBaseAnswerDto, CreateMultiChoiceAnswerDto, CreateTextAnswerDto, CreateTrueFalseAnswerDto } from "@/models/dto/request/CreateAnswer.dto";
import { CreateBaseQuestionDto, CreateMultiChoiceQuestionDto, CreateQuestionDto, CreateTextQuestionDto, CreateTrueFalseQuestionDto } from "@/models/dto/request/CreateQuestion.dto";
import { SubmissionResponseDto } from "@/models/dto/response";
import { ProgressTypeEnum, QuestionType, Roles, SubmissionStatus, SubmissionTypeEnum, TaskTypeEnum } from "@/models/enums";
import { th } from "@faker-js/faker";
import { classes } from "automapper-classes";
import { createMap, createMapper, extend, forMember, mapFrom, Mapper } from "automapper-core";
import { id } from "inversify";
import mongoose, { Types } from "mongoose";
import { title } from "process";



function getParamName(func: Function): string {
    const funcStr = func.toString();
    const match = funcStr.match(/(?:function\s*\w*\s*|\()\s*([^)]*)\)/);
    if (!match) return '';

    // Get the first parameter name
    const params = match[1].split(',');
    const firstParam = params[0].trim();
    return firstParam;
}
function autoMap<TSource extends object, TTarget extends object>(
    source: TSource,
    targetType: new () => TTarget,
    transformations: Partial<Record<keyof TTarget, (value: any) => any>> = {}
): TTarget {

    const target = new targetType();
    const targetKeys = Object.keys(target);

    for (const targetKey of targetKeys) {

        // manual transform first
        if (transformations[targetKey]) {
            const transform = transformations[targetKey]!;
            const paramName = getParamName(transform);
            const sourceKey = paramName || targetKey;

            if (sourceKey in source) {
                (target as any)[targetKey] = transform((source as any)[sourceKey]);
            }

            continue;
        }

        // same name property exists in source
        if (targetKey in source) {
            const value = (source as any)[targetKey];

            // deep copy arrays
            if (Array.isArray(value)) {
                (target as any)[targetKey] = value.map(v =>
                    typeof v === 'object' && v !== null
                        ? JSON.parse(JSON.stringify(v))
                        : v
                );
                continue;
            }

            // deep copy objects
            if (value && typeof value === 'object') {
                (target as any)[targetKey] = JSON.parse(JSON.stringify(value));
                continue;
            }

            (target as any)[targetKey] = value;
        }
    }

    return target;
}


function toId(id: string | undefined) {
    if (!id) return new Types.ObjectId();
    return new Types.ObjectId(id);
}

function checkIfObject(value: any): boolean {
    return value && typeof value === 'object' && '_id' in value;
}

abstract class BaseMapper<TEntity, TDb, TDto = any> {
    constructor() {
    }

    toEntity(dbModel: TDb): TEntity {
        try {
            return dbModel as unknown as TEntity;
        } catch (error) {
            console.log('toEntity error:', error);
            throw error;
        }
    }

    toDb(entity: TEntity): TDb {
        try {
            return entity as unknown as TDb;
        } catch (error) {
            console.log('toDb error:', error);
            throw error;
        }
    }

    fromRequest(requestModel: TDto): TEntity {
        try {
            return requestModel as unknown as TEntity;
        } catch (error) {
            console.log('fromRequest:', error);
            throw error;
        }
    }

    protected abstract getEntityType(): new () => TEntity;
    protected abstract getDbType(): new () => TDb;
    protected abstract getDtoType(): new () => TDto;
}


class FileMapper extends BaseMapper<File, IFileDb, CreateFileDto> {
    protected getEntityType() { return File; }
    protected getDbType() { return IFileDb; }
    protected getDtoType() { return CreateFileDto; }

    toDb(entity: File): IFileDb {
        try {
            return autoMap<File, IFileDb>(entity, this.getDbType(), {
                _id: (id) => toId(id),
                parentId: (parentId) => parentId ? toId(parentId) : undefined,
                uploadedBy: (uploadedBy) => uploadedBy ? toId(uploadedBy) : undefined,
                url: (url) => url
            });
        } catch (error) {
            console.log('toDb error:', error);
            throw error;
        }
    }

    toEntity(dbModel: IFileDb): File {
        try {
            return autoMap<IFileDb, File>(dbModel, this.getEntityType(), {
                id: (_id) => _id?.toString(),
                uploadedBy: (uploadedBy) => uploadedBy?.toString(),
                parentId: (parentId) => parentId?.toString(),
            });
        } catch (error) {
            console.log('toEntity error:', error);
            throw error;
        }
    }

    fromRequest(dto: CreateFileDto): File {
        try {
            return autoMap<CreateFileDto, File>(dto, this.getEntityType(), {

            });
        } catch (error) {
            console.log('fromRequest error:', error);
            throw error;
        }
    }
}

class TaskMapper extends BaseMapper<BaseTask, IBaseTaskDb, CreateBaseTaskDto> {
    constructor(private readonly questionMapper: QuestionMapper) {
        super();
    }

    protected getEntityType() { return BaseTask; }
    protected getDbType() { return IBaseTaskDb; }
    protected getDtoType() { return CreateBaseTaskDto; }

    private readonly baseEntityTransforms = {
        id: (_id: mongoose.Types.ObjectId | undefined) => _id?.toString(),
        assignmentId: (assignmentId: mongoose.Types.ObjectId) => assignmentId.toString(),
        prerequisites: (prerequisites: mongoose.Types.ObjectId[] | undefined) =>
            prerequisites?.map(p => p.toString())
    };

    private readonly baseDbTransforms = {
        _id: (id: string | undefined) => id ? toId(id) : undefined,
        assignmentId: (id: string) => toId(id),
        prerequisites: (prereqs: string[] | undefined) =>
            prereqs?.map(p => toId(p))
    };

    toEntity(dbModel: ITaskDb): Task {
        try {
            // const baseTask = autoMap<ITaskDb, BaseTask>(dbModel, this.getEntityType(), 
            //     this.baseEntityTransforms
            // );

            switch (dbModel.taskType) {
                case TaskTypeEnum.FILE_UPLOAD:
                    return autoMap<IFileUploadTaskDb, FileUploadTask>(
                        dbModel as IFileUploadTaskDb,
                        FileUploadTask as any,
                        {
                            ...this.baseEntityTransforms,
                            content: (content) => content
                        }
                    );

                case TaskTypeEnum.QUESTION:
                    return autoMap<IQuestionTaskDb, QuestionTask>(
                        dbModel as IQuestionTaskDb,
                        QuestionTask,
                        {
                            ...this.baseEntityTransforms,
                            content: (content) => this.questionMapper.toEntity(content)
                        }
                    );

                case TaskTypeEnum.QUIZ:
                    return autoMap<IQuizTaskDb, QuizTask>(
                        dbModel as IQuizTaskDb,
                        QuizTask as any,
                        {
                            ...this.baseEntityTransforms,
                            content: (content) => ({
                                ...content,
                                questions: content.questions.map(q =>
                                    this.questionMapper.toEntity(q)
                                )
                            })
                        }
                    );

                case TaskTypeEnum.CODE:
                    return autoMap<ICodeTaskDb, CodeTask>(
                        dbModel as ICodeTaskDb,
                        CodeTask as any,
                        {
                            ...this.baseEntityTransforms,
                            content: (content) => content
                        }
                    );

                default:
                    throw new Error(`Unknown task type: ${dbModel}`);
            }
        } catch (error) {
            console.log('toEntity error:', error);
            throw error;
        }
    }

    toDb(entity: Task): ITaskDb {
        try {
            switch (entity.taskType) {
                case TaskTypeEnum.FILE_UPLOAD:
                    return autoMap<FileUploadTask, IFileUploadTaskDb>(
                        entity as FileUploadTask,
                        IFileUploadTaskDb as any,
                        {
                            ...this.baseDbTransforms,
                            content: (content) => content
                        }
                    );

                case TaskTypeEnum.QUESTION:
                    return autoMap<QuestionTask, IQuestionTaskDb>(
                        entity as QuestionTask,
                        IQuestionTaskDb as any,
                        {
                            ...this.baseDbTransforms,
                            content: (content) => this.questionMapper.toDb(content)
                        }
                    );

                case TaskTypeEnum.QUIZ:
                    return autoMap<QuizTask, IQuizTaskDb>(
                        entity as QuizTask,
                        IQuizTaskDb as any,
                        {
                            ...this.baseDbTransforms,
                            content: (content) => ({
                                ...content,
                                questions: content.questions.map(q =>
                                    this.questionMapper.toDb(q)
                                )
                            })
                        }
                    );

                case TaskTypeEnum.CODE:
                    return autoMap<CodeTask, ICodeTaskDb>(
                        entity as CodeTask,
                        ICodeTaskDb as any,
                        {
                            ...this.baseDbTransforms,
                            content: (content) => content
                        }
                    );

                default:
                    throw new Error(`Unknown task type: ${entity}`);
            }
        } catch (error) {
            console.log('toDb error:', error);
            throw error;
        }
    }
}

class AssignmentMapper extends BaseMapper<Assignment, IAssignmentDb, CreateAssignmentDto> {
    constructor(private readonly taskMapper: TaskMapper) {
        super();
    }

    protected getEntityType() { return Assignment; }
    protected getDbType() { return IAssignmentDb; }
    protected getDtoType() { return CreateAssignmentDto; }

    toDb(entity: Assignment): IAssignmentDb {
        try {
            return autoMap<Assignment, IAssignmentDb>(entity, this.getDbType(), {
                _id: (id) => toId(id),
                parentId: (parentId) => toId(parentId),
                createdBy: (createdBy) => toId(createdBy),
                tasks: (tasks) => tasks?.map(t => this.taskMapper.toDb(t)),
                rubric: (rubric) => rubric ? {
                    criteria: rubric.criteria?.map(c => ({
                        criterion: c.criterion,
                        points: c.points
                    }))
                } : undefined
            });
        } catch (error) {
            console.log('toDb error:', error);
            throw error;
        }
    }

    toEntity(dbModel: IAssignmentDb): Assignment {
        try {
            return autoMap<IAssignmentDb, Assignment>(dbModel, this.getEntityType(), {
                id: (_id) => _id.toString(),
                parentId: (parentId) => parentId?.toString(),
                createdBy: (createdBy) => createdBy?.toString(),
                tasks: (tasks) => tasks?.map(t => this.taskMapper.toEntity(t)),
                rubric: (rubric) => rubric ? {
                    criteria: rubric.criteria?.map(c => ({
                        criterion: c.criterion,
                        points: c.points
                    }))
                } : undefined
            });
        } catch (error) {
            console.log('toEntity error:', error);
            throw error;
        }
    }

    fromRequest(requestModel: CreateAssignmentDto): Assignment {
        try {
            return autoMap<CreateAssignmentDto, Assignment>(requestModel, this.getEntityType(), {
                rubric: (rubric) => rubric ? {
                    criteria: rubric.criteria?.map(c => ({
                        criterion: c.criterion,
                        points: c.points
                    }))
                } : undefined
            });
        } catch (error) {
            console.log('fromRequest error:', error);
            throw error;
        }
    }
}

class CourseMapper extends BaseMapper<Course, ICourseDb, CreateCourseDetailsDto> {
    constructor(
        private readonly moduleMapper: ModuleMapper,
        private readonly assignmentMapper: AssignmentMapper,
        private readonly fileMapper: FileMapper,
        private readonly userMapper: UserMapper,
        private readonly taskMapper: TaskMapper
    ) {
        super();
    }

    protected getEntityType() { return Course; }
    protected getDbType() { return ICourseDb; }
    protected getDtoType() { return CreateCourseDetailsDto; }


    toEntity(dbModel: ICourseDb): Course {
        try {
            return autoMap<ICourseDb, Course>(dbModel, this.getEntityType(), {
                id: (_id) => _id?.toString(),
                modules: (modules) => modules?.map(m =>
                    this.moduleMapper.toEntity(m) as Module
                ),
                materials: (fileIds) => fileIds?.map(fileId => {
                    const fileData = typeof fileId === 'object' ? fileId : { _id: fileId };
                    return this.fileMapper.toEntity(fileData as IFileDb) as File;
                }
                ),
                assignments: (assignmentIds) => assignmentIds?.map(assignmentId =>
                    this.assignmentMapper.toEntity({ _id: assignmentId } as unknown as IAssignmentDb) as Assignment
                ),
                prerequisites: (prerequisites) => prerequisites?.map(id => id.toString() as unknown as Course),
                instructors: (instructors) => instructors?.map(instructor =>
                    this.userMapper.toEntity({ _id: instructor.id, name: instructor.name } as unknown as IUserDb) as User)
            });
        } catch (error) {
            console.log('toEntity error:', error);
            throw error;
        }
    }

    toDb(entity: Course): ICourseDb {
        try {
            return autoMap<Course, ICourseDb>(entity, this.getDbType(), {
                _id: (id) => toId(id),
                modules: (modules) => modules?.map(m => ({
                    _id: m.id,
                    title: m.title,
                    order: m.order || 0
                })),
                instructors: (instructors) => (instructors)?.map(i => {
                    const instructorId = toId(i.id);
                    // Add validation to ensure proper ObjectId structure
                    if (!(instructorId instanceof Types.ObjectId)) {
                        console.error('Invalid ObjectId structure:', instructorId);
                        throw new Error('Invalid instructor ID structure');
                    }

                    const instructorObj = {
                        _id: instructorId,
                        name: i.name
                    };
                    return instructorObj;
                }),
                assignmentIds: (assignments) => (assignments)?.map(a => toId(a.id)),
                fileIds: (materials) => (materials)?.map(f => toId(f.id)),
                prerequisites: (prerequisites) => (prerequisites)?.map(p => toId(p.id))
            });
        } catch (error) {
            console.log('toDb error:', error);
            throw error;
        }
    }

    fromRequest(requestModel: CreateCourseDetailsDto | CreateCourseDto): Course {
        try {
            if (this.isDetailedDto(requestModel)) {
                return this.mapFromDetails(requestModel);
            } else {
                return this.mapFromSimple(requestModel);
            }

        } catch (error) {
            console.log('fromRequest error:', error);
            throw error;
        }
    }

    private isDetailedDto(dto: any): dto is CreateCourseDetailsDto {
        return dto.modules !== undefined;
    }

    protected mapFromDetails(requestModel) {
        return autoMap<CreateCourseDetailsDto, Course>(requestModel, this.getEntityType(), {
            modules: (modules) => (modules)?.map(m => this.moduleMapper.fromRequest(m) as Module),
            materials: (fileIds) => (fileIds)?.map(f => this.fileMapper.fromRequest(f) as File),
            assignments: (assignmentIds) => (assignmentIds)?.map(a => this.assignmentMapper.fromRequest(a) as Assignment),
            prerequisites: (prerequisitesCourseIds) => prerequisitesCourseIds?.map(id => id),
            instructors: (instructors) => (instructors)?.map(i => ({
                id: i.id,
                name: i.name
            }))
        });
    }

    protected mapFromSimple(requestModel) {
        return autoMap<CreateCourseDto, Course>(requestModel, this.getEntityType(), {
            prerequisites: (prerequisitesCourseIds) => prerequisitesCourseIds?.map(id => toId(id)),
            modules: (modules) => (modules)?.map(m => {
                const module = this.moduleMapper.fromRequest(m);
                return {
                    id: module.id ? module.id.toString() : undefined,
                    title: module.title,
                    order: module.order
                }
            }),
            materials: (fileIds) => (fileIds)?.map(fileIds => toId(fileIds)),
            assignments: (assignmentIds) => (assignmentIds)?.map(assignmentIds => toId(assignmentIds)),
            instructors: (instructors) => (instructors)?.map(i => ({
                id: i.id,
                name: i.name
            }))
        });
    }
}

class ModuleMapper extends BaseMapper<Module, IModuleDb, CreateModuleDto> {
    constructor(
        private readonly assignmentMapper: AssignmentMapper,
        private readonly fileMapper: FileMapper
    ) {
        super();
    }

    protected getEntityType() { return Module; }
    protected getDbType() { return IModuleDb; }
    protected getDtoType() { return CreateModuleDto; }



    toEntity(dbModel: IModuleDb): Module {
        try {
            return autoMap<IModuleDb, Module>(dbModel, this.getEntityType(), {
                id: (_id) => _id?.toString(),
                courseId: (courseId) => courseId?.toString(),
                lessons: (lessons) => lessons?.map(l => ({
                    id: l._id.toString(),
                    title: l.title,
                    content: l.content || '',
                    order: l.order || 0,
                    assignments: l.assignmentIds?.map(assignmentId => {
                        const assignmentData = typeof assignmentId === 'object' ? assignmentId : { _id: assignmentId };
                        return this.assignmentMapper.toEntity(assignmentData as IAssignmentDb) as Assignment;
                    }),
                    files: l.fileIds?.map(fileId => {
                        const fileData = typeof fileId === 'object' ? fileId : { _id: fileId };
                        return this.fileMapper.toEntity(fileData as IFileDb) as File;
                    }),
                })),
                prerequisites: (prerequisitesModulesId) => prerequisitesModulesId?.map(id => ({ id: id.toString() }) as Module),
                assignments: (assignmentIds) => assignmentIds?.map(a => this.assignmentMapper.toEntity(a) as Assignment),
            });
        } catch (error) {
            console.log('toEntity error:', error);
            throw error;
        }
    }

    toDb(entity: Module): IModuleDb {
        try {
            return autoMap<Module, IModuleDb>(
                entity,
                this.getDbType(),
                {
                    _id: (id) => toId(id),
                    courseId: (courseId) => toId(courseId),
                    prerequisitesModulesId: (prerequisites: Module[] | undefined) =>
                        prerequisites?.map(m => toId(m.id)),
                    assignmentIds: (assignments: Assignment[] | undefined) =>
                        assignments?.map(a => toId(a.id)),
                    lessons: (lessons: Lesson[] | undefined) =>
                        lessons?.map(l => ({
                            _id: toId(l.id),
                            title: l.title,
                            content: l.content,
                            order: l.order,
                            assignmentIds: l.assignments?.map(a => toId(a.id)),
                            fileIds: l.files?.map(f => toId(f.id))
                        } as ILessonDb)),
                    fileIds: (files: File[] | undefined) =>
                        files?.map(f => toId(f.id))

                }
            );
        } catch (error) {
            console.log('toDb error:', error);
            throw error;
        }
    }

    fromRequest(requestModel: CreateModuleDto): Module {
        try {
            return autoMap<CreateModuleDto, Module>(
                requestModel, this.getEntityType(), {
                prerequisites: (prerequisitesModulesId) => prerequisitesModulesId?.map(id => toId(id)),
                files: (files) => (files)?.map(f => this.fileMapper.fromRequest(f) as File),
                assignments: (assignments) => assignments?.map(a => this.assignmentMapper.fromRequest(a) as Assignment),
                lessons: (lessons) => lessons?.map(l => ({
                    id: l.id ? l.id : undefined,
                    title: l.title,
                    content: l.content || '',
                    order: l.order || 0,
                    assignments: l.assignments?.map(a => this.assignmentMapper.fromRequest(a) as Assignment),
                    files: l.files?.map(f => this.fileMapper.fromRequest(f) as File),
                })),
            }
            );
        } catch (error) {
            console.log('fromRequest error:', error);
            throw error;
        }
    }
}



class RoleMapper extends BaseMapper<Role, IRoleDb, any> {
    protected getEntityType() { return Role; }
    protected getDbType() { return IRoleDb; }
    protected getDtoType() { return {} as any; }

    toEntity(dbModel: IRoleDb): Role {
        try {
            // Validate role name
            if (!dbModel.name || !Object.values(Roles).includes(dbModel.name as Roles)) {
                throw new Error(`Invalid role name: ${dbModel.name}`);
            }
            return autoMap<IRoleDb, Role>(dbModel, this.getEntityType(), {
                name: (name) => name as Roles
            });

        } catch (error) {
            console.log('toEntity error:', error);
            throw error;
        }
    }

    toDb(entity: Role): IRoleDb {
        try {
            // Validate role name
            if (!entity.name || !Object.values(Roles).includes(entity.name)) {
                throw new Error(`Invalid role name: ${entity.name}`);
            }

            return autoMap<Role, IRoleDb>(entity, this.getDbType(), {
                _id: (id) => id ? toId(id) : undefined,  // Changed to use parameter
                name: (name) => name
            });
        } catch (error) {
            console.log('toDb error:', error);
            throw error;
        }
    }
}

class UserMapper extends BaseMapper<User, IUserDb, CreateUserDto> {
    protected getEntityType() { return User; }
    protected getDbType() { return IUserDb; }
    protected getDtoType() { return CreateUserDto; }


    constructor(private readonly roleMapper: RoleMapper) {
        super();
    }

    toEntity(dbModel: IUserDb): User {
        try {
            return autoMap<IUserDb, User>(dbModel, this.getEntityType(), {
                id: (_id) => _id?.toString(),
                roles: (roles) => (roles)?.map(r => r.name),
                enrolledCourses: (enrolledCourses) => (enrolledCourses)?.map(course => ({
                    courseId: course.courseId.toString(),
                    courseName: course.courseName
                }))
            });
        } catch (error) {
            console.log('toEntity error:', error);
            throw error;
        }
    }

    toDb(entity: User): IUserDb {
        try {
            return autoMap<User, IUserDb>(entity, this.getDbType(), {
                _id: (id) => toId(id),
                roles: (roles) => roles.map(r => this.roleMapper.toDb(r)),
                enrolledCourses: (courses) => (courses)?.map(course => ({
                    courseId: toId(course.courseId),
                    courseName: course.courseName
                }))
            });
        } catch (error) {
            console.log('toDb error:', error);
            throw error;
        }
    }

    fromRequest(dto: CreateUserDto): User {
        if (!dto) throw new Error('DTO cannot be null');

        try {

            return autoMap<CreateUserDto, User>(dto, this.getEntityType(), {
                roles: (roles) => (roles)?.map(r => ({
                    id: '',
                    name: r
                })),
                preferences: (preferences) => preferences || {
                    notifications: true,
                    theme: 'light',
                    language: 'en'
                },
                enrolledCourses: (courses) => courses || []
            });

        } catch (error) {
            console.log('fromRequest error:', error);
            throw error;
        }
    }
}

class QuestionMapper extends BaseMapper<BaseQuestion, IBaseQuestionDb, CreateBaseQuestionDto> {
    protected getEntityType() { return BaseQuestion; }
    protected getDbType() { return IBaseQuestionDb; }
    protected getDtoType() { return CreateBaseQuestionDto; }

    // Base property transformations for entity
    private readonly baseEntityTransforms = {
        id: (_id: mongoose.Types.ObjectId | undefined) => _id?.toString(),
        question: (question: string) => question,
        questionType: (type: QuestionType) => type
    };

    // Base property transformations for db
    private readonly baseDbTransforms = {
        _id: (id: string | undefined) => id ? toId(id) : undefined,
        question: (question: string) => question,
        questionType: (type: QuestionType) => type
    };

    private mapMultiChoiceToEntity(dbModel: IMultiChoiceQuestionDb): MultiChoiceQuestion {
        return autoMap<IMultiChoiceQuestionDb, MultiChoiceQuestion>(
            dbModel,
            MultiChoiceQuestion as any,
            {
                ...this.baseEntityTransforms,
                options: (options) => options.map(opt => ({
                    text: opt.text,
                    isCorrect: opt.isCorrect
                }))
            }
        );
    }

    private mapTrueFalseToEntity(dbModel: ITrueFalseQuestionDb): TrueFalseQuestion {
        return autoMap<ITrueFalseQuestionDb, TrueFalseQuestion>(
            dbModel,
            TrueFalseQuestion as any,
            {
                ...this.baseEntityTransforms,
                correctAnswer: (value) => value
            }
        );
    }

    private mapTextToEntity(dbModel: ITextQuestionDb): TextQuestion {
        return autoMap<ITextQuestionDb, TextQuestion>(
            dbModel,
            TextQuestion as any,
            {
                ...this.baseEntityTransforms,
                correctAnswer: (value) => value
            }
        );
    }

    private mapMultiChoiceToDb(entity: MultiChoiceQuestion): IMultiChoiceQuestionDb {
        return autoMap<MultiChoiceQuestion, IMultiChoiceQuestionDb>(
            entity,
            IMultiChoiceQuestionDb as any,
            {
                ...this.baseDbTransforms,
                options: (options) => options.map(opt => ({
                    text: opt.text,
                    isCorrect: opt.isCorrect
                }))
            }
        );
    }

    private mapTrueFalseToDb(entity: TrueFalseQuestion): ITrueFalseQuestionDb {
        return autoMap<TrueFalseQuestion, ITrueFalseQuestionDb>(
            entity,
            ITrueFalseQuestionDb as any,
            {
                ...this.baseDbTransforms,
                correctAnswer: (value) => value
            }
        );
    }

    private mapTextToDb(entity: TextQuestion): ITextQuestionDb {
        return autoMap<TextQuestion, ITextQuestionDb>(
            entity,
            ITextQuestionDb as any,
            {
                ...this.baseDbTransforms,
                correctAnswer: (value) => value
            }
        );
    }

    toEntity(dbModel: IQuestionDb): Question {
        try {
            switch (dbModel.questionType) {
                case QuestionType.MULTI_CHOICE:
                    return this.mapMultiChoiceToEntity(dbModel as IMultiChoiceQuestionDb);
                case QuestionType.TRUE_FALSE:
                    return this.mapTrueFalseToEntity(dbModel as ITrueFalseQuestionDb);
                case QuestionType.TEXT:
                    return this.mapTextToEntity(dbModel as ITextQuestionDb);
                default:
                    throw new Error(`Unknown question type: ${dbModel}`);
            }
        } catch (error) {
            console.log('toEntity error:', error);
            throw error;
        }
    }

    toDb(entity: Question): IQuestionDb {
        try {
            switch (entity.questionType) {
                case QuestionType.MULTI_CHOICE:
                    return this.mapMultiChoiceToDb(entity as MultiChoiceQuestion);
                case QuestionType.TRUE_FALSE:
                    return this.mapTrueFalseToDb(entity as TrueFalseQuestion);
                case QuestionType.TEXT:
                    return this.mapTextToDb(entity as TextQuestion);
                default:
                    throw new Error(`Unknown question type: ${entity.questionType}`);
            }
        } catch (error) {
            console.log('toDb error:', error);
            throw error;
        }
    }


    fromRequest(dto: CreateQuestionDto): Question {
        try {
            const transforms = {
                ...this.baseEntityTransforms,
                id: () => undefined // New entities don't have an id yet
            };

            switch (dto.questionType) {
                case QuestionType.MULTI_CHOICE:
                    return autoMap<CreateMultiChoiceQuestionDto, MultiChoiceQuestion>(
                        dto as CreateMultiChoiceQuestionDto,
                        MultiChoiceQuestion as any,
                        {
                            ...transforms,
                            options: (options) => options.map(opt => ({
                                text: opt.text,
                                isCorrect: opt.isCorrect
                            }))
                        }
                    );

                case QuestionType.TRUE_FALSE:
                    return autoMap<CreateTrueFalseQuestionDto, TrueFalseQuestion>(
                        dto as CreateTrueFalseQuestionDto,
                        TrueFalseQuestion as any,
                        {
                            ...transforms,
                            correctAnswer: (value) => value
                        }
                    );

                case QuestionType.TEXT:
                    return autoMap<CreateTextQuestionDto, TextQuestion>(
                        dto as CreateTextQuestionDto,
                        TextQuestion as any,
                        {
                            ...transforms,
                            correctAnswer: (value) => value
                        }
                    );

                default:
                    throw new Error(`Unknown question type: ${dto.questionType}`);
            }
        } catch (error) {
            console.log('fromRequest error:', error);
            throw error;
        }
    }
}

class AnswerMapper extends BaseMapper<BaseAnswer, IBaseAnswerDb, CreateBaseAnswerDto> {
    protected getEntityType() { return BaseAnswer; }
    protected getDbType() { return IBaseAnswerDb; }
    protected getDtoType() { return CreateBaseAnswerDto; }

    // Base transforms for entity mapping
    private readonly baseEntityTransforms = {
        id: (_id: mongoose.Types.ObjectId | undefined) => _id?.toString(),
        taskId: (taskId: mongoose.Types.ObjectId) => taskId.toString(),
        questionId: (questionId: mongoose.Types.ObjectId) => questionId.toString()
    };

    // Base transforms for db mapping
    private readonly baseDbTransforms = {
        _id: (id: string | undefined) => id ? toId(id) : undefined,
        taskId: (taskId: string) => toId(taskId),
        questionId: (questionId: string) => toId(questionId)
    };

    // Base transforms for request mapping
    private readonly baseRequestTransforms = {
        submittedAt: () => new Date(),
        isCorrect: () => false, // Will be evaluated later
        score: () => 0 // Will be evaluated later
    };

    // Entity mapping methods for each answer type
    private mapMultiChoiceToEntity(dbModel: IMultiChoiceAnswerDb): MultiChoiceAnswer {
        return autoMap<IMultiChoiceAnswerDb, MultiChoiceAnswer>(
            dbModel,
            MultiChoiceAnswer as any,
            {
                ...this.baseEntityTransforms,
                selectedOptionIds: (ids) => ids || []
            }
        );
    }

    private mapTrueFalseToEntity(dbModel: ITrueFalseAnswerDb): TrueFalseAnswer {
        return autoMap<ITrueFalseAnswerDb, TrueFalseAnswer>(
            dbModel,
            TrueFalseAnswer as any,
            this.baseEntityTransforms
        );
    }

    private mapTextToEntity(dbModel: ITextAnswerDb): TextAnswer {
        return autoMap<ITextAnswerDb, TextAnswer>(
            dbModel,
            TextAnswer as any,
            {
                ...this.baseEntityTransforms,
            }
        );
    }

    // DB mapping methods for each answer type
    private mapMultiChoiceToDb(entity: MultiChoiceAnswer): IMultiChoiceAnswerDb {
        return autoMap<MultiChoiceAnswer, IMultiChoiceAnswerDb>(
            entity,
            IMultiChoiceAnswerDb as any,
            {
                ...this.baseDbTransforms,
                selectedOptionIds: (ids) => ids || []
            }
        );
    }

    private mapTrueFalseToDb(entity: TrueFalseAnswer): ITrueFalseAnswerDb {
        return autoMap<TrueFalseAnswer, ITrueFalseAnswerDb>(
            entity,
            ITrueFalseAnswerDb as any,
            this.baseDbTransforms
        );
    }

    private mapTextToDb(entity: TextAnswer): ITextAnswerDb {
        return autoMap<TextAnswer, ITextAnswerDb>(
            entity,
            ITextAnswerDb as any,
            {
                ...this.baseDbTransforms,
            }
        );
    }

    // Request mapping methods for each answer type
    private mapMultiChoiceFromRequest(dto: CreateMultiChoiceAnswerDto): MultiChoiceAnswer {
        return autoMap<CreateMultiChoiceAnswerDto, MultiChoiceAnswer>(
            dto,
            MultiChoiceAnswer as any,
            {
                ...this.baseRequestTransforms,
                selectedOptionIds: (ids) => ids || []
            }
        );
    }

    private mapTrueFalseFromRequest(dto: CreateTrueFalseAnswerDto): TrueFalseAnswer {
        return autoMap<CreateTrueFalseAnswerDto, TrueFalseAnswer>(
            dto,
            TrueFalseAnswer as any,
            this.baseRequestTransforms
        );
    }

    private mapTextFromRequest(dto: CreateTextAnswerDto): TextAnswer {
        return autoMap<CreateTextAnswerDto, TextAnswer>(
            dto,
            TextAnswer as any,
            {
                ...this.baseRequestTransforms,
            }
        );
    }

    toEntity(dbModel: IBaseAnswerDb): Answer {
        try {
            switch (dbModel.questionType) {
                case QuestionType.MULTI_CHOICE:
                    return this.mapMultiChoiceToEntity(dbModel as IMultiChoiceAnswerDb);
                case QuestionType.TRUE_FALSE:
                    return this.mapTrueFalseToEntity(dbModel as ITrueFalseAnswerDb);
                case QuestionType.TEXT:
                    return this.mapTextToEntity(dbModel as ITextAnswerDb);
                default:
                    throw new Error(`Unknown answer type: ${dbModel.questionType}`);
            }
        } catch (error) {
            console.log('toEntity error:', error);
            throw error;
        }
    }

    toDb(entity: Answer): IBaseAnswerDb {
        try {
            switch (entity.questionType) {
                case QuestionType.MULTI_CHOICE:
                    return this.mapMultiChoiceToDb(entity as MultiChoiceAnswer);
                case QuestionType.TRUE_FALSE:
                    return this.mapTrueFalseToDb(entity as TrueFalseAnswer);
                case QuestionType.TEXT:
                    return this.mapTextToDb(entity as TextAnswer);
                default:
                    throw new Error(`Unknown answer type: ${entity}`);
            }
        } catch (error) {
            console.log('toDb error:', error);
            throw error;
        }
    }

    fromRequest(dto: CreateBaseAnswerDto): Answer {
        try {
            switch (dto.questionType) {
                case QuestionType.MULTI_CHOICE:
                    return this.mapMultiChoiceFromRequest(dto as CreateMultiChoiceAnswerDto);
                case QuestionType.TRUE_FALSE:
                    return this.mapTrueFalseFromRequest(dto as CreateTrueFalseAnswerDto);
                case QuestionType.TEXT:
                    return this.mapTextFromRequest(dto as CreateTextAnswerDto);
                default:
                    throw new Error(`Unknown answer type: ${dto.questionType}`);
            }
        } catch (error) {
            console.log('fromRequest error:', error);
            throw error;
        }
    }
}



// export class GradeMapper extends BaseMapper<IGrade, IGradeDb, any> {
//     protected getEntityType() { return IGrade; }
//     protected getDbType() { return IGradeDb; }
//     protected getDtoType() { return {} as any; }

//     toEntity(dbModel: IGradeDb): IGrade {
//         try {
//             return autoMap<IGradeDb, IGrade>(dbModel, this.getEntityType(), {
//                 id: (_id) => _id?.toString(),
//                 gradedBy: (gradedBy) => gradedBy?.toString(),
//                 rubricScores: (rubricScores) => rubricScores?.map(score => ({
//                     criteriaId: score.criteriaId.toString(),
//                     score: score.score,
//                     comment: score.comment
//                 })),
//                 history: (history) => history?.map(entry => ({
//                     gradedAt: entry.gradedAt,
//                     gradedBy: entry.gradedBy.toString(),
//                     score: entry.score,
//                     feedback: entry.feedback
//                 }))
//             });
//         } catch (error) {
//             console.log('toEntity error:', error);
//             throw error;
//         }
//     }

//     toDb(entity: IGrade): IGradeDb {
//         try {
//             return autoMap<IGrade, IGradeDb>(entity, this.getDbType(), {
//                 _id: (id) => id ? toId(id) : undefined,
//                 gradedBy: (gradedBy) => gradedBy ? toId(gradedBy) : undefined,
//                 rubricScores: (rubricScores) => rubricScores?.map(score => ({
//                     criteriaId: toId(score.criteriaId),
//                     score: score.score,
//                     comment: score.comment
//                 })),
//                 history: (history) => history?.map(entry => ({
//                     gradedAt: entry.gradedAt,
//                     gradedBy: toId(entry.gradedBy),
//                     score: entry.score,
//                     feedback: entry.feedback
//                 }))
//             });
//         } catch (error) {
//             console.log('toDb error:', error);
//             throw error;
//         }
//     }


// }

export class AssignmentProgressMapper extends BaseMapper<AssignmentProgress, IAssignmentProgressDb, any> {
    protected getEntityType() { return AssignmentProgress; }
    protected getDbType() { return IAssignmentProgressDb; }
    protected getDtoType() { return {} as any; }

    toEntity(dbModel: IAssignmentProgressDb): AssignmentProgress {
        try {
            return autoMap<IAssignmentProgressDb, AssignmentProgress>(dbModel, this.getEntityType(), {
                id: (_id) => _id?.toString(),
                userId: (userId) => userId.toString(),
                assignmentId: (assignmentId) => assignmentId.toString(),
                tasksProgress: (tasksProgress) => tasksProgress?.map(task => ({
                    taskId: task.taskId.toString(),
                    status: task.status,
                    attempts: task.attempts,
                    bestScore: task.bestScore,
                    lastSubmissionId: task.lastSubmissionId?.toString(),
                    firstAttemptAt: task.firstAttemptAt,
                    lastAttemptAt: task.lastAttemptAt,
                    timeSpent: task.timeSpent
                })),
                // Metrics object can be passed as-is since it contains only primitive types
                // but we need to ensure proper type conversion for any nested objects
                metrics: (metrics) => ({
                    ...metrics,
                    timeSpentByTaskType: metrics.timeSpentByTaskType,
                    taskCompletionByType: metrics.taskCompletionByType
                })
            });
        } catch (error) {
            console.log('toEntity error:', error);
            throw error;
        }
    }

    toDb(entity: AssignmentProgress): IAssignmentProgressDb {
        try {
            return autoMap<AssignmentProgress, IAssignmentProgressDb>(entity, this.getDbType(), {
                _id: (id) => id ? toId(id) : undefined,
                userId: (userId) => toId(userId),
                assignmentId: (assignmentId) => toId(assignmentId),
                tasksProgress: (tasksProgress) => tasksProgress?.map(task => ({
                    taskId: toId(task.taskId),
                    status: task.status,
                    attempts: task.attempts,
                    bestScore: task.bestScore,
                    lastSubmissionId: task.lastSubmissionId ? toId(task.lastSubmissionId) : undefined,
                    firstAttemptAt: task.firstAttemptAt,
                    lastAttemptAt: task.lastAttemptAt,
                    timeSpent: task.timeSpent
                })),
                // Metrics object can be passed as-is since it contains only primitive types
                metrics: (metrics) => ({
                    ...metrics,
                    timeSpentByTaskType: metrics.timeSpentByTaskType,
                    taskCompletionByType: metrics.taskCompletionByType
                })
            });
        } catch (error) {
            console.log('toDb error:', error);
            throw error;
        }
    }

    // No specific DTO mapping needed for this entity as it's primarily 

}


export const assignmentProgressMapper = new AssignmentProgressMapper();


export const roleMapper = new RoleMapper();
export const userMapper = new UserMapper(roleMapper);

export const answerMapper = new AnswerMapper();
export const questionMapper = new QuestionMapper();


export const fileMapper = new FileMapper();
export const taskMapper = new TaskMapper(questionMapper);
export const assignmentMapper = new AssignmentMapper(taskMapper);
export const moduleMapper = new ModuleMapper(assignmentMapper, fileMapper);


export const courseMapper = new CourseMapper(moduleMapper, assignmentMapper, fileMapper, userMapper, taskMapper);







