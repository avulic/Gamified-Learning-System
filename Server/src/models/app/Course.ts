import { IModule } from "./Module";
import { IUser } from "./User";


// Course.ts
export interface ICourse {
    id?: string;
    title: string;
    description: string;
    instructorsId: string[];
    modulesId: string[];
    // startDate: Date;
    // endDate: Date;
    isPublished: boolean;
    categories: string[];
    xpReward: number;
    materials: string[];

    modules?: Array<Partial<IModule> & Pick<IModule, 'id' | 'title' | 'order'>> | null;
    instructors?: Array<Partial<IUser> & Pick<IUser, 'id' | 'name'>> | null;
}


// export interface ICourseDetailed extends ICourse {
//     instructors: Array<{
//         id: string;
//         name: string;
//         lastName: string;
//     }>;
//     // Add other detailed fields as needed
// }