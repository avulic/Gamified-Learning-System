import { inject, injectable } from 'inversify';
import { TYPES } from '@/types';
import TaskProgressRepository from '@/repository/Progress/TaskProgressRepository';
import UserProgressRepository from '@/repository/Progress/UserProgressRepository';
import { ICourseProgress, ITaskProgress, IUserProgress } from '@/models/app/Progress/Progress';


@injectable()
export class ProgressService {
    constructor(
        @inject(TYPES.UserProgressRepository) private userProgressRepository: UserProgressRepository,
        @inject(TYPES.TaskProgressRepository) private taskProgressRepository: TaskProgressRepository
    ) {}

	async getUserProgress(userId: string, courseId: string): Promise<IUserProgress> {
        const userProgress = await this.userProgressRepository.findByUserIdAndCourseId(userId, courseId);
        if (!userProgress) {
            throw new Error('User progress not found');
        }
        return userProgress;
    }

    async updateUserProgress(userId: string, courseId: string, progress: Partial<IUserProgress>): Promise<IUserProgress> {
        const updatedProgress = await this.userProgressRepository.updateUserProgress(userId, courseId, progress);
        if (!updatedProgress) {
            throw new Error('Failed to update user progress');
        }
        return updatedProgress;
    }

    async getTaskProgress(userId: string, assignmentId: string, taskId: string): Promise<ITaskProgress> {
        const taskProgress = await this.taskProgressRepository.findByUserAssignmentAndTask(userId, assignmentId, taskId);
        if (!taskProgress) {
            throw new Error('Task progress not found');
        }
        return taskProgress;
    }

    async updateTaskProgress(taskProgress: Partial<ITaskProgress>): Promise<ITaskProgress> {
        const updatedTaskProgress = await this.taskProgressRepository.updateTaskProgress(taskProgress);
        return updatedTaskProgress;
    }


	async getCourseProgress(userId: string, courseId: string) {
		const userProgress = await this.userProgressRepository.findByUserIdAndCourseId(userId, courseId);
		
		if (!userProgress) {
			throw new Error('User progress for the course not found.');
		}
		
		return userProgress.courseProgress;
	}

	async getModuleProgress(userId: string, courseId: string, moduleId: string) {
		const userProgress = await this.userProgressRepository.findByUserIdAndCourseId(userId, courseId);
		
		if (!userProgress) {
			throw new Error('User progress for the course not found.');
		}
	
		const moduleProgress = userProgress.courseProgress.find(c => c.moduleProgress.find(mod => mod.moduleId.toString() === moduleId.toString()));
	
		if (!moduleProgress) {
			throw new Error('Module progress not found.');
		}
	
		return moduleProgress;
	}


	// async getModuleWithTaskProgress(userId: string, courseId: string, moduleId: string) {
	// 	const moduleProgress = await this.getModuleProgress(userId, courseId, moduleId);
	
	// 	const tasks = await this.taskProgressRepository.find({ userId, assignmentId: { 
	// 		$in: moduleProgress.lessonProgress.flatMap(lesson => lesson.assignmentProgress.map(ap => ap.assignmentId)) 
	// 	} });
	
	// 	// Map task progress to respective assignments
	// 	moduleProgress.lessonProgress.forEach(lesson => {
	// 		lesson.assignmentProgress.forEach(assignment => {
	// 			assignment.taskProgress = tasks.filter(task => assignment.taskProgressIds.includes(task._id));
	// 		});
	// 	});
	
	// 	return {
	// 		moduleProgress
	// 	};
	// }

}

export default ProgressService;
