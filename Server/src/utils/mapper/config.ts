import { createMap, createMapper, Mapper, MappingProfile } from 'automapper-core';
import { classes } from 'automapper-classes';
import { Course, Assignment, BaseTask, FileUploadTask, QuestionTask, CodeTask, QuizTask, BaseAnswer, MultiChoiceAnswer, TrueFalseAnswer, TextAnswer } from '@/models/app';
import { Lesson } from '@/models/app/Lesson.entity';
import { MultiChoiceQuestion, TrueFalseQuestion, TextQuestion, BaseQuestion } from '@/models/app/Question.entity';
import { ICourseDb, IModuleDb, ILessonDb, IAssignmentDb, IBaseTaskDb, IFileUploadTaskDb, IQuestionTaskDb, ICodeTaskDb, IQuizTaskDb, IBaseAnswerDb, IMultiChoiceAnswerDb, ITrueFalseAnswerDb, ITextAnswerDb } from '@/models/db/mongo';
import { IMultiChoiceQuestionDb, ITrueFalseQuestionDb, ITextQuestionDb, IBaseQuestionDb } from '@/models/db/mongo/Question.db';
import Module from 'module';
import { Types } from 'mongoose';

export class MapperUtils {
    static convertToObjectId(id: string): Types.ObjectId {
        return new Types.ObjectId(id);
    }

    static convertToString(objectId: Types.ObjectId): string {
        return objectId.toString();
    }
}

// Initialize the mapper instance
export const mapper = createMapper({
    strategyInitializer: classes(),
});

// Create a mapping profile class to organize your mappings
export class MappingConfiguration {
    private static createBasicMappings() {
        // Course mapping
        createMap(mapper, ICourseDb, Course);
        createMap(mapper, Course, ICourseDb);

        // Module mapping
        createMap(mapper, IModuleDb, Module);
        createMap(mapper, Module, IModuleDb);

        // Lesson mapping
        createMap(mapper, ILessonDb, Lesson);
        createMap(mapper, Lesson, ILessonDb);

        // Assignment mapping
        createMap(mapper, IAssignmentDb, Assignment);
        createMap(mapper, Assignment, IAssignmentDb);
    }

    private static createTaskMappings() {
        // Base Task mappings
        createMap(mapper, IBaseTaskDb, BaseTask);
        createMap(mapper, BaseTask, IBaseTaskDb);

        // File Upload Task mappings
        createMap(mapper, IFileUploadTaskDb, FileUploadTask);
        createMap(mapper, FileUploadTask, IFileUploadTaskDb);

        // Question Task mappings
        createMap(mapper, IQuestionTaskDb, QuestionTask);
        createMap(mapper, QuestionTask, IQuestionTaskDb);

        // Code Task mappings
        createMap(mapper, ICodeTaskDb, CodeTask);
        createMap(mapper, CodeTask, ICodeTaskDb);

        // Quiz Task mappings
        createMap(mapper, IQuizTaskDb, QuizTask);
        createMap(mapper, QuizTask, IQuizTaskDb);
    }

    private static createQuestionMappings() {
        // Base Question mappings
        createMap(mapper, IBaseQuestionDb, BaseQuestion);
        createMap(mapper, BaseQuestion, IBaseQuestionDb);

        // Multiple Choice Question mappings
        createMap(mapper, IMultiChoiceQuestionDb, MultiChoiceQuestion);
        createMap(mapper, MultiChoiceQuestion, IMultiChoiceQuestionDb);

        // True/False Question mappings
        createMap(mapper, ITrueFalseQuestionDb, TrueFalseQuestion);
        createMap(mapper, TrueFalseQuestion, ITrueFalseQuestionDb);

        // Text Question mappings
        createMap(mapper, ITextQuestionDb, TextQuestion);
        createMap(mapper, TextQuestion, ITextQuestionDb);
    }

    private static createAnswerMappings() {
        // Base Answer mappings
        createMap(mapper, IBaseAnswerDb, BaseAnswer);
        createMap(mapper, BaseAnswer, IBaseAnswerDb);

        // Multiple Choice Answer mappings
        createMap(mapper, IMultiChoiceAnswerDb, MultiChoiceAnswer);
        createMap(mapper, MultiChoiceAnswer, IMultiChoiceAnswerDb);

        // True/False Answer mappings
        createMap(mapper, ITrueFalseAnswerDb, TrueFalseAnswer);
        createMap(mapper, TrueFalseAnswer, ITrueFalseAnswerDb);

        // Text Answer mappings
        createMap(mapper, ITextAnswerDb, TextAnswer);
        createMap(mapper, TextAnswer, ITextAnswerDb);
    }

    public static initialize() {
        this.createBasicMappings();
        this.createTaskMappings();
        this.createQuestionMappings();
        this.createAnswerMappings();
    }
}



MappingConfiguration.initialize();