import { QuestionType } from "@/models/enums";
import { AutoMap } from "automapper-classes";
import mongoose, { Schema } from "mongoose";

// Base Question Interfaces
export class IBaseQuestionDb {
    _id?: mongoose.Types.ObjectId;
    @AutoMap()
    question!: string;

    @AutoMap(() => String)
    questionType!: QuestionType;
}

export class IMultiChoiceOptionDb {
    @AutoMap()
    text!: string;

    @AutoMap()
    isCorrect!: boolean;

    _id!: mongoose.Types.ObjectId;
}

export class IMultiChoiceQuestionDb extends IBaseQuestionDb {
    questionType!:  QuestionType.MULTI_CHOICE;
    @AutoMap(() => [IMultiChoiceOptionDb])
    options!: IMultiChoiceOptionDb[];
}

export class ITrueFalseQuestionDb extends IBaseQuestionDb {
    questionType!:  QuestionType.TRUE_FALSE;
    @AutoMap()
    correctAnswer!: boolean;
}

export class ITextQuestionDb extends IBaseQuestionDb {
    questionType!:  QuestionType.TEXT;
    @AutoMap()
    correctAnswer!: string;
}


// Export the union type
export type IQuestionDb = IMultiChoiceQuestionDb | ITrueFalseQuestionDb | ITextQuestionDb;

// Base schema
export const baseQuestionSchema = new Schema({
    question: { type: String, required: true },
    questionType: {
        type: String,
        enum: Object.values(QuestionType),
        required: true
    }
}, {
    discriminatorKey: 'questionType',
    _id: true // Keep _id for referencing individual questions
});

// Schema for multi-choice questions
export const multiChoiceSchema = new Schema({
    options: {
        type: [{
            text: { type: String, required: true },
            isCorrect: { type: Boolean, required: true },
            _id: { type: mongoose.Schema.Types.ObjectId },
        }],
        required: true,
        validate: {
            validator: function(options: any[]) {
                return options.some(option => option.isCorrect);
            },
            message: 'At least one option must be marked as correct'
        }
    }
});

// Schema for true/false questions
export const trueFalseSchema = new Schema({
    correctAnswer: { type: Boolean, required: true }
});

// Schema for text questions
export const textSchema = new Schema({
    correctAnswer: { type: String, required: true }
});

