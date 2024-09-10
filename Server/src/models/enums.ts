export enum QuestionType {
    TRUE_FALSE = 'true_false',
    TEXT = 'text',
}

export enum ItemType {
    Video = 'video',
    Text = 'text',
    Quiz = 'quiz',
}

export enum Roles {
    User = 'user',
    Student = 'student',
    Guest = 'guest',
    Admin = 'admin',
    Professor = 'professor'
}

export enum TaskTypeEnum {
    MULTI_CHOICE = "multi_choice",
    QUESTION = 'question',
    FILE_UPLOAD = 'file_upload',
}

export enum ProgressTypeEnum {
    NOT_STARTED = "not_started",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    OVERDUE = "overdue",
    FAILED = "failed"
}

export enum SubmissionStatus {
    PENDING = 'pending',
    SUBMITTED = 'submitted',
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
    USER = 'USER',
    COURSE = 'COURSE',
    TASK = 'TASK'
}