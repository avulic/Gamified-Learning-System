enum TaskTypeEnum {
    Quiz = "Quiz",
    MultiChoice = "Multi",
    Question = "Question"
}

interface Task {
    id: string;
    title: string;
    description: string;
    assignmentId: string; // Many-to-One relationship with Assignment
    totalPoints: number;
    fileReference: string;
    type: TaskTypeEnum
}

