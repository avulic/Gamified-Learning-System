import { injectable } from 'inversify';
import { MongoRepository } from "./MongoRepository";
import Course, {ICourseDb} from '@/models/db/mongo/Course'; // Assume these are defined elsewhere
import { ICourse } from "@/models/app";
import { CourseMapper,  } from "@/utils/ModelMapper";
import { Roles } from '@/models/enums';
import { NotFoundError } from '@/models/app/Errors/NotFoundError';
import { ClientSession, Types } from 'mongoose';
import { MongoUnitOfWork } from './MongoUnitOfWork';
import { IRepositoryContext } from './interface/IRepositoryContext';

@injectable()
export class CourseRepository extends MongoRepository<ICourse, ICourseDb> {
    constructor() {
        super(Course, ['roles']);
    }

    toDomain(dbModel: ICourseDb): ICourse {
        return CourseMapper.dbToDomain(dbModel);
    }

    toDatabase(domainModel: ICourse): Partial<ICourseDb> {
        return CourseMapper.toDb(domainModel);
    }

    async findByCoursename(coursename: string, options?: { populate?: string[]}, context?: ClientSession): Promise<ICourse | null> {
        const { populate = ['roles'] } = options || {};
        const course = await this.model.findOne({ coursename }).populate(populate).session(context!);
        return course ? this.toDomain(course) : null;
    }

    async findAll(options?: { populate?: string[]}, context?: ClientSession): Promise<ICourse[] | null> {
        const { populate = [] } = options || {};
        const course = await this.model.find().populate(populate).session(context!);
        const courses = course ? course.map(c => this.toDomain(c)) : null;
        return courses;
    }

    async bulkCreate(courses: ICourse[], context: ClientSession): Promise<ICourse[]> {
        const createdCourses = await this.model.insertMany(
            courses.map(course => this.toDatabase(course)),
            { session: context }
        );
        return createdCourses.map(course => this.toDomain(course));
    }


}