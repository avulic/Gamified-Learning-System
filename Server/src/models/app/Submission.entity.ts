import { AutoMap } from 'automapper-classes';
import {
    IsString,
    IsDate,
    IsNumber,
    IsEnum,
    IsBoolean,
    IsArray,
    ValidateNested,
    IsOptional,
    IsMongoId
} from 'class-validator';
import { SubmissionStatus, TaskTypeEnum, ProgressTypeEnum, GradingStatus, SubmissionTypeEnum } from '@/models/enums';
import { BaseEntity } from './Base.entity';
import { Answer, BaseAnswer } from './Answer.entity';
import { CodeTestCase } from './Task.entity';
import { IGrade } from './Grade.entity';



// File upload task submission
export class FileUploadSubmissionFile {
    @AutoMap()
    @IsString()
    fileId!: string;

    @AutoMap()
    @IsString()
    fileName!: string;

    @AutoMap()
    @IsNumber()
    fileSize!: number;

    @AutoMap()
    @IsString()
    mimeType!: string;
}

// Peer review entity
export class PeerReview {
    @AutoMap()
    @IsMongoId()
    reviewerId!: string;

    @AutoMap()
    @IsNumber()
    score!: number;

    @AutoMap()
    @IsString()
    comments!: string;
}


export class BaseTaskSubmission {
    id?: string;
    userId!: string;
    assignmentId!: string;
    taskId!: string;
    taskType!: SubmissionTypeEnum;
    timeSpent?: number;
    currentState!: {
        status: SubmissionStatus;
        attemptNumber: number;
        submittedAt: Date;
        content: any;
    };
    grade?: IGrade

    version!: number;
    history!: Array<{
        submittedAt: Date;
        content: any;
        attemptNumber: number;
    }>;

    static toDb(obj: any): any {


        // Convert _id to id
        if (obj.id) {
            obj._id = obj.id.toString();
            delete obj.id;
        }

        // Convert nested objects (answer or answers)
        if (obj.answer) {
            obj.answer._id = obj.answer.id === "" ? undefined : obj.answer.id.toString();
            delete obj.answer.id;
        }

        if (obj.answers && Array.isArray(obj.answers)) {
            obj.answers = obj.answers.map((ans: any) => {
                if (ans.id || ans.id === "") {
                    const answer = { ...ans };
                    answer._id = answer.id === "" ? undefined : answer.id.toString();
                    delete answer.id;
                    return answer;
                }
                return ans;
            });
        }

        if (obj.grade) {
            obj.grade._id = obj.grade.id === "" ? undefined : obj.grade.id.toString();
            delete obj.grade.id;
        }

        return obj;
    }
}





export class QuizSubmission extends BaseTaskSubmission {
    @AutoMap(() => [BaseAnswer])
    answers!: Answer[];
}


export class QuestionSubmission extends BaseTaskSubmission {
    @AutoMap(() => BaseAnswer)
    answer!: Answer;
}


export class FileUploadSubmission extends BaseTaskSubmission {
    @AutoMap(() => [String])
    fileUrls!: string[];
}


export class CodeSubmission extends BaseTaskSubmission {
    @AutoMap()
    code!: string;
}




export type TaskSubmission =
    | QuizSubmission
    | QuestionSubmission
    | FileUploadSubmission
    | CodeSubmission;