// Request DTOs
export { CreateUserDto } from './request/CreateUserDto';
export { CreateCourseDto } from './request/CreateCourseDto';
export { CreateModuleDto } from './request/CreateModuleDto';
export  * from './request/CreateAssignmentDto';
export * from './request/CreateTaskDto';
export * from './request/UpdateTaskDto';
export * from './request/UpdateAssignmentDto';
export { UpdateAssignmentProgressDto } from './request/UpdateAssignmentProgressDto';
export { UpdateCourseDto } from './request/UpdateCourseDto';
export { UpdateCourseProgressDto } from './request/UpdateCourseProgressDto';
export { UpdateModuleDto } from './request/UpdateModuleDto';
export { UpdateModuleProgressDto } from './request/UpdateModuleProgressDto';
export { UpdateTaskProgressDto } from './request/UpdateTaskProgressDto';
export { UpdateUserDto } from './request/UpdateUserDto';
export { UpdateTaskDto } from './request/UpdateTaskDto';
export { ChangePasswordDto } from './request/ChangePasswordDto';
export { IFileRequestDto } from './request/IFileRequestDto';
export * from './request/CreateSubmissionDto';

// Response DTOs
export { AssignmentProgressResponseDto } from './response/AssignmentProgressResponseDto';
export { AssignmentResponseDto } from './response/AssignmentResponseDto';
export { CourseProgressResponseDto } from './response/CourseProgressResponseDto';
export { CourseResponseDto } from './response/CourseResponseDto';
export { ErrorResponseDto } from './response/ErrorResponseDto';
export { ModuleProgressResponseDto } from './response/ModuleProgressResponseDto';
export { ModuleResponseDto,ModuleDetailsResponseDto } from './response/ModuleResponseDto';
export { ProgressResponseDto } from './response/ProgressResponseDto';
export * from './response/TaskResponseDto';
export { UserProgressResponseDto } from './response/UserProgressResponseDto';
export { UserResponseDto } from './response/UserResponseDto';
export { IFileResponseDto } from './response/IFileResponseDto';
export * from './response/SubmissionResponseDto';

