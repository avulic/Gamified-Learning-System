export interface UnlockConditions {
    type: 'xp' | 'module' | 'assignment';
    requirement: number | string;
}

export default UnlockConditions;