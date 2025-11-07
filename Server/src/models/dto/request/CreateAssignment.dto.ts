import { Type } from "class-transformer";
import { IsString, MinLength, IsDate, IsArray, ValidateNested, IsNumber, IsBoolean, IsEnum, IsMongoId, IsOptional } from "class-validator";
import { TaskTypeEnum, ProgressTypeEnum, QuestionType } from "@/models/enums";
import { CreateBaseTaskDto, CreateFileUploadTaskDto, CreateQuestionTaskDto, CreateTaskDto } from "./CreateTask.dto";
import { AutoMap } from "automapper-classes";
import { ParentType } from "@/models/app/Assignment.entity";

export class RubricCriterionDto {
    @AutoMap()
    @IsString()
    criterion!: string;

    @AutoMap()
    @IsNumber()
    points!: number;
}

export class PeerReviewSettingsDto {
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

export class SubmissionWindowDto {
    @AutoMap()
    @IsDate()
    start!: Date;

    @AutoMap()
    @IsDate()
    end!: Date;

    @AutoMap()
    @IsBoolean()
    allowLateSubmissions!: boolean;

    @AutoMap()
    @IsNumber()
    lateSubmissionPenalty!: number;
}

export class CreateAssignmentDto {
    @AutoMap()
    @IsString()
    @MinLength(3)
    title!: string;

    @AutoMap()
    @IsString()
    description!: string;

    @AutoMap()
    @IsEnum(ParentType)
    parentType!: ParentType;

    @AutoMap()
    @IsMongoId()
    parentId!: string;

    @AutoMap()
    @IsMongoId()
    createdBy!: string;

    @AutoMap()
    @ValidateNested()
    @Type(() => RubricCriterionDto)
    @IsOptional()
    rubric?: {
        criteria: RubricCriterionDto[];
    };

    @AutoMap()
    @ValidateNested()
    @Type(() => PeerReviewSettingsDto)
    @IsOptional()
    peerReviewSettings?: PeerReviewSettingsDto;

    @AutoMap()
    @IsNumber()
    @IsOptional()
    maxAttempts?: number;

    @AutoMap()
    @IsNumber()
    passingScore!: number;

    @AutoMap()
    @IsNumber()
    points!: number;

    @AutoMap()
    @ValidateNested()
    @Type(() => SubmissionWindowDto)
    submissionWindow!: SubmissionWindowDto;

    tasks!: CreateTaskDto[];

}


// rubric: {
//     criteria: [{
//         criterion: String,
//         points: Number,
//         description: String,        // Detailed explanation
//         levels: [{                  // Performance levels
//             level: String,          // e.g., "Excellent", "Good", "Needs Work"
//             score: Number,
//             description: String
//         }],
//         subCriteria: [{            // Nested evaluation points
//             name: String,
//             points: Number
//         }],
//         weight: Number,            // Percentage weight in total grade
//         requiredToPass: Boolean,   // Must-pass criteria
//         feedback: [{               // Common feedback options
//             text: String,
//             category: String       // e.g., "Positive", "Needs Improvement"
//         }],
//         attachments: [{            // Reference materials
//             type: String,
//             url: String
//         }]
//     }],
//     totalPoints: Number,
//     passingScore: Number,
//     allowPartialCredit: Boolean,
//     gradingNotes: String          // Instructions for graders
// }