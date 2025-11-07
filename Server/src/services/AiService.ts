import { inject, injectable } from 'inversify';
import { ILogger, TYPES } from '@/types';
import Logger from '../utils/logger';
import { ClientError } from '../models/app/Errors/ClientError';

import { FileRepository } from '@/repository/FileRepository';
import { CourseRepository } from '@/repository/CourseRepository';
import { Course } from '@/models/app';
import FileService from './FileService';

interface GrokAIConfig {
    apiKey: string;
    apiEndpoint: string;
    maxRetries: number;
    timeoutMs: number;
}

interface GrokResponse {
    content: string;
    metadata: {
        confidence: number;
        sourceLinks?: string[];
        timestamp: string;
    };
}

@injectable()
export class GrokService {
    private config: GrokAIConfig;

    constructor(
        @inject(TYPES.FileService) private fileService: FileService,
        @inject(TYPES.FileRepository) private fileRepository: FileRepository,
        @inject(TYPES.CourseRepository) private courseRepository: CourseRepository,
        @inject(TYPES.Logger) private logger: ILogger
    ) {
        this.config = {
            apiKey: process.env.GROK_API_KEY || '',
            apiEndpoint: process.env.GROK_API_ENDPOINT || 'https://api.grok.x.ai/v1',
            maxRetries: 3,
            timeoutMs: 30000
        };
    }

    private async makeGrokRequest(prompt: string, options: any = {}): Promise<GrokResponse> {
        let attempts = 0;
        while (attempts < this.config.maxRetries) {
            try {
                const response = await fetch(this.config.apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`,
                        'Content-Type': 'application/json',
                        'X-Platform': 'X'
                    },
                    body: JSON.stringify({
                        prompt,
                        options: {
                            temperature: options.temperature || 0.7,
                            max_tokens: options.maxTokens || 1000,
                            include_sources: options.includeSources || true,
                            ...options
                        }
                    }),
                    signal: AbortSignal.timeout(this.config.timeoutMs)
                });

                if (!response.ok) {
                    throw new ClientError(`Grok API request failed: ${response.statusText}`);
                }

                return await response.json();
            } catch (error: any) {
                attempts++;
                if (attempts === this.config.maxRetries) {
                    throw new ClientError(`Failed to make Grok API request after ${this.config.maxRetries} attempts: ${error.message}`);
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
            }
        }
        throw new ClientError('Grok API request failed');
    }

    async generateCourseOutline(topic: string, options: {
        difficulty?: 'beginner' | 'intermediate' | 'advanced';
        duration?: string;
        learningObjectives?: string[];
    } = {}): Promise<Course> {
        try {
            const prompt = `Create a detailed course outline for ${topic}.
                Difficulty level: ${options.difficulty || 'intermediate'}
                Duration: ${options.duration || '4 weeks'}
                Learning objectives: ${options.learningObjectives?.join(', ') || 'comprehensive understanding of the subject'}
                Include modules, lessons, and key concepts to cover.`;

            const response = await this.makeGrokRequest(prompt, {
                temperature: 0.7,
                maxTokens: 2000
            });

            // Parse the response and create a course structure
            const courseStructure = JSON.parse(response.content);

            const course: Course = {
                title: courseStructure.title,
                description: courseStructure.description,
                modules: courseStructure.modules.map((module: any, index: number) => ({
                    title: module.title,
                    description: module.description,
                    order: index,
                    lessons: module.lessons.map((lesson: any, lessonIndex: number) => ({
                        title: lesson.title,
                        content: lesson.content,
                        order: lessonIndex
                    }))
                })),
                instructors: [],
                prerequisites: [],
                categories: [],
                enrollmentCode: '',
                isPublished: false,
                version: 0,
                lastUpdated: new Date(),
                enrolledStudentCount: 0,
                xpReward: 0,
                materials: [],
                assignments: []
            };

            const savedCourse = await this.courseRepository.create(course);
            this.logger.info(`Successfully generated course outline for ${topic}`);

            return savedCourse;
        } catch (error: any) {
            this.logger.error(`Failed to generate course outline: ${error.message}`);
            throw error;
        }
    }

    async summarizePDFWithGrok(fileId: string): Promise<string> {
        try {
            const fileContent = await this.fileService.getFileContentAsString(fileId);
            if (!fileContent) {
                throw new ClientError('File not found');
            }
            const prompt = `Please provide a comprehensive summary of this PDF content: ${fileContent}
                Include main points, key takeaways, and potential applications.`;

            const response = await this.makeGrokRequest(prompt, {
                temperature: 0.3,
                maxTokens: 1500
            });

            return response.content;
        } catch (error: any) {
            this.logger.error(`Failed to summarize PDF ${fileId}: ${error.message}`);
            throw error;
        }
    }

    async generateQuizQuestions(lessonContent: string, numberOfQuestions: number = 5): Promise<any> {
        try {
            const prompt = `Generate ${numberOfQuestions} quiz questions based on this lesson content: ${lessonContent}
                Include a mix of multiple choice and true/false questions. 
                Format the response as a JSON object with questions, options, and correct answers.`;

            const response = await this.makeGrokRequest(prompt, {
                temperature: 0.7,
                maxTokens: 1000
            });

            return JSON.parse(response.content);
        } catch (error: any) {
            this.logger.error(`Failed to generate quiz questions: ${error.message}`);
            throw error;
        }
    }

    async improveCourseContent(courseId: string): Promise<Course> {
        try {
            const course = await this.courseRepository.findById(courseId);
            if (!course) {
                throw new ClientError('Course not found');
            }

            const prompt = `Enhance this course content with additional examples, exercises, and explanations:
                ${JSON.stringify(course)}
                Make it more engaging and interactive while maintaining the educational value.`;

            const response = await this.makeGrokRequest(prompt, {
                temperature: 0.6,
                maxTokens: 2000
            });

            const enhancedCourse = JSON.parse(response.content);
            const updatedCourse = await this.courseRepository.update(courseId, enhancedCourse);
            if (!updatedCourse) {
                throw new ClientError('Failed to update course');
            }
            this.logger.info(`Successfully enhanced course ${courseId}`);
            return updatedCourse;
        } catch (error: any) {
            this.logger.error(`Failed to improve course content: ${error.message}`);
            throw error;
        }
    }

    async generateLessonPlan(topic: string, duration: string): Promise<any> {
        try {
            const prompt = `Create a detailed lesson plan for teaching ${topic} in ${duration}.
                Include learning objectives, activities, materials needed, and assessment methods.`;

            const response = await this.makeGrokRequest(prompt, {
                temperature: 0.7,
                maxTokens: 1500
            });

            return JSON.parse(response.content);
        } catch (error: any) {
            this.logger.error(`Failed to generate lesson plan: ${error.message}`);
            throw error;
        }
    }
}

export default GrokService;