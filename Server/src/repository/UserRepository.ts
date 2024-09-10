import { inject, injectable } from 'inversify';
import { MongoRepository } from "./MongoRepository";
import User,{ IUserDb } from "@/models/db/mongo/User"; // Assume these are defined elsewhere
import { IUser } from "@/models/app";
import { UserMapper,  } from "@/utils/ModelMapper";
import { Roles } from '@/models/enums';
import { NotFoundError } from '@/models/app/Errors/NotFoundError';
import { ClientSession, Types } from 'mongoose';
import { MongoUnitOfWork } from './MongoUnitOfWork';
import { IRepositoryContext } from './interface/IRepositoryContext';
import { TYPES } from '@/types';
import Logger from '@/utils/logger';


@injectable()
export class UserRepository extends MongoRepository<IUser, IUserDb> {
    constructor(
        @inject(TYPES.Logger) private logger: Logger
    ) {
        super(User);
    }

    toDomain(dbModel: IUserDb): IUser {
        try{
            return UserMapper.dbToDomain(dbModel);
        }catch(e){
            this.logger.error("Error in maping",e);
            throw new NotFoundError("Error in maping")
        }
    }

    toDatabase(domainModel: Partial<IUser>): Partial<IUserDb> {
        try{
            return UserMapper.toDb(domainModel);
        }catch(e){
            this.logger.error("Error in maping",e);
            throw new NotFoundError("Error in maping DB")
        }
    }

    async findByUsername(username: string, options?: { populate?: string[]}, context?: ClientSession): Promise<IUser | null> {
        const { populate = [] } = options || {};
        const user = await this.model.findOne({ username }).populate(populate).session(context!);
        return user ? this.toDomain(user) : null;
    }

    async bulkCreate(users: Partial<IUser>[], context?: ClientSession): Promise<IUser[]> {
        const createdUsers = await this.model.insertMany(
            users.map(user => this.toDatabase(user)),
            { session: context }
        );
        return createdUsers.map(user => this.toDomain(user));
    }

    async findByName(name: string, options?: { limit?: number; skip?: number; sort?: any; context?: ClientSession }): Promise<IUser[]> {
        return this.find({ name: { $regex: name, $options: 'i' } as any }, options);
    }

    async findByEmail(email: string, options?: { populate?: string[] }, context?: ClientSession): Promise<IUser | null> {
        const { populate =  []} = options || {};
        const user = await this.model.findOne({ email }).populate(populate).session(context!);
        if(!user){
            return null;
        }
        return this.toDomain(user);
    }

    async findByRole(roleId: string, options?: { limit?: number; skip?: number; sort?: any;}, context?: ClientSession ): Promise<IUser[]> {
        const { limit = 0, skip = 0, sort = {} } = options || {};
        const users = await this.model.find({ roles: roleId })
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .session(context || null)
            .populate('roles')
            .exec();
        return users.map(user => this.toDomain(user));
    }

    async findByRoleNames(roleNames: Roles[], options?: { limit?: number; skip?: number; sort?: any; populate?: string[]}, context?: ClientSession ): Promise<IUser[]> {
        const { limit = 0, skip = 0, sort = {}, populate =  []} = options || {};
    
        const query = this.model.find({ 'name': { $in: roleNames } });
    
        query.populate(populate);
        query.sort(sort);
        query.skip(skip);
    
        if (limit > 0) {
            query.limit(limit);
        }
    
        if (context) {
            query.session(context);
        }
    
        const users = await query.exec();
        return users.map(user => this.toDomain(user));
    }


    async findByEmailsOrUsernames(users: { email: string; username: string }[], context?: ClientSession): Promise<IUser[]> {
        const emails = users.map(u => u.email);
        const usernames = users.map(u => u.username);
        const existingUsers = await this.model.find({
            $or: [
                { email: { $in: emails } },
                { username: { $in: usernames } }
            ]
        }).session(context || null);
        return existingUsers.map(user => this.toDomain(user));
    }


    async assignRoles(userId: string, roleIds: string[], context?: ClientSession): Promise<IUser> {
        const updatedUser = await this.model.findByIdAndUpdate(
            userId,
            { $addToSet: { roles: { $each: roleIds.map(id => new Types.ObjectId(id)) } } },
            { new: true, session: context || null }
        ).populate('roles');

        if (!updatedUser) {
            throw new NotFoundError(`User with ID ${userId} not found`);
        }

        return this.toDomain(updatedUser);
    }


    async findAll(options?: { populate?: string[]}, context?: ClientSession): Promise<IUser[] | null> {
        const { populate = [] } = options || {};
        const course = await this.model.find().populate(populate).session(context!);
        const courses = course ? course.map(c => this.toDomain(c)) : null;
        return courses;
    }
}