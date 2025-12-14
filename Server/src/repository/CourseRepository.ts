import { inject, injectable } from 'inversify';
import { MongoRepository } from "./MongoRepository";
import CourseModel, { ICourseDb, CourseDocument } from '@/models/db/mongo/Course.db';
import { Course as ICourse } from "@/models/app";
import { ClientSession, Types } from 'mongoose';
import { courseMapper } from '@/utils/mapper/autoMapper';
import { DatabaseError } from '@/models/app/Errors/ServerError';

interface PopulateOptions {
    path: string;
    model?: string;
    populate?: Array<PopulateOptions>;
    select?: string | object;
    match?: object;
}

@injectable()
export class CourseRepository extends MongoRepository<ICourse, ICourseDb, CourseDocument> {
    constructor(
    ) {
        super(CourseModel);
    }

    toDomain(dbModel: ICourseDb): ICourse {
        //console.log('Converting to domain:', JSON.stringify(dbModel, null, 2));
        return courseMapper.toEntity(dbModel);
    }

    toDatabase(domainModel: ICourse): ICourseDb {
        //console.log('Converting to database:', JSON.stringify(domainModel, null, 2));
        return courseMapper.toDb(domainModel);
    }

    async findByCoursename(coursename: string, options?: { populate?: string[] }, context?: ClientSession): Promise<ICourse | null> {
        const { populate = ['roles'] } = options || {};
        const course = await this.model.findOne({ coursename }).populate(populate).session(context!) as ICourseDb;
        const courseEnt = this.toDomain(course);
        return courseEnt;
    }

    async findByInstructor(instructorId: string, options?: { populate?: string[] }, context?: ClientSession): Promise<ICourse[]> {
        try {
            const { populate = [] } = options || {};
            const courseDocuments = await this.model.find({ 'instructors._id': instructorId })
                .populate(populate)
                .session(context!);

            const courses = courseDocuments.map(course => this.toDomain(course.toObject()));
            return courses;

            //   }).populate({
            //     path: 'modules',
            //     select: 'title order'
            //   }).lean();
        } catch (error: any) {
            throw new DatabaseError('Database error:' + error);
        }
    }

    async findByIds(courseIds: string[], options?: { populate?: string[] }, context?: ClientSession): Promise<ICourse[]> {
        const { populate = [] } = options || {};

        const courseDocuments = await this.model.find({
            _id: { $in: courseIds }
        }).populate(populate).session(context!);

        // }).populate({
        //     path: 'modules',
        //     select: 'title order'
        // }).session(context!);

        const courses = courseDocuments.map(course => this.toDomain(course.toObject()));
        return courses;
    }

    async findAll(options?: { populate?: string[] }, context?: ClientSession): Promise<ICourse[] | null> {
        const query = this.model.find();

        this.handleQueryPopulation(query, options);

        if (context) {
            query.session(context);
        }

        const courses = await query.exec();
        return courses ? courses.map(c => this.toDomain(c.toObject())) : null;
    }

    async findByIdWithPopulate(
        id: string,
        fieldsToPopulate?: string[],
        session?: ClientSession
    ): Promise<ICourse | null> {
        try {
            // Start with the basic query
            const baseQuery = this.model.findById(id);

            // Apply population if needed
            let populatedQuery = baseQuery;
            if (fieldsToPopulate?.length) {
                // Type assertion to handle the TypeScript error
                fieldsToPopulate.forEach(field => {
                    populatedQuery = populatedQuery.populate(field) as any;
                });
            }

            // Apply session if needed
            if (session) {
                populatedQuery = populatedQuery.session(session) as any;
            }

            // Execute the query
            const course = await populatedQuery.exec();

            if (!course) {
                return null;
            }

            return this.toDomain(course.toObject());
        } catch (error) {
            console.error('Error in findById:', error);
            throw error;
        }
    }

    async bulkCreate(courses: ICourse[], context: ClientSession): Promise<ICourse[]> {
        const createdCourses = await this.model.insertMany(
            courses.map(course => this.toDatabase(course)),
            { session: context }
        );
        return createdCourses.map(course => this.toDomain(course));
    }

    async addModule(
        courseId: string,
        moduleData: { _id: Types.ObjectId, title: string, order: number },
        session?: ClientSession
    ): Promise<ICourse | null> {
        const query = this.model.findByIdAndUpdate(
            courseId,
            {
                $push: { modules: moduleData }
            },
            { new: true }
        );

        if (session) {
            query.session(session);
        }

        const updated = await query.exec();
        return updated ? this.toDomain(updated.toObject()) : null;
    }

    private handleQueryPopulation(query: any, options?: { populate?: string[] }) {
        const { populate = [] } = options || {};

        if (populate.includes('modules')) {
            // If modules are explicitly requested to populate, populate the full document
            query.populate({
                path: 'modules._id',
                model: 'Module'
            });
        }

        // Handle other populate fields
        populate.forEach(field => {
            if (field !== 'modules') {
                query.populate(field);
            }
        });

        return query;
    }
}