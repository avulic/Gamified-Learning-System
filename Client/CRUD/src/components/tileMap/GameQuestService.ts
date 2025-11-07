
import ApiService from '@/services/RpgApiService';
import { get, post, put } from '@/services/RpgApiService';
import { IGameQuest, IGameEvent, Quest } from './game';
import TaskService from '@/services/TaskService';
import { Task } from 'vitest';

class GameQuestService {
    private readonly BASE_URL = '/';

    async saveQuest(quest: Quest): Promise<Quest> {
        try {
            const response = await post<Quest>(this.BASE_URL, quest);
            return response.data;
        } catch (error) {
            console.error('Failed to save quest:', error);
            throw new Error('Failed to save quest');
        }
    }

    async updateQuestTasks(quest: Quest): Promise<void> {
        try {
            // First update all task prerequisites
            const taskUpdates = quest.sprites.flatMap(sprite =>
                sprite.tasks.map(task => ({
                    taskId: task.taskId,
                    prerequisites: task.prerequisites
                }))
            );

            // Use Promise.all to run updates in parallel
            await Promise.all(
                taskUpdates.map(({ taskId, prerequisites }) =>
                    TaskService.updateTask(taskId, { prerequisites } as unknown as  Task)
                )
            );

            // Then update the quest mapping
            await post('/api/assignments/update-tasks', {
                assignmentId: quest.assignmentId,
                mapId: quest.mapId,
                quests: quest.sprites.map(sprite => ({
                    spriteLabel: sprite.spriteLabel,
                    spriteUrl: sprite.spriteUrl,
                    position: sprite.position,
                    layer: sprite.layer,
                    tasks: sprite.tasks.map(task => ({
                        taskId: task.taskId,
                        prerequisites: task.prerequisites,
                        dialogue: task.dialogue,
                        rewards: task.rewards
                    }))
                }))
            });
        } catch (error) {
            console.error('Failed to update quest tasks:', error);
            throw new Error('Failed to update quest tasks');
        }
    }
}

export default new GameQuestService();