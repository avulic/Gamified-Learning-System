
export interface ProgressData {
    current: number;
    total: number;
    milestones: Milestone[];
}

export interface Milestone {
    id: string;
    title: string;
    threshold: number;
    achieved: boolean;
    reward?: Achievement;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
}


import { ref, computed, onMounted, watch } from 'vue';


export function useProgress(progressData: ProgressData) {
    const currentProgress = ref(progressData.current);
    const totalProgress = ref(progressData.total);
    const achievements = ref<Achievement[]>([]);
    const isLoading = ref(false);

    const percentage = computed(() => {
        return Math.round((currentProgress.value / totalProgress.value) * 100);
    });

    const checkMilestones = () => {
        progressData.milestones.forEach(milestone => {
            if (!milestone.achieved && percentage.value >= milestone.threshold) {
                if (milestone.reward) {
                    achievements.value.push(milestone.reward);
                    emitAchievement(milestone.reward);
                }
            }
        });
    };

    watch(percentage, checkMilestones);

    const emitAchievement = (achievement: Achievement) => {
        // Achievement notification system integration point
    };

    return {
        percentage,
        achievements,
        isLoading
    };
}
