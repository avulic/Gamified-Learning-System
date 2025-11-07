import { Assignment } from "@/models/app/Assignment.entity";
import { Course } from "@/models/app/Course.entity";
import { Lesson } from "@/models/app/Lesson.entity";
import { Module } from "@/models/app/Module.entity";
import { ICourseDb, IModuleDb, IAssignmentDb, IFileDb, IUserDb } from "@/models/db/mongo";
import { CreateCourseDetailsDto, CreateModuleDto } from "@/models/dto/request";
import { plainToInstance } from "class-transformer";


export class CourseMapper {
    static toEntity(dto: CreateCourseDetailsDto): Course {
        return plainToInstance(Course, dto);
    }

    static fromDB(dbModel: ICourseDb, modules?: IModuleDb[], instructors?: IUserDb[], ): Course {
        return plainToInstance(Course, {
            ...dbModel,
            _modules: modules,
            instructors: instructors
        });
    }

    static toDB(entity: Course): Partial<ICourseDb> {
        return plainToInstance(ICourseDb, entity);
    }
}

export class ModuleMapper {
    static toEntity(dto: CreateModuleDto): Module {
        return plainToInstance(Module, dto);
    }

    static fromDB(dbModel: IModuleDb, assignments?: IAssignmentDb[], files?: IFileDb[]): Module {
        return plainToInstance(Module, {
            ...dbModel,
            _assignments: assignments,
            files: files,
        });
    }

    static toDB(entity: Module): Partial<IModuleDb> {
        return plainToInstance(IModuleDb, entity);
    }
}

export class LessonMapper {
    static fromDB(dbModel: any, assignments?: IAssignmentDb[], files?: IFileDb[]): Lesson {
        return plainToInstance(Lesson, {
            ...dbModel,
            _assignments: assignments,
            files: files
        });
    }
}

export class AssignmentMapper {
    static fromDB(dbModel: IAssignmentDb): Assignment {
        return plainToInstance(Assignment, dbModel);
    }
}

export class FileMapper {
    static fromDB(dbModel: IFileDb): File {
        return plainToInstance(File, dbModel);
    }
}