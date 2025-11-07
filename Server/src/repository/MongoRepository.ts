// MongoRepository.ts
import { Model, Document, FilterQuery, UpdateQuery, ClientSession } from "mongoose";
import { IBaseRepository } from "./interface/IBaseRepository";
import { injectable, unmanaged } from "inversify";

@injectable()
export abstract class MongoRepository<TDomain, TDb, TDbDocument extends Document> implements IBaseRepository<TDomain, ClientSession> {
    constructor(
        @unmanaged() protected model: Model<TDbDocument>, 
        @unmanaged() protected populateOnFind: string[] = []
    ) { }

    abstract toDomain(dbModel: TDb): TDomain;
    abstract toDatabase(domainModel: TDomain): TDb;

    async create(item: TDomain, options?: { populate?: string[] }, session?: ClientSession): Promise<TDomain> {
        try {
            const { populate = [] } = options || {};
        
            const dbItem = this.toDatabase(item);    
            let created;
            if (session) {
                // save() with session instead of create()
                const doc = new this.model(dbItem);
                created = await doc.save({ session });
            } else {
                created = (await this.model.create([dbItem]))[0];
            }
        
            //console.log('Post-save created:', JSON.stringify(created, null, 2));
        
            let populatedItem = created;
            if (populate.length > 0) {
                const query = this.model.findById(created._id).populate(populate);
                if (session) {
                    query.session(session);
                }
                populatedItem = await query.exec();
            }
        
            return this.toDomain(populatedItem.toObject());
        } catch (error) {
            throw error;
        }
    }

    async createMany(items: TDomain[], context?: ClientSession): Promise<TDomain[]> {
        const dbItems = items.map(item => this.toDatabase(item));
        const created = await this.model.insertMany(dbItems, { session: context });
        return created.map(item => this.toDomain(item.toObject()));
    }

    async findById(id: string, options?: { populate?: string[] }, session?: ClientSession): Promise<TDomain | null> {
        const { populate = [] } = options || {};
        const query = this.model.findById(id).populate(populate);
        if (session) {
            query.session(session);
        }
        const found = await query.exec();
        return found ? this.toDomain(found.toObject()) : null;
    }

    async findOne(query: FilterQuery<TDb>, session?: ClientSession): Promise<TDomain | null> {
        const queryBuilder = this.model.findOne(query).populate(this.populateOnFind);
        if (session) {
            queryBuilder.session(session);
        }
        const found = await queryBuilder.exec();
        return found ? this.toDomain(found.toObject()) : null;
    }

    async find(
        filter: TDomain,
        options?: { limit?: number; skip?: number; sort?: any; populate?: string[], session?: ClientSession }
    ): Promise<TDomain[]> {
        const { limit = 0, skip = 0, sort = {}, session, populate = [] } = options || {};
        const dbFilter = this.toDatabase(filter) as FilterQuery<TDb> | any;
        let query = this.model.find(dbFilter).populate(populate);

        if (sort) query = query.sort(sort);
        if (skip) query = query.skip(skip);
        if (limit) query = query.limit(limit);
        if (session) query = query.session(session);

        const results = await query.exec();
        return results.map(result => this.toDomain(result.toObject()));
    }

    async update(id: string, item: TDomain, session?: ClientSession): Promise<TDomain | null> {
        try {
            const dbItem = this.toDatabase(item) as UpdateQuery<TDb> | any;
            const query = this.model.findByIdAndUpdate(id, dbItem, { new: true });
            if (session) {
                query.session(session);
            }
            const updated = await query.exec();
            return updated ? this.toDomain(updated.toObject()) : null;
        } catch (error) {
            throw error;
        }
    }

    async findByIdAndUpdate(id: string,update: Partial<TDomain> | any, options: {  session?: ClientSession,populate?: string[],new?: boolean } = {}): Promise<TDomain | null> {
        const { populate = [], session, new: returnNew = true } = options;
    
        // Don't convert to DB model if it's a $set operation
        const updateObj = update.$set 
            ? update 
            : { $set: this.toDatabase(update as TDomain) };
    
        const query = this.model.findByIdAndUpdate(
            id, 
            updateObj, 
            { 
                new: returnNew,
                session 
            }
        );
    
        if (populate.length > 0) {
            query.populate(populate);
        }
    
        const result = await query.exec();
        return result ? this.toDomain(result.toObject()) : null;
    }

    async delete(id: string, session?: ClientSession): Promise<boolean> {
        const query = this.model.deleteOne({ _id: id } as FilterQuery<TDb>);
        if (session) {
            query.session(session);
        }
        const result = await query.exec();
        return result.deletedCount === 1;
    }

    async deleteMany(filter: TDomain, context?: unknown): Promise<number> {
        throw new Error("Method not implemented.");
    }

    async count(query: FilterQuery<TDb> = {}, session?: ClientSession): Promise<number> {
        const countQuery = this.model.countDocuments(query);
        if (session) {
            countQuery.session(session);
        }
        return countQuery.exec();
    }

    async exists(query: FilterQuery<TDb>, session?: ClientSession): Promise<boolean> {
        const existsQuery = this.model.exists(query);
        if (session) {
            existsQuery.session(session);
        }
        return (await existsQuery) !== null;
    }
}
