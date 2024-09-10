import { injectable, inject } from 'inversify';
import { TYPES } from '@/types';
import TaskProgressRepository from '@/repository/Progress/TaskProgressRepository';
import UserProgressRepository from '@/repository/Progress/UserProgressRepository';


@injectable()
export class ProgressCalculator {
    constructor(
        @inject(TYPES.UserProgressRepository) private userProgressRepo: UserProgressRepository,
        @inject(TYPES.TaskProgressRepository) private taskProgressRepo: TaskProgressRepository
    ) { }

    // async calculateOverallProgress(userId: string): Promise<number> {
    //     const userProgress = await this.userProgressRepo.findByUserId(userId);
    //     if (!userProgress) {
    //         return 0;
    //     }

    //     const totalXP = userProgress.totalXpEarned;
    //     const level = this.calculateLevel(totalXP);
    //     const progressToNextLevel = this.calculateProgressToNextLevel(totalXP, level);

    //     return progressToNextLevel;
    // }

    // private calculateLevel(xp: number): number {
    //     // Simple level calculation: level = sqrt(xp / 100)
    //     return Math.floor(Math.sqrt(xp / 100));
    // }

    // private calculateProgressToNextLevel(xp: number, currentLevel: number): number {
    //     const currentLevelXP = currentLevel * currentLevel * 100;
    //     const nextLevelXP = (currentLevel + 1) * (currentLevel + 1) * 100;
    //     return (xp - currentLevelXP) / (nextLevelXP - currentLevelXP);
    // }

    // async predictTaskDifficulty(userId: string, taskId: string): Promise<number> {
    //     const userProgress = await this.userProgressRepo.findByUserId(userId);
    //     const taskProgress = await this.taskProgressRepo.findByUserIdAndTaskId(userId, taskId);

    //     if (!userProgress || !taskProgress) {
    //         return 0.5; // Default medium difficulty
    //     }

    //     // Simple GLM: logistic regression
    //     const userSkill = userProgress.totalXpEarned / 1000; // Normalize user skill
    //     const taskDifficulty = taskProgress.attempts > 0 ? 1 / taskProgress.attempts : 1;

    //     const probability = 1 / (1 + Math.exp(-(userSkill - taskDifficulty)));
    //     return probability;
    // }

    // async adjustTaskDifficulty(userId: string, taskId: string): Promise<number> {
    //     const difficulty = await this.predictTaskDifficulty(userId, taskId);
    //     // Adjust difficulty based on prediction
    //     if (difficulty > 0.7) {
    //         return Math.min(difficulty * 1.2, 1); // Increase difficulty, max 1
    //     } else if (difficulty < 0.3) {
    //         return Math.max(difficulty * 0.8, 0); // Decrease difficulty, min 0
    //     }
    //     return difficulty;
    // }
}