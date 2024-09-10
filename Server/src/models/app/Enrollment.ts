import { EnrollmentStatus } from "../enums";
import { IBaseEntity } from "./BaseEntity";
import { ICourse } from "./Course";
import { IUser } from "./User";


// Enrollment
export interface IEnrollment extends IBaseEntity {
    userId: IUser[];
    courseId: ICourse[];
    enrollmentDate: Date;
    completionStatus: EnrollmentStatus;
}