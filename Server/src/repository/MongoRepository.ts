// MongoRepository.ts
import { Model, Document, FilterQuery, UpdateQuery, ClientSession } from "mongoose";
import { IBaseRepository } from "./interface/IBaseRepository";
import { injectable, unmanaged } from "inversify";

@injectable()
export abstract class MongoRepository<TDomain, TDb extends Document> implements IBaseRepository<TDomain, ClientSession> {
    constructor(
        @unmanaged() protected model: Model<TDb>, 
        @unmanaged() protected populateOnFind: string[] = []
    ) { }

    abstract toDomain(dbModel: TDb): TDomain;
    abstract toDatabase(domainModel: Partial<TDomain>): Partial<TDb>;

    async create(item: Partial<TDomain>, options?: { populate?: string[] }, context?: ClientSession): Promise<TDomain> {
        const { populate = [] } = options || {};

        const dbItem = this.toDatabase(item);
        const created = await this.model.create([dbItem], { session: context });

        // Populate the created document if populate options are provided
        let populatedItem = created[0];
        if (populate.length > 0) {
            populatedItem = await populatedItem.populate(populate);
        }

        return this.toDomain(populatedItem);
    }

    async createMany(items: Partial<TDomain>[], context?: ClientSession): Promise<TDomain[]> {
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
        return found ? this.toDomain(found as TDb) : null;
    }

    async findOne(query: FilterQuery<TDb>, session?: ClientSession): Promise<TDomain | null> {
        const queryBuilder = this.model.findOne(query).populate(this.populateOnFind);
        if (session) {
            queryBuilder.session(session);
        }
        const found = await queryBuilder.exec();
        return found ? this.toDomain(found as TDb) : null;
    }

    async find(
        filter: Partial<TDomain>,
        options?: { limit?: number; skip?: number; sort?: any; populate?: string[], session?: ClientSession }
    ): Promise<TDomain[]> {
        const { limit = 0, skip = 0, sort = {}, session, populate = [] } = options || {};
        const dbFilter = this.toDatabase(filter) as FilterQuery<TDb>;
        let query = this.model.find(dbFilter).populate(populate);

        if (sort) query = query.sort(sort);
        if (skip) query = query.skip(skip);
        if (limit) query = query.limit(limit);
        if (session) query = query.session(session);

        const results = await query.exec();
        return results.map(result => this.toDomain(result));
    }

    async update(id: string, item: Partial<TDomain>, session?: ClientSession): Promise<TDomain | null> {
        const dbItem = this.toDatabase(item);
        const query = this.model.findByIdAndUpdate(id, dbItem as UpdateQuery<TDb>, { new: true });
        if (session) {
            query.session(session);
        }
        const updated = await query.exec();
        return updated ? this.toDomain(updated) : null;
    }

    async delete(id: string, session?: ClientSession): Promise<boolean> {
        const query = this.model.deleteOne({ _id: id } as FilterQuery<TDb>);
        if (session) {
            query.session(session);
        }
        const result = await query.exec();
        return result.deletedCount === 1;
    }

    async deleteMany(filter: Partial<TDomain>, context?: unknown): Promise<number> {
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
