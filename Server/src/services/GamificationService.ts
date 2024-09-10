import { injectable, inject } from 'inversify';
import { TYPES } from '@/types';

import { NotFoundError } from '@/models/app/Errors/NotFoundError';
import UserProgressRepository from '@/repository/Progress/UserProgressRepository';

@injectable()
export class GamificationService {
    constructor(
        @inject(TYPES.UserProgressRepository) private userProgressRepo: UserProgressRepository,
       
    ) { }

    // async awardXP(userId: string, xp: number): Promise<IUserProgress> {
    //     const userProgress = await this.userProgressRepo.findByUserId(userId);
    //     if (!userProgress) {
    //         throw new NotFoundError('User progress not found');
    //     }

    //     userProgress.totalXpEarned += xp;
    //     const updatedProgress = await this.userProgressRepo.update(userProgress);

    //     // Check for level up
    //     const newLevel = this.calculateLevel(updatedProgress.totalXpEarned);
    //     if (newLevel > updatedProgress.level) {
    //         updatedProgress.level = newLevel;
    //         // TODO: Trigger level up event or notification
    //     }

    //     return updatedProgress;
    // }

    // async checkAchievements(userId: string): Promise<IAchievement[]> {
    //     const userProgress = await this.userProgressRepo.findByUserId(userId);
    //     if (!userProgress) {
    //         throw new NotFoundError('User progress not found');
    //     }

    //     const allAchievements = await this.achievementRepo.findAll();
    //     const newAchievements: IAchievement[] = [];

    //     for (const achievement of allAchievements) {
    //         if (!userProgress.achievements.includes(achievement.id) && this.hasMetCriteria(userProgress, achievement)) {
    //             userProgress.achievements.push(achievement.id);
    //             newAchievements.push(achievement);
    //         }
    //     }

    //     if (newAchievements.length > 0) {
    //         await this.userProgressRepo.update(userProgress);
    //         // TODO: Trigger achievement unlocked event or notification
    //     }

    //     return newAchievements;
    // }

    // private calculateLevel(xp: number): number {
    //     return Math.floor(Math.sqrt(xp / 100));
    // }

    // private hasMetCriteria(userProgress: IUserProgress, achievement: IAchievement): boolean {
    //     // Implement achievement criteria checks
    //     // Example:
    //     switch (achievement.type) {
    //         case 'XP_MILESTONE':
    //             return userProgress.totalXpEarned >= achievement.requiredValue;
    //         case 'COURSE_COMPLETION':
    //             return userProgress.completedCourses.length >= achievement.requiredValue;
    //         // Add more achievement types as needed
    //         default:
    //             return false;
    //     }
    // }
}