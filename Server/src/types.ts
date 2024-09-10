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
    
    UserController: Symbol.for("UserController"),
    AssignmentController: Symbol.for("AssignmentController"),
    CourseController: Symbol.for("CourseController"),
    ModuleController: Symbol.for("ModuleController"),
    ProgressController: Symbol.for("ProgressController"),
    AuthController: Symbol.for("AuthController"),
    
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
    Logger: Symbol.for("Logger"),

};

export { TYPES };