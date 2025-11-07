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

export enum RoleEnum {
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