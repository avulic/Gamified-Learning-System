import mongooseDb from '@/adapters/mongooseDb';
import Assignment, { IAssignmentDb } from '@/models/db/mongo/Assignment.db';
import Course, { ICourseDb } from '@/models/db/mongo/Course.db';
import Module, { ILessonDb, IModuleDb } from '@/models/db/mongo/Module.db';
import { ActivityLog } from '@/models/db/mongo/Progress/ActivityLog';
import Submission, { BaseTaskSubmission } from '@/models/db/mongo/Submission.db';
import Role, { IRoleDb } from '@/models/db/mongo/Role.db';
import User, { IUserDb } from '@/models/db/mongo/User.db';
import { Roles, TaskTypeEnum, ProgressTypeEnum, QuestionType, SubmissionStatus, GradingStatus, ParentType, SubmissionTypeEnum } from '@/models/enums';
import { faker } from '@faker-js/faker';
import mongoose, { Types, ObjectId } from 'mongoose';
import bcrypt from 'bcryptjs';
import File, { IFileDb } from '@/models/db/mongo/File.db';

import { ITaskProgressDb, IUserProgressDb, UserProgressDb } from '@/models/db/mongo/Progress/Progress';
import {
    IFileUploadTaskDb, IQuestionTaskDb, IBaseAnswerDb, IMultiChoiceAnswerDb, ITaskSubmissionDb, ICodeTaskDb, IQuizTaskDb,
    ITextAnswerDb, ITrueFalseAnswerDb, ITaskDb, IBaseTaskDb, IQuizTaskContentDb,
    IAnswerDb
} from '@/models/db/mongo';
import { IMultiChoiceQuestionDb, IQuestionDb, ITextQuestionDb, ITrueFalseQuestionDb } from '@/models/db/mongo/Question.db';
import { FileStatus } from '@/models/app/File.entity';
import AssignmentProgress from '@/models/db/mongo/AssignmentProgress.db';
import BaseTask from '@/models/db/mongo/Task.db';
import { IGradeDb } from '@/models/db/mongo/Grade.db';
import { CodeSubmission, FileUploadSubmission, QuestionSubmission, QuizSubmission, TaskSubmission } from '@/models/app';

var files: IFileDb[];

export async function seed() {
    try {
        console.log('Seeding db started');

        await Promise.all([
            Role.deleteMany({}),
            User.deleteMany({}),
            Course.deleteMany({}),
            Module.deleteMany({}),
            Assignment.deleteMany({}),
            ActivityLog.deleteMany({}),
            File.deleteMany({}),
        ]);

        const roles = await seedRoles();
        const users = await seedUsers(roles);
        const courses = await seedCourses(users);
        const modules = await seedModules(courses);
        const assignments = await seedAssignmentsAndSubmissions(modules, users);


        console.log('Seed completed successfully');
    } catch (error) {
        console.error('Seed failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}



async function seedRoles() {
    // Create role documents
    const roleObjects = Object.values(Roles).map(role => ({ name: role }));
    const roles = await Role.create(roleObjects);
    console.log(`${roles.length} roles created`);
    return roles;
}

async function seedUsers(roles: IRoleDb[]) {  // Accept roles parameter
    const users: IUserDb[] = [];

    // Define distribution of roles (more students than other roles)
    const roleDistribution = {
        [Roles.STUDENT]: 35,
        [Roles.PROFESSOR]: 10,
        [Roles.ADMIN]: 5
    };

    // Create users for each role according to the distribution
    for (const [roleName, count] of Object.entries(roleDistribution)) {
        const role = roles.find(r => r.name === roleName);

        if (!role) {
            console.error(`Role ${roleName} not found!`);
            continue;
        }

        for (let i = 0; i < count; i++) {
            const user = new User({
                name: faker.person.firstName(),
                lastName: faker.person.lastName(),
                email: faker.internet.email(),
                username: faker.internet.username(),
                password: await bcrypt.hash('password123', 10),
                roles: [{
                    _id: role._id,
                    name: role.name,
                    description: role.description
                }],
                profilePicture: faker.image.avatar(),
                preferences: {
                    notifications: faker.datatype.boolean(),
                    theme: faker.helpers.arrayElement(['light', 'dark']),
                    language: faker.helpers.arrayElement(['en', 'es', 'fr'])
                },
                enrolledCourses: []  // populate this when seeding courses
            });
            users.push(user);
        }
    }

    await User.insertMany(users);
    console.log(`${users.length} users created`);
    return users;
}

async function generateFakeFiles(parentType: ParentType, parentId: Types.ObjectId, uploadedBy: Types.ObjectId): Promise<IFileDb[]> {
    const fileCount = faker.number.int({ min: 1, max: 4 });
    const fakeFiles: Partial<IFileDb>[] = [];

    for (let i = 0; i < fileCount; i++) {
        const fileName = faker.system.fileName();
        fakeFiles.push({
            filename: fileName,
            originalName: fileName,
            mimetype: faker.system.mimeType(),
            size: faker.number.int({ min: 1000, max: 1000000 }),
            url: `/uploads/${faker.string.uuid()}/${fileName}`,
            uploadedBy: uploadedBy,
            uploadedAt: faker.date.recent(),
            version: 1,
            isPublic: faker.datatype.boolean(),
            tags: faker.helpers.arrayElements(['syllabus', 'resource', 'reading', 'reference'],
                faker.number.int({ min: 1, max: 3 })),
            status: faker.helpers.arrayElement(Object.values(FileStatus)),
            parentType: parentType,
            parentId: parentId,
            encoding: faker.system.fileExt('application/pdf'),
            lastModified: faker.date.recent()
        });
    }

    const savedFiles = await File.insertMany(fakeFiles) as IFileDb[];
    return savedFiles;
}

async function seedCourses(users: IUserDb[]) {
    const courses: ICourseDb[] = [];
    const instructors = users.filter(user =>
        user.roles.some(r => r.name === Roles.PROFESSOR)
    );
    const students = users.filter(user =>
        user.roles.some(r => r.name === Roles.STUDENT)
    );

    for (let i = 0; i < 10; i++) {
        const courseInstructors = faker.helpers.arrayElements(
            instructors,
            faker.number.int({ min: 1, max: 3 })
        );

        const enrolledStudents = faker.helpers.arrayElements(
            students,
            faker.number.int({ min: 5, max: 30 })
        );

        const course = new Course({
            title: faker.lorem.words(3),
            description: faker.lorem.paragraph(),
            instructors: courseInstructors.map(instructor => ({
                _id: instructor._id,
                name: `${instructor.name} ${instructor.lastName}`
            })),
            modules: [],
            prerequisites: [],
            categories: faker.helpers.arrayElements(['Math', 'Science', 'History', 'Literature', 'Computer Science'], faker.number.int({ min: 1, max: 3 })),
            enrollmentCode: faker.string.alphanumeric(8),
            isPublished: faker.datatype.boolean(),
            version: 1,
            lastUpdated: faker.date.recent(),
            enrolledStudentCount: enrolledStudents.length,
            xpReward: faker.number.int({ min: 100, max: 1000 })
        });

        // Save the course first to get a valid _id
        const savedCourse = await course.save();

        // Now generate files for this course
        const courseFiles = await generateFakeFiles(
            ParentType.COURSE,
            savedCourse._id,
            courseInstructors[0]._id as Types.ObjectId // Use first instructor as uploader
        );

        // Update course with file IDs
        savedCourse.fileIds = courseFiles.map(file => file._id) as Types.ObjectId[];
        await savedCourse.save();

        courses.push(savedCourse);

        // Update enrolled students
        for (const student of enrolledStudents) {
            student.enrolledCourses = student.enrolledCourses || [];
            student.enrolledCourses.push({
                courseId: savedCourse._id,
                courseName: savedCourse.title
            });
        }


        await Promise.all(enrolledStudents.map(student => User.findByIdAndUpdate(student._id, {
            $push: {
                enrolledCourses: {
                    courseId: savedCourse._id,
                    courseName: savedCourse.title
                }
            }
        })));
    }

    console.log(`${courses.length} courses created with their files`);
    return courses;
}


async function seedModules(courses: ICourseDb[]) {
    const modules: IModuleDb[] = [];

    for (const course of courses) {
        // Find instructors for this course
        const courseInstructorIds = course.instructors.map(i => i._id);

        for (let i = 0; i < 5; i++) {
            const module = new Module({
                courseId: course._id,
                title: faker.lorem.words(2),
                description: faker.lorem.sentence(),
                order: i + 1,
                xpReward: faker.number.int({ min: 50, max: 200 }),
                badgeReward: faker.helpers.arrayElement(['Bronze', 'Silver', 'Gold']),
                learningObjectives: Array(3).fill(null).map(() => faker.lorem.sentence()),
                estimatedDuration: faker.number.int({ min: 30, max: 180 }),
                difficulty: faker.number.int({ min: 1, max: 5 }),
                tags: faker.helpers.arrayElements(['beginner', 'intermediate', 'advanced', 'theory', 'practical'], faker.number.int({ min: 1, max: 3 })),
                publishedAt: faker.date.past(),
                prerequisitesModulesId: []
            });

            // Save the module first to get a valid _id
            const savedModule = await module.save();

            // Generate files for this module
            const moduleFiles = await generateFakeFiles(
                ParentType.MODULE,
                savedModule._id,
                courseInstructorIds[0] // Use first instructor as uploader
            );

            // Create lessons with file references
            const lessons: ILessonDb[] = [];
            for (let j = 0; j < 3; j++) {
                // Generate files for this lesson
                const lessonFiles = await generateFakeFiles(
                    ParentType.LESSON,
                    new Types.ObjectId(), // Lesson ID would go here if tracked separately
                    courseInstructorIds[0]
                );

                lessons.push({
                    _id: new Types.ObjectId(),
                    title: faker.lorem.words(3),
                    content: faker.lorem.paragraphs(3),
                    order: j + 1,
                    assignmentIds: [], // Will be populated after assignments creation
                    fileIds: lessonFiles.map(file => file._id) as Types.ObjectId[]
                });
            }

            // Update module with files and lessons
            savedModule.fileIds = moduleFiles.map(file => file._id) as Types.ObjectId[];
            savedModule.lessons = lessons;
            await savedModule.save();

            modules.push(savedModule);
        }
    }

    console.log(`${modules.length} modules created with their files`);
    return modules;
}

async function seedAssignmentsAndSubmissions(modules: IModuleDb[], users: IUserDb[]) {
    await createModuleAssignments(modules, users);
    await createLessonAssignments(modules, users);
}

async function createAssignmentsForParent(
    count: number,
    parentId: Types.ObjectId,
    parentType: ParentType,
    users: IUserDb[]
): Promise<{
    assignments: IAssignmentDb[];
    tasks: ITaskDb[];
    submissions: ITaskSubmissionDb[];
    answers: IAnswerDb[];
}> {
    const students = users.filter(user => user.roles.some(r => r.name === Roles.STUDENT));
    const profs = users.filter(u => u.roles.some(r => r.name === Roles.PROFESSOR));

    const parentData = {
        assignments: [] as IAssignmentDb[],
        tasks: [] as ITaskDb[],
        submissions: [] as ITaskSubmissionDb[],
        answers: [] as IAnswerDb[]
    };

    for (let i = 0; i < count; i++) {
        // Create assignment
        const assignmentData = {
            title: faker.lorem.sentence(),
            description: faker.lorem.paragraph(),
            parentType,
            parentId,
            createdBy: faker.helpers.arrayElement(profs)._id,
            rubric: {
                criteria: Array(3).fill(null).map(() => ({
                    criterion: faker.lorem.sentence(),
                    points: faker.number.int({ min: 1, max: 10 })
                }))
            },
            peerReviewSettings: {
                enabled: faker.datatype.boolean(),
                reviewsPerStudent: faker.number.int({ min: 1, max: 3 }),
                dueDate: faker.date.future()
            },
            maxAttempts: faker.number.int({ min: 1, max: 3 }),
            passingScore: faker.number.int({ min: 60, max: 100 }),
            points: faker.number.int({ min: 10, max: 100 }),
            submissionWindow: {
                start: faker.date.past(),
                end: faker.date.future(),
                allowLateSubmissions: faker.datatype.boolean(),
                lateSubmissionPenalty: faker.number.int({ min: 5, max: 30 })
            }
        };
        const assignment = await Assignment.create(assignmentData);
        parentData.assignments.push(assignment);
        // Create tasks for this assignment
        const tasks = await createTasks(assignment._id);
        parentData.tasks.push(...tasks);
        // For some assignments, create student progress and submissions
        if (faker.datatype.boolean(0.8)) { // 80% chance of having submissions
            // Choose a few random students for this assignment
            const assignmentStudents = faker.helpers.arrayElements(
                students,
                faker.number.int({ min: 1, max: 5 })
            );
            for (const student of assignmentStudents) {
                // Create assignment progress entry
                const progressId = await createAssignmentProgress(student._id as Types.ObjectId, assignment._id, tasks);
                // Create submissions
                const { submissions, answers } = await createSubmissions(
                    users,
                    assignment._id,
                    tasks,
                    progressId
                );
                parentData.submissions.push(...submissions);
                parentData.answers.push(...answers);
            }
        }
    }
    return parentData;
}

async function createModuleAssignments(modules: IModuleDb[], users: IUserDb[]) {
    const assignmentsData = {
        assignments: [] as IAssignmentDb[],
        tasks: [] as ITaskDb[],
        submissions: [] as ITaskSubmissionDb[],
        answers: [] as IAnswerDb[]
    };

    for (const module of modules) {
        const assignmentsCount = faker.number.int({ min: 2, max: 5 });
        const parentData = await createAssignmentsForParent(assignmentsCount, module._id!, ParentType.MODULE, users);
        // Accumulate data
        assignmentsData.assignments.push(...parentData.assignments);
        assignmentsData.tasks.push(...parentData.tasks);
        assignmentsData.submissions.push(...parentData.submissions);
        assignmentsData.answers.push(...parentData.answers);
        // Update module to include these assignments
        const assignmentIds = parentData.assignments.map(a => a._id);
        if (assignmentIds.length > 0) {
            await Module.updateOne(
                { _id: module._id },
                { $push: { assignmentIds: { $each: assignmentIds } } }
            );
        }
    }
    console.log(`Created: ${assignmentsData.assignments.length} assignments, ${assignmentsData.tasks.length} tasks, ${assignmentsData.submissions.length} submissions, ${assignmentsData.answers.length} answers`);
    return assignmentsData;
}

async function createLessonAssignments(modules: IModuleDb[], users: IUserDb[]) {
    const assignmentsData = {
        assignments: [] as IAssignmentDb[],
        tasks: [] as ITaskDb[],
        submissions: [] as ITaskSubmissionDb[],
        answers: [] as IAnswerDb[]
    };

    for (const module of modules) {
        for (const lesson of module.lessons) {
            const assignmentsCount = faker.number.int({ min: 1, max: 3 });
            const parentData = await createAssignmentsForParent(assignmentsCount, lesson._id, ParentType.LESSON, users);
            // Accumulate data
            assignmentsData.assignments.push(...parentData.assignments);
            assignmentsData.tasks.push(...parentData.tasks);
            assignmentsData.submissions.push(...parentData.submissions);
            assignmentsData.answers.push(...parentData.answers);
            // Update lesson to include these assignments
            const assignmentIds = parentData.assignments.map(a => a._id);
            if (assignmentIds.length > 0) {
                await Module.updateOne(
                    { _id: module._id, 'lessons._id': lesson._id },
                    { $push: { 'lessons.$.assignmentIds': { $each: assignmentIds } } }
                );
            }
        }
    }
    console.log(`Created: ${assignmentsData.assignments.length} assignments, ${assignmentsData.tasks.length} tasks, ${assignmentsData.submissions.length} submissions, ${assignmentsData.answers.length} answers`);
    return assignmentsData;
}

async function createSubmissions(
    users: IUserDb[],
    assignmentId: Types.ObjectId,
    tasks: ITaskDb[],
    assignmentProgressId: Types.ObjectId
): Promise<{ submissions: ITaskSubmissionDb[], answers: IAnswerDb[] }> {
    const submissions: ITaskSubmissionDb[] = [];
    const answers: IAnswerDb[] = [];

    const student = faker.helpers.arrayElement(
        users.filter(user => user.roles.some(r => r.name === Roles.STUDENT))
    );
    const professor = faker.helpers.arrayElement(
        users.filter(user => user.roles.some(r => r.name === Roles.PROFESSOR))
    );

    // Create submissions for some tasks (not all)
    const tasksToSubmit = faker.helpers.arrayElements(tasks, faker.number.int({ min: 1, max: tasks.length }));

    for (const task of tasksToSubmit) {
        const timeSpent = faker.number.int({ min: 300, max: 3600 });
        const attemptNumber = faker.number.int({ min: 1, max: 3 });
        const submittedAt = faker.date.recent();
        const status = SubmissionStatus.SUBMITTED;
        const score = faker.number.int({ min: 0, max: 100 });

        // Common submission fields based on the schema
        const submissionBaseData = {
            userId: student._id,                     // Types.ObjectId
            assignmentId: assignmentId,                    // Types.ObjectId
            taskId: task._id,                        // Types.ObjectId
            taskType: taskTypeTOSubmissionType(task.taskType), // enum value
            version: 1,                               // required number
            currentState: {
                status: status as SubmissionStatus,    // enum value
                attemptNumber: attemptNumber,                 // number
                submittedAt: submittedAt,                   // Date
                content: {}                             // <-- put your actual content here
            },

            grade: {
                status: faker.helpers.arrayElement(Object.values(GradingStatus)),
                gradedBy: professor._id,
                gradedAt: faker.date.future({ years: 1, refDate: submittedAt }),
                score: score,
                feedback: faker.lorem.paragraph()
            } as IGradeDb,

            history: [
                {
                    submittedAt: submittedAt,
                    content: {},                         // <-- same content as currentState
                    attemptNumber: attemptNumber
                }
            ]
        };

        let submissionEntity;

        switch (task.taskType) {
            case TaskTypeEnum.QUIZ: {
                const quizTask = task as IQuizTaskDb;
                const quizAnswers = quizTask.content.questions.map(q =>
                    createAnswer(q, task._id!)
                );
                answers.push(...quizAnswers);

                const quiz = new QuizSubmission();
                Object.assign(quiz, submissionBaseData, {
                    answers: quizAnswers,                     // **entity** objects
                    currentState: { ...submissionBaseData.currentState, content: { answers: quizAnswers.map(a => a._id) } },
                    history: [{ ...submissionBaseData.history[0], content: { answers: quizAnswers.map(a => a._id) } }]
                });
                submissionEntity = quiz;
                break;
            }
            case TaskTypeEnum.QUESTION: {
                const questionTask = task as IQuestionTaskDb;
                const answer = createAnswer(questionTask.content, task._id!);
                answers.push(answer);

                const question = new QuestionSubmission();
                Object.assign(question, submissionBaseData, {
                    answer,                                   // **entity** object
                    currentState: { ...submissionBaseData.currentState, content: { answer: answer._id } },
                    history: [{ ...submissionBaseData.history[0], content: { answer: answer._id } }]
                });
                submissionEntity = question;
                break;
            }

            /* ------------------ FILE UPLOAD ----------------- */
            case TaskTypeEnum.FILE_UPLOAD: {
                const fileUrls = Array(faker.number.int({ min: 1, max: 3 }))
                    .fill(null)
                    .map(() => faker.internet.url());

                const file = new FileUploadSubmission();
                Object.assign(file, submissionBaseData, {
                    fileUrls,
                    currentState: { ...submissionBaseData.currentState, content: { fileUrls } },
                    history: [{ ...submissionBaseData.history[0], content: { fileUrls } }]
                });
                submissionEntity = file;
                break;
            }

            /* --------------------- CODE --------------------- */
            case TaskTypeEnum.CODE: {
                const codeTask = task as ICodeTaskDb;
                const code = faker.lorem.lines();

                const testResults = codeTask.content.testCases.map(tc => ({
                    testCaseId: new Types.ObjectId().toString(),
                    passed: faker.datatype.boolean(),
                    output: faker.lorem.sentence(),
                    error: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
                    executionTime: faker.number.int({ min: 10, max: 1000 })
                }));

                const codeSub = new CodeSubmission();
                Object.assign(codeSub, submissionBaseData, {
                    code,
                    testResults,
                    currentState: { ...submissionBaseData.currentState, content: { code, testResults } },
                    history: [{ ...submissionBaseData.history[0], content: { code, testResults } }]
                });
                submissionEntity = codeSub;
                break;
            }

            default:
                throw new Error(`Unsupported task type: ${task}`);
        }

        submissions.push(submissionEntity);

        // Update the assignment progress with this submission
        await AssignmentProgress.updateOne(
            { _id: assignmentProgressId, 'tasksProgress.taskId': task._id },
            {
                $set: {
                    'tasksProgress.$.status': status,
                    'tasksProgress.$.attempts': attemptNumber,
                    'tasksProgress.$.bestScore': score,
                    'tasksProgress.$.lastAttemptAt': submittedAt,
                    'tasksProgress.$.timeSpent': timeSpent,
                    'lastActivityAt': submittedAt
                },
                $inc: {
                    'metrics.totalTasksAttempted': 1,
                    'metrics.totalTimeSpent': timeSpent
                }
            }
        );
    }

    // Update metrics
    const progress = await AssignmentProgress.findById(assignmentProgressId);
    if (progress) {
        const completedTasks = progress.tasksProgress.filter(t => t.status === SubmissionStatus.SUBMITTED);
        const avgAttempts = completedTasks.reduce((sum, t) => sum + t.attempts, 0) / completedTasks.length || 0;
        const avgTime = completedTasks.reduce((sum, t) => sum + t.timeSpent, 0) / completedTasks.length || 0;

        progress.metrics.totalTasksCompleted = completedTasks.length;
        progress.metrics.averageAttemptsPerTask = avgAttempts;
        progress.metrics.averageTimePerTask = avgTime;
        await progress.save();
    }

    // Save all submissions and answers
    if (submissions.length > 0) {
        await BaseTaskSubmission.insertMany(submissions);
    }

    if (answers.length > 0) {
        //await BaseAnswer.insertMany(answers);
    }

    return { submissions, answers };
}

async function createAssignmentProgress(
    userId: Types.ObjectId,
    assignmentId: Types.ObjectId,
    tasks: ITaskDb[]
): Promise<Types.ObjectId> {
    const assignmentProgress = await AssignmentProgress.create({
        userId,
        assignmentId,
        status: ProgressTypeEnum.IN_PROGRESS,
        startedAt: faker.date.recent(),
        lastActivityAt: faker.date.recent(),
        tasksProgress: tasks.map(task => ({
            taskId: task._id,
            status: SubmissionStatus.NOT_SUBMITTED,
            attempts: 0,
            timeSpent: 0
        })),
        metrics: {
            totalTasksAttempted: 0,
            totalTasksCompleted: 0,
            averageAttemptsPerTask: 0,
            averageTimePerTask: 0,
            totalTimeSpent: 0
        }
    });

    return assignmentProgress._id;
}

async function createTasks(assignmentId: Types.ObjectId): Promise<ITaskDb[]> {
    const tasks: ITaskDb[] = [];
    const tasksCount = faker.number.int({ min: 2, max: 5 });

    for (let j = 0; j < tasksCount; j++) {
        const taskType = faker.helpers.arrayElement(Object.values(TaskTypeEnum));

        const baseTaskData: IBaseTaskDb = {
            title: faker.lorem.sentence(),
            description: faker.lorem.paragraph(),
            taskType,
            points: faker.number.int({ min: 1, max: 10 }),
            order: j + 1,
            xpReward: faker.number.int({ min: 10, max: 50 }),
            requiredForCompletion: faker.datatype.boolean(),
            assignmentId,
            prerequisites: [],
            maxAttempts: faker.number.int({ min: 1, max: 3 }),
            submissionWindow: {
                start: faker.date.future(),
                end: faker.date.future(),
                allowLateSubmissions: false,
                lateSubmissionPenalty: 0.1  // percentage
            }
        };

        let task: ITaskDb;

        switch (taskType) {
            case TaskTypeEnum.QUIZ: {
                const questions = Array(3).fill(null).map(() => {
                    const questionType = faker.helpers.arrayElement(Object.values(QuestionType));
                    return createQuestionContent(questionType);
                });

                task = {
                    ...baseTaskData,
                    taskType: TaskTypeEnum.QUIZ,
                    content: {
                        questions,
                        timeLimit: faker.number.int({ min: 15, max: 60 }),
                        passingScore: faker.number.int({ min: 60, max: 100 }),
                        maxAttempts: faker.number.int({ min: 1, max: 3 })
                    }
                } as IQuizTaskDb;
                break;
            }
            case TaskTypeEnum.QUESTION: {
                const questionType = faker.helpers.arrayElement(Object.values(QuestionType));
                const questionContent = createQuestionContent(questionType);

                task = {
                    ...baseTaskData,
                    taskType: TaskTypeEnum.QUESTION,
                    content: questionContent
                } as IQuestionTaskDb;
                break;
            }
            case TaskTypeEnum.FILE_UPLOAD: {
                task = {
                    ...baseTaskData,
                    taskType: TaskTypeEnum.FILE_UPLOAD,
                    content: {
                        allowedFileTypes: ['pdf', 'doc', 'docx'],
                        maxFileSize: faker.number.int({ min: 1, max: 10 }) * 1024 * 1024
                    }
                } as IFileUploadTaskDb;
                break;
            }
            case TaskTypeEnum.CODE: {
                task = {
                    ...baseTaskData,
                    taskType: TaskTypeEnum.CODE,
                    content: {
                        question: faker.lorem.paragraph(),
                        language: faker.helpers.arrayElement(['javascript', 'python', 'java']),
                        initialCode: faker.lorem.lines(),
                        testCases: Array(3).fill(null).map(() => ({
                            input: faker.lorem.sentence(),
                            expectedOutput: faker.lorem.sentence(),
                            isHidden: faker.datatype.boolean()
                        }))
                    }
                } as ICodeTaskDb;
                break;
            }
            default:
                throw new Error(`Unsupported task type: ${taskType}`);
        }

        tasks.push(task);
    }

    // Save tasks to the database
    const mongooseDocs = await BaseTask.insertMany(tasks);
    const savedTasks: ITaskDb[] = mongooseDocs.map(doc => doc.toObject());
    return savedTasks;
}

function createAnswer(question: IQuestionDb, taskId: Types.ObjectId): IAnswerDb {
    const baseAnswer = {
        _id: new Types.ObjectId(),
        taskId,
        questionId: question._id,
        submittedAt: faker.date.recent(),
        isCorrect: faker.datatype.boolean(),
        score: faker.number.int({ min: 0, max: 100 })
    };

    switch (question.questionType) {
        case QuestionType.MULTI_CHOICE: {
            const multiChoiceQuestion = question as IMultiChoiceQuestionDb;
            // Select at least one option
            const selectedOptions = faker.helpers.arrayElements(
                multiChoiceQuestion.options.map(o => o._id.toString()),
                faker.number.int({ min: 1, max: multiChoiceQuestion.options.length })
            );

            return {
                ...baseAnswer,
                questionType: QuestionType.MULTI_CHOICE,
                selectedOptionIds: selectedOptions
            } as IMultiChoiceAnswerDb;
        }
        case QuestionType.TRUE_FALSE:
            return {
                ...baseAnswer,
                questionType: QuestionType.TRUE_FALSE,
                answer: faker.datatype.boolean()
            } as ITrueFalseAnswerDb;
        case QuestionType.TEXT:
            return {
                ...baseAnswer,
                questionType: QuestionType.TEXT,
                answer: faker.lorem.sentence(),
                matchedKeywords: faker.helpers.arrayElements(
                    faker.lorem.words(5).split(' ')
                )
            } as ITextAnswerDb;
        default:
            throw new Error(`Unsupported question type for answer`);
    }
}

function createQuestionContent(questionType: QuestionType): IQuestionDb {
    switch (questionType) {
        case QuestionType.MULTI_CHOICE: {
            // Generate options with at least one correct answer
            const options = Array(4).fill(null).map((_, index) => ({
                text: faker.lorem.sentence(),
                isCorrect: index === 0 ? true : faker.datatype.boolean(),
                _id: new Types.ObjectId()
            }));

            return {
                _id: new Types.ObjectId(),
                question: faker.lorem.sentence(),
                questionType: QuestionType.MULTI_CHOICE,
                options
            } as IMultiChoiceQuestionDb;
        }
        case QuestionType.TRUE_FALSE:
            return {
                _id: new Types.ObjectId(),
                question: faker.lorem.sentence(),
                questionType: QuestionType.TRUE_FALSE,
                correctAnswer: faker.datatype.boolean()
            } as ITrueFalseQuestionDb;
        case QuestionType.TEXT:
            return {
                _id: new Types.ObjectId(),
                question: faker.lorem.sentence(),
                questionType: QuestionType.TEXT,
                correctAnswer: faker.lorem.sentence()
            } as ITextQuestionDb;
        default:
            throw new Error(`Unsupported question type: ${questionType}`);
    }
}

function taskTypeTOSubmissionType(taskType: TaskTypeEnum): SubmissionTypeEnum {
    switch (taskType) {
        case TaskTypeEnum.QUIZ:
            return SubmissionTypeEnum.QUIZ_SUBMISSION;
        case TaskTypeEnum.CODE:
            return SubmissionTypeEnum.CODE_SUBMISSION;
        case TaskTypeEnum.FILE_UPLOAD:
            return SubmissionTypeEnum.FILE_UPLOAD_SUBMISSION;
        case TaskTypeEnum.QUESTION:
            return SubmissionTypeEnum.QUESTION_SUBMISSION;
        default:
            throw new Error(`Unsupported task type: ${taskType}`);
    }
}
