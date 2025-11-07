const TYPES = {
    UserService: Symbol.for("UserService"),
    AssignmentService: Symbol.for("AssignmentService"),
    CourseService: Symbol.for("CourseService"),
    ModuleService: Symbol.for("ModuleService"),
    ProgressService: Symbol.for("ProgressService"),
    SubmissionService: Symbol.for("SubmissionService"),
    FileService: Symbol.for("FileService"),
    TaskProgressService: Symbol.for("TaskProgressService"),
    TaskService: Symbol.for("TaskService"),
    AiService: Symbol.for("AiService"),

    UserController: Symbol.for("UserController"),
    AssignmentController: Symbol.for("AssignmentController"),
    CourseController: Symbol.for("CourseController"),
    ModuleController: Symbol.for("ModuleController"),
    ProgressController: Symbol.for("ProgressController"),
    TaskController: Symbol.for("TaskController"),
    AuthController: Symbol.for("AuthController"),
    SubmissionController: Symbol.for("SubmissionController"),

    UserRepository: Symbol.for("UserRepository"),
    RoleRepository: Symbol.for("RoleRepository"),
    MongoUnitOfWork: Symbol.for("MongoUnitOfWork"),
    TaskRepository: Symbol.for("TaskRepository"),
    CourseRepository: Symbol.for("CourseRepository"),
    ModuleRepository: Symbol.for("ModuleRepository"),
    AssignmentRepository: Symbol.for("AssignmentRepository"),
    SubmissionRepository: Symbol.for("SubmissionRepository"),
    FileRepository: Symbol.for("FileRepository"),
    TaskProgressRepository: Symbol.for("TaskProgressRepository"),
    UserProgressRepository: Symbol.for("UserProgressRepository"),
    AssignmentProgressRepository: Symbol.for("AssignmentProgressRepository"),


    Logger: Symbol.for('Logger'),
    Mapper: Symbol.for('Mapper'),
    DbConnection: Symbol.for('DbConnection')

};

export interface ILogger {
    info(msg: any, meta?: any): void;
    error(msg: any, meta?: any): void;
    warn(msg: any, meta?: any): void;
    debug(msg: any, meta?: any): void;
    trace(msg: any, meta?: any): void;
    fatal(msg: any, meta?: any): void;
}



export { TYPES };