// src/models/Module.ts

import Assignment from "./Assignment";
import { BaseContent } from "./BaseContent";
import { Lesson } from "./Lesson";
import Quiz from "./quiz/Quiz";
import { Resource } from "./Resource";
import UnlockCondition  from "./UnlockConditions";

// Union type for all content types
type ModuleContent = Lesson | Quiz | Assignment | Resource;

export interface Module {
    id:string,
    title: string;
    description: string;
    order: number;
    
    courseId: string;
    status: 'draft' | 'published' | 'archived';
    contentItems: ModuleContent[];
    prerequisites: string[]; // IDs of modules that must be completed first
    unlockConditions?: UnlockCondition[];
    xpReward?: number;

    badgeReward?: string; // ID of badge awarded for completing the module
    learningObjectives?: string[];
    estimatedDuration?: number; // in minutes
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    tags?: string[];
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export default Module;