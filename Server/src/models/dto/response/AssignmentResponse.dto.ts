import { AutoMap } from "automapper-classes";
import { IsBoolean, IsNumber, IsDate, IsString, IsArray, ValidateNested } from "class-validator";
import { CreateBaseTaskDto, CreateTaskDto } from "../request";
import { TaskResponseDto } from "./TaskResponse.dto";


class PeerReviewSettings {
    @AutoMap()
    @IsBoolean()
    enabled!: boolean;
    @AutoMap()
    @IsNumber()
    reviewsPerStudent!: number;
    @AutoMap()
    @IsDate()
    dueDate!: Date;
}

class RubricElements {
    @AutoMap()
    @IsString()
    criterion!: string;
    @AutoMap()
    @IsNumber()
    points!: number;
}

class Rubric {
    @AutoMap(()=>[RubricElements])
    @IsArray()
    @ValidateNested({ each: true })
    criteria!: RubricElements[];
}

export class ResponseAssignmentDto {
    @AutoMap()
    @IsString()
    id!: string;

    @AutoMap()
    @IsString()
    title!: string;

    @AutoMap()
    @IsString()
    description!: string;

    @AutoMap()
    @IsDate()
    dueDate!: Date;
    
    @AutoMap()
    @IsString()
    assignmentType!: string;
    
    @AutoMap(()=>[CreateBaseTaskDto])
    @IsArray()
    @ValidateNested({ each: true })
    tasks!: CreateTaskDto[];

    @AutoMap(()=>Rubric)
    @ValidateNested({ each: true })
    rubric?: Rubric;

    @AutoMap(()=>PeerReviewSettings)
    @ValidateNested({ each: true })
    peerReviewSettings?: PeerReviewSettings;
}