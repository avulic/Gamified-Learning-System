export enum QuestionType {
    TRUE_FALSE = 'TRUE_FALSE',
    TEXT = 'TEXT',
    MULTI_CHOICE = 'MULTI_CHOICE'
}

export enum ItemType {
    Video = 'video',
    Text = 'text',
    Quiz = 'quiz',
}

export enum Roles {
    USER = 'USER',
    STUDENT = 'STUDENT',
    GUEST = 'GUEST',
    ADMIN = 'ADMIN',
    PROFESSOR = 'PROFESSOR'
}

export enum TaskTypeEnum {
    QUIZ = 'QUIZ',
    QUESTION = 'QUESTION',
    FILE_UPLOAD = 'FILE_UPLOAD',
    CODE = 'CODE'
}


export enum SubmissionTypeEnum {
    QUIZ_SUBMISSION = 'QUIZ_SUBMISSION',
    QUESTION_SUBMISSION = 'QUESTION_SUBMISSION',
    FILE_UPLOAD_SUBMISSION = 'FILE_UPLOAD_SUBMISSION',
    CODE_SUBMISSION = 'CODE_SUBMISSION'
}


export enum ProgressTypeEnum {
    NOT_STARTED = "NOT_STARTED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    OVERDUE = "OVERDUE",
    FAILED = "FAILED"
}

export enum SubmissionStatus {
    PENDING = 'pending',
    SUBMITTED = 'submitted',
    NOT_SUBMITTED = 'NOT_SUBMITTED',
    COMPLETED = 'completed',
    GRADED = 'graded',
    LATE = 'late'
}

export enum EnrollmentStatus {
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    DROPPED = 'dropped'
}

export enum TaskStatus {
    NOT_STARTED = 'NOT_STARTED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
}

export enum ProgressType {
    NOT_STARTED = 'NOT_STARTED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
}

export enum GradingStatus {
    GRADED = "GRADED",
    NOT_GRADED = "NOT_GRADED"
}

export enum ParentType {
    ASSIGNMENT = 'ASSIGNMENT',
    COURSE = 'COURSE',
    MODULE = 'MODULE',
    LESSON = 'LESSON'
}

export enum HttpStatusCode {
    OK = 200,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER = 500,
    CONFLICT = 429
}

export enum SubmissionPolicy {
    BEST_SCORE = 'BEST_SCORE',
    FIRST_PASS = 'FIRST_PASS',
    LATEST = 'LATEST',
    BEST_PASS_THEN_LOCK = 'BEST_PASS_THEN_LOCK'
}
