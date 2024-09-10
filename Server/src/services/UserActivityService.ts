import { inject, injectable } from 'inversify';
import { Types } from 'mongoose';
import { TYPES } from '../types';
import { UserRepository } from '@/repository/UserRepository';

@injectable()
export class UserActivityService {
    constructor(
        @inject(TYPES.UserRepository) private userModel: UserRepository
    ) { }

    // async logActivity(userId: string, action: string, details?: any): Promise<void> {
    //     await this.userModel.findByIdAndUpdate(userId, {
    //         $push: {
    //             activityLog: {
    //                 action,
    //                 timestamp: new Date(),
    //                 details
    //             }
    //         }
    //     });
    // }

    // async logCourseAccess(userId: string, courseId: string): Promise<void> {
    //     await this.userModel.findOneAndUpdate(
    //         { _id: userId, 'enrolledCourses.courseId': courseId },
    //         {
    //             $set: { 'enrolledCourses.$.lastAccessed': new Date() },
    //             $push: {
    //                 activityLog: {
    //                     action: 'course_access',
    //                     timestamp: new Date(),
    //                     details: { courseId }
    //                 }
    //             }
    //         }
    //     );
    // }

    // async logAssignmentSubmission(userId: string, courseId: string, assignmentId: string): Promise<void> {
    //     await this.logActivity(userId, 'assignment_submission', { courseId, assignmentId });
    // }

    // async logResourceAccess(userId: string, courseId: string, resourceId: string): Promise<void> {
    //     await this.logActivity(userId, 'resource_access', { courseId, resourceId });
    // }

    // async logQuizAttempt(userId: string, courseId: string, quizId: string): Promise<void> {
    //     await this.logActivity(userId, 'quiz_attempt', { courseId, quizId });
    // }

    // async logForumActivity(userId: string, courseId: string, forumId: string, activityType: 'post' | 'reply' | 'view'): Promise<void> {
    //     await this.logActivity(userId, 'forum_activity', { courseId, forumId, activityType });
    // }

    // async getRecentActivities(userId: string, limit: number = 10): Promise<IUser['activityLog']> {
    //     const user = await this.userModel.findById(userId).select('activityLog');
    //     return user?.activityLog.slice(-limit).reverse() || [];
    // }

    // async getActivitySummary(userId: string, startDate: Date, endDate: Date): Promise<any> {
    //     const user = await this.userModel.findById(userId).select('activityLog');
    //     if (!user) return null;

    //     const relevantActivities = user.activityLog.filter(
    //         activity => activity.timestamp >= startDate && activity.timestamp <= endDate
    //     );

    //     const summary = {
    //         totalActivities: relevantActivities.length,
    //         courseAccesses: 0,
    //         assignmentSubmissions: 0,
    //         resourceAccesses: 0,
    //         quizAttempts: 0,
    //         forumActivities: 0
    //     };

    //     relevantActivities.forEach(activity => {
    //         switch (activity.action) {
    //             case 'course_access':
    //                 summary.courseAccesses++;
    //                 break;
    //             case 'assignment_submission':
    //                 summary.assignmentSubmissions++;
    //                 break;
    //             case 'resource_access':
    //                 summary.resourceAccesses++;
    //                 break;
    //             case 'quiz_attempt':
    //                 summary.quizAttempts++;
    //                 break;
    //             case 'forum_activity':
    //                 summary.forumActivities++;
    //                 break;
    //         }
    //     });

    //     return summary;
    // }
}