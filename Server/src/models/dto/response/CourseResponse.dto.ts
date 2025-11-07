import { Expose, Type } from "class-transformer";
import { InstructorDto } from "../request/CreateCourse.dto";
import { CreateModuleDto } from "../request/CreateModule.dto";
import AssignmentRepository from "@/repository/AssignmentRepository";
import { ResponseAssignmentDto } from "@/models/dto/response/AssignmentResponse.dto";
import { AutoMap } from "automapper-classes";

export class ResponseCourseDto {
    @AutoMap()
    id!: string;

    @AutoMap()
    title!: string;

    @AutoMap()
    description!: string;


    @AutoMap()
    instructors!: Array<{
        id: string;
        name: string;
    }>;

    @AutoMap(() => [CreateModuleDto])
    modules!: CreateModuleDto[];

    @AutoMap()
    isPublished!: boolean;

    @AutoMap()
    categories!: string[];

    @AutoMap()
    xpReward!: number;

    @AutoMap()
    materials?: Array<{
        name: string;
        url: string;
    }>;

    @AutoMap()
    version?: number;

    @AutoMap()
    lastUpdated?: Date;

    @AutoMap()
    enrolledStudentCount?: number;

    @AutoMap()
    prerequisites?: string[];

    @AutoMap(() => [ResponseAssignmentDto])
    assignments!: ResponseAssignmentDto[];
}