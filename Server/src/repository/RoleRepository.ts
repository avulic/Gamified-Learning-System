import { IRole } from "@/models/app";
import { IRoleDb } from "@/models/db/mongo";
import Role from "@/models/db/mongo/Role";
import { Roles } from "@/models/enums";
import { RoleMapper } from "@/utils/ModelMapper";
import { injectable } from "inversify";
import { ClientSession } from "mongoose";
import { MongoRepository } from "./MongoRepository";



@injectable()
export class RoleRepository extends MongoRepository<IRole, IRoleDb> {
    constructor() {
        super(Role);
    }

    toDomain(dbModel: IRoleDb): IRole {
        return RoleMapper.dbToDomain(dbModel);
    }

    toDatabase(domainModel: IRole): Partial<IRoleDb> {
        return RoleMapper.toDb(domainModel);
    }

    async findByName(roleName: Roles, session?: ClientSession): Promise<IRole | null> {
        //const roleDb = await this.model.findOne({ name: roleName }).session(session || null);
        const roleDb = {name: roleName} as  IRoleDb;
        return roleDb ? this.toDomain(roleDb) : null;
    
    }

    async findAllByNames(roleNames: Roles[], session?: ClientSession): Promise<IRole[]> {
        // let query: FilterQuery<IRoleDb> = {};
        // if (roleNames && roleNames.length > 0) {
        //     query = { name: { $in: roleNames } };
        // }

        const rolesDb = await this.model.find({ name: { $in: roleNames } }).session(session || null);
        return rolesDb.map(roleDb => this.toDomain(roleDb));
    }
}