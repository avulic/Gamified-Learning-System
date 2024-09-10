export interface UnlockConditions {
    type: 'xp' | 'module' | 'quiz' | 'assignment';
    requirement: number | string;
}

export default UnlockConditions;