<template>
    <Dialog :visible="dialogVisible" @update:visible="updateVisible" header="Add New Task" :modal="true"
        class="w-full max-w-lg">
        <div class="space-y-4">
            <div class="flex flex-col">
                <label class="mb-1">Title</label>
                <InputText v-model="taskForm.title" />
            </div>
            <div class="flex flex-col">
                <label class="mb-1">Description</label>
                <Textarea v-model="taskForm.description" rows="3" />
            </div>
            <div class="flex flex-col">
                <label class="mb-1">Task Type</label>
                <Dropdown v-model="taskForm.taskType" :options="taskTypes" optionLabel="label" optionValue="value" />
            </div>
            <div class="flex gap-4">
                <div class="flex flex-col flex-1">
                    <label class="mb-1">Points</label>
                    <InputNumber v-model="taskForm.points" :min="0" />
                </div>
                <div class="flex flex-col flex-1">
                    <label class="mb-1">Due Date</label>
                    <Calendar v-model="taskForm.dueDate" showTime />
                </div>
            </div>

            <!-- Task Type Specific Fields -->
            <div v-if="taskForm.taskType === TaskTypeEnum.FILE_UPLOAD" class="space-y-4">
                <div class="flex flex-col">
                    <label class="mb-1">Allowed File Types (comma-separated)</label>
                    <InputText v-model="fileUploadTypesInput" placeholder=".pdf,.doc,.docx"
                        @update:modelValue="(value: string | undefined) => handleFileTypesChange(value)" />
                </div>
                <div class="flex flex-col">
                    <label class="mb-1">Max File Size (MB)</label>
                    <InputNumber v-model="fileUploadSettings.maxFileSize" :min="1" :max="100" />
                </div>
            </div>

            <div v-if="taskForm.taskType === TaskTypeEnum.QUIZ" class="space-y-4">
                <div class="flex flex-col">
                    <label class="mb-1">Time Limit (minutes)</label>
                    <InputNumber v-model="quizSettings.timeLimit" :min="0" />
                </div>
                <div class="flex flex-col">
                    <label class="mb-1">Passing Score (%)</label>
                    <InputNumber v-model="quizSettings.passingScore" :min="0" :max="100" />
                </div>
                <div class="flex flex-col">
                    <label class="mb-1">Max Attempts</label>
                    <InputNumber v-model="quizSettings.maxAttempts" :min="1" />
                </div>

                <!-- Quiz Questions Section -->
                <div class="border p-3 rounded">
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="text-lg font-medium">Quiz Questions</h3>
                        <Button icon="pi pi-plus" label="Add Question" @click="showAddQuestionModal = true" />
                    </div>

                    <div v-if="quizSettings.questions.length === 0" class="text-center py-4 text-gray-500">
                        No questions added yet. Click the button above to add questions.
                    </div>

                    <div v-else class="space-y-3">
                        <div v-for="(question, index) in quizSettings.questions" :key="question.id"
                            class="p-3 border rounded flex justify-between items-center">
                            <div>
                                <div class="font-medium">{{ question.question }}</div>
                                <div class="text-sm text-gray-500">
                                    {{ getQuestionTypeName(question.questionType) }}
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <Button icon="pi pi-pencil" class="p-button-sm" @click="editQuestion(index)" />
                                <Button icon="pi pi-trash" class="p-button-sm p-button-danger"
                                    @click="removeQuestion(index)" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="taskForm.taskType === TaskTypeEnum.CODE" class="space-y-4">
                <div class="flex flex-col">
                    <label class="mb-1">Programming Language</label>
                    <Dropdown v-model="codeSettings.language" :options="programmingLanguages" />
                </div>
                <div class="flex flex-col">
                    <label class="mb-1">Initial Code</label>
                    <Textarea v-model="codeSettings.initialCode" rows="4" />
                </div>

                <!-- Test Cases Section -->
                <div class="border p-3 rounded">
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="text-lg font-medium">Test Cases</h3>
                        <Button icon="pi pi-plus" label="Add Test Case" @click="addTestCase" />
                    </div>

                    <div v-if="codeSettings.testCases.length === 0" class="text-center py-4 text-gray-500">
                        No test cases added yet. Click the button above to add test cases.
                    </div>

                    <div v-else class="space-y-3">
                        <div v-for="(testCase, index) in codeSettings.testCases" :key="index"
                            class="p-3 border rounded">
                            <div class="flex justify-between items-center mb-2">
                                <h4 class="font-medium">Test Case #{{ index + 1 }}</h4>
                                <Button icon="pi pi-trash" class="p-button-sm p-button-danger"
                                    @click="removeTestCase(index)" />
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div class="flex flex-col">
                                    <label class="mb-1">Input</label>
                                    <Textarea v-model="testCase.input" rows="2" />
                                </div>
                                <div class="flex flex-col">
                                    <label class="mb-1">Expected Output</label>
                                    <Textarea v-model="testCase.expectedOutput" rows="2" />
                                </div>
                            </div>
                            <div class="mt-2 flex items-center">
                                <Checkbox v-model="testCase.isHidden" binary class="mr-2" />
                                <label>Hidden from students</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="taskForm.taskType === TaskTypeEnum.QUESTION" class="space-y-4">
                <div class="flex flex-col">
                    <label class="mb-1">Question Type</label>
                    <Dropdown v-model="questionType" :options="questionTypes" optionLabel="label" optionValue="value" />
                </div>
                <div class="flex flex-col">
                    <label class="mb-1">Question</label>
                    <Textarea v-model="question" rows="3" />
                </div>

                <!-- Question Type Specific Fields -->
                <!-- Multiple Choice Options -->
                <div v-if="questionType === QuestionType.MULTI_CHOICE" class="space-y-2">
                    <div class="flex justify-between items-center">
                        <label>Options</label>
                        <Button icon="pi pi-plus" @click="addOption" class="p-button-sm" />
                    </div>
                    <div v-for="(option, index) in multiChoiceOptions" :key="index" class="flex gap-2 items-center">
                        <InputText v-model="option.text" class="flex-1" placeholder="Option text" />
                        <Checkbox v-model="option.isCorrect" binary />
                        <Button icon="pi pi-trash" @click="removeOption(index)" class="p-button-sm p-button-danger" />
                    </div>
                    <div v-if="multiChoiceOptions.length === 0" class="text-center py-2 text-gray-500">
                        No options added yet. Click the plus button to add options.
                    </div>
                </div>

                <!-- True/False Answer -->
                <div v-if="questionType === QuestionType.TRUE_FALSE" class="space-y-2">
                    <label class="mb-1">Correct Answer</label>
                    <div class="flex gap-4">
                        <div class="flex items-center">
                            <RadioButton v-model="trueFalseAnswer" :value="true" />
                            <label class="ml-2">True</label>
                        </div>
                        <div class="flex items-center">
                            <RadioButton v-model="trueFalseAnswer" :value="false" />
                            <label class="ml-2">False</label>
                        </div>
                    </div>
                </div>

                <!-- Text Answer -->
                <div v-if="questionType === QuestionType.TEXT" class="space-y-2">
                    <label class="mb-1">Correct Answer</label>
                    <InputText v-model="textCorrectAnswer" placeholder="Correct answer" />
                </div>
            </div>
        </div>
        <template #footer>
            <Button label="Cancel" @click="handleCancel" class="p-button-text" />
            <Button label="Add Task" @click="handleAdd" :disabled="!isFormValid" />
        </template>
    </Dialog>

    <!-- Modal for adding questions to Quiz -->
    <Dialog v-model:visible="showAddQuestionModal" header="Add Question" :modal="true" class="w-full max-w-lg">
        <div class="space-y-4">
            <div class="flex flex-col">
                <label class="mb-1">Question Type</label>
                <Dropdown v-model="modalQuestionType" :options="questionTypes" optionLabel="label"
                    optionValue="value" />
            </div>
            <div class="flex flex-col">
                <label class="mb-1">Question</label>
                <Textarea v-model="modalQuestion" rows="3" />
            </div>

            <!-- Question Type Specific Fields -->
            <!-- Multiple Choice Options -->
            <div v-if="modalQuestionType === QuestionType.MULTI_CHOICE" class="space-y-2">
                <div class="flex justify-between items-center">
                    <label>Options</label>
                    <Button icon="pi pi-plus" @click="addModalOption" class="p-button-sm" />
                </div>
                <div v-for="(option, index) in modalMultiChoiceOptions" :key="index" class="flex gap-2 items-center">
                    <InputText v-model="option.text" class="flex-1" placeholder="Option text" />
                    <Checkbox v-model="option.isCorrect" binary />
                    <Button icon="pi pi-trash" @click="removeModalOption(index)" class="p-button-sm p-button-danger" />
                </div>
                <div v-if="modalMultiChoiceOptions.length === 0" class="text-center py-2 text-gray-500">
                    No options added yet. Click the plus button to add options.
                </div>
            </div>

            <!-- True/False Answer -->
            <div v-if="modalQuestionType === QuestionType.TRUE_FALSE" class="space-y-2">
                <label class="mb-1">Correct Answer</label>
                <div class="flex gap-4">
                    <div class="flex items-center">
                        <RadioButton v-model="modalTrueFalseAnswer" :value="true" />
                        <label class="ml-2">True</label>
                    </div>
                    <div class="flex items-center">
                        <RadioButton v-model="modalTrueFalseAnswer" :value="false" />
                        <label class="ml-2">False</label>
                    </div>
                </div>
            </div>

            <!-- Text Answer -->
            <div v-if="modalQuestionType === QuestionType.TEXT" class="space-y-2">
                <label class="mb-1">Correct Answer</label>
                <InputText v-model="modalTextCorrectAnswer" placeholder="Correct answer" />
            </div>
        </div>
        <template #footer>
            <Button label="Cancel" @click="showAddQuestionModal = false" class="p-button-text" />
            <Button label="Add Question" @click="addQuizQuestion" :disabled="!isModalQuestionValid" />
        </template>
    </Dialog>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { TaskTypeEnum, ProgressTypeEnum, QuestionType } from '@/types/enums';
import {
    FileUploadTaskContent,
    QuizTaskContent,
    CodeTaskContent,
    CodeTestCase,
    QuizTask,
    CodeTask,
    Task,
    BaseTask,
    FileUploadTask,
    QuestionTask
} from '@/types/task/Task';
import {
    Question,
    MultiChoiceQuestion,
    TrueFalseQuestion,
    TextQuestion,
    MultiChoiceOption
} from '@/types/task/Question';

const props = defineProps<{
    visible: boolean;
    newTask: Partial<BaseTask>;
}>();

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'add', value: Task): void;
}>();

const dialogVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => emit('update:visible', value)
});

const updateVisible = (value: boolean) => {
    emit('update:visible', value);
};

const taskTypes = [
    { label: 'File Upload', value: TaskTypeEnum.FILE_UPLOAD },
    { label: 'Quiz', value: TaskTypeEnum.QUIZ },
    { label: 'Code', value: TaskTypeEnum.CODE },
    { label: 'Question', value: TaskTypeEnum.QUESTION }
];

const questionTypes = [
    { label: 'Multiple Choice', value: QuestionType.MULTI_CHOICE },
    { label: 'True/False', value: QuestionType.TRUE_FALSE },
    { label: 'Text', value: QuestionType.TEXT }
];

const programmingLanguages = ['javascript', 'python', 'java', 'cpp'];

const taskForm = ref({
    ...props.newTask,
    taskType: TaskTypeEnum.QUESTION
});

// File Upload settings
const fileUploadSettings = ref<FileUploadTaskContent>({
    allowedFileTypes: [".pdf"],
    maxFileSize: 5
});
const fileUploadTypesInput = ref('');

// Quiz settings
const quizSettings = ref<QuizTaskContent>({
    questions: [],
    timeLimit: 30,
    passingScore: 70,
    maxAttempts: 1
});

// Code settings
const codeSettings = ref<CodeTaskContent>({
    language: 'javascript',
    testCases: [],
    initialCode: '',
});

// Question settings for direct Question task
const question = ref('');
const questionType = ref(QuestionType.TEXT);
const multiChoiceOptions = ref<MultiChoiceOption[]>([]);
const trueFalseAnswer = ref<boolean>(true);
const textCorrectAnswer = ref<string>('');

// Question modal for quiz questions
const showAddQuestionModal = ref(false);
const modalQuestion = ref('');
const modalQuestionType = ref(QuestionType.TEXT);
const modalMultiChoiceOptions = ref<MultiChoiceOption[]>([]);
const modalTrueFalseAnswer = ref<boolean>(true);
const modalTextCorrectAnswer = ref<string>('');
const editingQuestionIndex = ref<number | null>(null);

// Handlers for file upload
const handleFileTypesChange = (value: string | undefined) => {
    fileUploadSettings.value.allowedFileTypes = value ?
        value.split(',').map(type => type.trim()).filter(Boolean) :
        [];
};

// Handlers for questions
const addOption = () => {
    multiChoiceOptions.value.push({
        text: '',
        isCorrect: false
    });
};

const removeOption = (index: number) => {
    multiChoiceOptions.value.splice(index, 1);
};

// Handlers for quiz questions modal
const addModalOption = () => {
    modalMultiChoiceOptions.value.push({
        text: '',
        isCorrect: false
    });
};

const removeModalOption = (index: number) => {
    modalMultiChoiceOptions.value.splice(index, 1);
};

const getQuestionTypeName = (type: QuestionType): string => {
    const found = questionTypes.find(qt => qt.value === type);
    return found ? found.label : 'Unknown';
};

// Handlers for code test cases
const addTestCase = () => {
    codeSettings.value.testCases.push({
        input: '',
        expectedOutput: '',
        isHidden: false
    });
};

const removeTestCase = (index: number) => {
    codeSettings.value.testCases.splice(index, 1);
};

// Quiz question management
const editQuestion = (index: number) => {
    const question = quizSettings.value.questions[index];
    editingQuestionIndex.value = index;
    modalQuestion.value = question.question;
    modalQuestionType.value = question.questionType;

    // Reset all answer types
    modalMultiChoiceOptions.value = [];
    modalTrueFalseAnswer.value = true;
    modalTextCorrectAnswer.value = '';

    // Set appropriate values based on question type
    if (question.questionType === QuestionType.MULTI_CHOICE) {
        const multiChoice = question as MultiChoiceQuestion;
        modalMultiChoiceOptions.value = [...multiChoice.options];
    } else if (question.questionType === QuestionType.TRUE_FALSE) {
        const trueFalse = question as TrueFalseQuestion;
        modalTrueFalseAnswer.value = trueFalse.correctAnswer;
    } else if (question.questionType === QuestionType.TEXT) {
        const text = question as TextQuestion;
        modalTextCorrectAnswer.value = text.correctAnswer;
    }

    showAddQuestionModal.value = true;
};

const removeQuestion = (index: number) => {
    quizSettings.value.questions.splice(index, 1);
};

const resetModalFields = () => {
    modalQuestion.value = '';
    modalQuestionType.value = QuestionType.TEXT;
    modalMultiChoiceOptions.value = [];
    modalTrueFalseAnswer.value = true;
    modalTextCorrectAnswer.value = '';
    editingQuestionIndex.value = null;
};

const createQuestionFromModal = (): Question => {
    let newQuestion: Question;

    switch (modalQuestionType.value) {
        case QuestionType.MULTI_CHOICE:
            newQuestion = {
                id: crypto.randomUUID(),
                question: modalQuestion.value,
                questionType: QuestionType.MULTI_CHOICE,
                options: [...modalMultiChoiceOptions.value]
            } as MultiChoiceQuestion;
            break;

        case QuestionType.TRUE_FALSE:
            newQuestion = {
                id: crypto.randomUUID(),
                question: modalQuestion.value,
                questionType: QuestionType.TRUE_FALSE,
                correctAnswer: modalTrueFalseAnswer.value
            } as TrueFalseQuestion;
            break;

        case QuestionType.TEXT:
        default:
            newQuestion = {
                id: crypto.randomUUID(),
                question: modalQuestion.value,
                questionType: QuestionType.TEXT,
                correctAnswer: modalTextCorrectAnswer.value
            } as TextQuestion;
            break;
    }

    return newQuestion;
};

const addQuizQuestion = () => {
    const newQuestion = createQuestionFromModal();

    if (editingQuestionIndex.value !== null) {
        // Update existing question
        quizSettings.value.questions[editingQuestionIndex.value] = newQuestion;
    } else {
        // Add new question
        quizSettings.value.questions.push(newQuestion);
    }

    showAddQuestionModal.value = false;
    resetModalFields();
};

// Form validation
const isModalQuestionValid = computed(() => {
    if (!modalQuestion.value) return false;

    switch (modalQuestionType.value) {
        case QuestionType.MULTI_CHOICE:
            return modalMultiChoiceOptions.value.length >= 2 &&
                modalMultiChoiceOptions.value.some(opt => opt.isCorrect) &&
                modalMultiChoiceOptions.value.every(opt => !!opt.text);
        case QuestionType.TRUE_FALSE:
            return true; // Always valid
        case QuestionType.TEXT:
            return !!modalTextCorrectAnswer.value;
        default:
            return false;
    }
});

watch(() => props.visible, (newValue) => {
    if (newValue) {
        taskForm.value = { ...props.newTask, taskType: TaskTypeEnum.QUESTION };
        resetTypeSpecificSettings();
    }
});

const resetTypeSpecificSettings = () => {
    fileUploadSettings.value = {
        allowedFileTypes: [],
        maxFileSize: 5
    };
    quizSettings.value = {
        questions: [],
        timeLimit: 30,
        passingScore: 70,
        maxAttempts: 1
    };
    codeSettings.value = {
        language: 'javascript',
        testCases: [],
        initialCode: ''
    };

    // Reset question fields
    question.value = '';
    questionType.value = QuestionType.TEXT;
    multiChoiceOptions.value = [];
    trueFalseAnswer.value = true;
    textCorrectAnswer.value = '';

    fileUploadTypesInput.value = '';
};

const isFormValid = computed(() => {
    const baseValidation =
        taskForm.value.title &&
        taskForm.value.description &&
        taskForm.value.points !== undefined &&
        taskForm.value.points >= 0 &&
        taskForm.value.dueDate;

    if (!baseValidation) return false;

    switch (taskForm.value.taskType) {
        case TaskTypeEnum.FILE_UPLOAD:
            return fileUploadSettings.value.maxFileSize > 0;
        case TaskTypeEnum.QUIZ:
            return quizSettings.value.questions.length > 0;
        case TaskTypeEnum.CODE:
            return !!codeSettings.value.language;
        case TaskTypeEnum.QUESTION:
            if (!question.value) return false;

            switch (questionType.value) {
                case QuestionType.MULTI_CHOICE:
                    return multiChoiceOptions.value.length >= 2 &&
                        multiChoiceOptions.value.some(opt => opt.isCorrect) &&
                        multiChoiceOptions.value.every(opt => !!opt.text);
                case QuestionType.TRUE_FALSE:
                    return true; // Always valid
                case QuestionType.TEXT:
                    return !!textCorrectAnswer.value;
                default:
                    return false;
            }
        default:
            return false;
    }
});

const createQuestionContent = (): Question => {
    switch (questionType.value) {
        case QuestionType.MULTI_CHOICE:
            return {
                id: crypto.randomUUID(),
                question: question.value,
                questionType: QuestionType.MULTI_CHOICE,
                options: [...multiChoiceOptions.value]
            } as MultiChoiceQuestion;

        case QuestionType.TRUE_FALSE:
            return {
                id: crypto.randomUUID(),
                question: question.value,
                questionType: QuestionType.TRUE_FALSE,
                correctAnswer: trueFalseAnswer.value
            } as TrueFalseQuestion;

        case QuestionType.TEXT:
        default:
            return {
                id: crypto.randomUUID(),
                question: question.value,
                questionType: QuestionType.TEXT,
                correctAnswer: textCorrectAnswer.value
            } as TextQuestion;
    }
};

const createTask = (): Task => {
    const baseTask: BaseTask = {
        id: crypto.randomUUID(),
        title: taskForm.value.title || '',
        description: taskForm.value.description || '',
        taskType: taskForm.value.taskType,
        status: ProgressTypeEnum.NOT_STARTED,
        points: taskForm.value.points || 0,
        order: 0,
        xpReward: taskForm.value.points || 0,
        requiredForCompletion: true,
        dueDate: taskForm.value.dueDate || new Date(),
        assignmentId: taskForm.value.assignmentId || '',
    };

    switch (taskForm.value.taskType) {
        case TaskTypeEnum.FILE_UPLOAD:
            return {
                ...baseTask,
                taskType: TaskTypeEnum.FILE_UPLOAD,
                content: {
                    ...fileUploadSettings.value,
                    maxFileSize: fileUploadSettings.value.maxFileSize * 1024 * 1024 // Convert MB to bytes
                }
            } as FileUploadTask;

        case TaskTypeEnum.QUIZ:
            return {
                ...baseTask,
                taskType: TaskTypeEnum.QUIZ,
                content: { ...quizSettings.value }
            } as QuizTask;

        case TaskTypeEnum.CODE:
            return {
                ...baseTask,
                taskType: TaskTypeEnum.CODE,
                content: { ...codeSettings.value }
            } as CodeTask;

        default:
        case TaskTypeEnum.QUESTION:
            return {
                ...baseTask,
                taskType: TaskTypeEnum.QUESTION,
                content: createQuestionContent()
            } as QuestionTask;
    }
};

const handleCancel = () => {
    emit('update:visible', false);
};

const handleAdd = () => {
    const task = createTask();
    emit('add', task);
    emit('update:visible', false);
};
</script>