import { Role as IRole } from "@/models/app";
import { IRoleDb, RoleDocument } from "@/models/db/mongo/Role.db";
import Role from "@/models/db/mongo/Role.db";
import { Roles } from "@/models/enums";

import { injectable } from "inversify";
import { ClientSession } from "mongoose";
import { MongoRepository } from "./MongoRepository";
import { roleMapper } from "@/utils/mapper/autoMapper";


@injectable()
export class RoleRepository extends MongoRepository<IRole, IRoleDb, RoleDocument> {
    constructor() {
        super(Role);
    }

    toDomain(dbModel: IRoleDb): IRole {
        return roleMapper.toEntity(dbModel);
    }

    toDatabase(domainModel: IRole): IRoleDb {
        return roleMapper.toDb(domainModel);
    }

    async findByName(roleName: Roles, session?: ClientSession): Promise<IRole | null> {
        const roleDb = await this.model.findOne({ name: roleName }).session(session || null);
        
        return roleDb ? this.toDomain(roleDb.toObject()) : null;
    
    }

    async findAllByNames(roleNames: Roles[], session?: ClientSession): Promise<IRole[]> {
        // let query: FilterQuery<IRoleDb> = {};
        // if (roleNames && roleNames.length > 0) {
        //     query = { name: { $in: roleNames } };
        // }

        const rolesDb = await this.model.find({ name: { $in: roleNames } }).session(session || null);
        return rolesDb.map(roleDb => this.toDomain(roleDb.toObject()));
    }
}