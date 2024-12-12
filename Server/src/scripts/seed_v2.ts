import mongooseDb from '@/adapters/mongooseDb';
import { IMultiChoiceTaskDb, IFileUploadTaskDb, IQuestionTaskDb, IMultiChoiceAnswerDb, IFileUploadAnswerDb, IQuestionAnswerDb, IFileDb, IUserProgressDb, TaskProgressDb, UserProgressDb, ITaskProgressDb } from '@/models/db/mongo';
import Assignment, { IAssignmentDb } from '@/models/db/mongo/Assignment';
import Course, { ICourseDb } from '@/models/db/mongo/Course';
import Module, { IModuleDb } from '@/models/db/mongo/Module';
import { ActivityLog } from '@/models/db/mongo/Progress/ActivityLog';

import Role from '@/models/db/mongo/Role';
import Submission from '@/models/db/mongo/Submission';
import User, { IUserDb } from '@/models/db/mongo/User';
import { Roles, TaskTypeEnum, ProgressTypeEnum, QuestionType, SubmissionStatus } from '@/models/enums';
import { faker } from '@faker-js/faker';
import mongoose, { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IAssignment, ISubmission } from '@/models/app';
import File from '@/models/db/mongo/File';
import { SubmissionMapper } from '@/utils/ModelMapper';

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
            UserProgressDb.deleteMany({}),
            TaskProgressDb.deleteMany({}),

        ]);

        const roles = await seedRoles();
        const users = await seedUsers();
        const files = await generateFakeFile();
        const courses = await seedCourses(users);
        const modules = await seedModules(courses, files);
        const assignments = await seedAssignmentsAndSubmissions(modules, users);
        //await seedProgress(users, courses, modules, assignments);
        await seedProgressModels(users, courses, modules, assignments);
        
        console.log('Seed completed successfully');
    } catch (error) {
        console.error('Seed failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}



async function seedRoles() {
    const roles = await Role.create(
        Object.values(Roles).map(role => ({ name: role }))
    );
    console.log(`${roles.length} roles created`);
    return roles;
}

async function seedUsers() {
    const users = [];
    for (let i = 0; i < 50; i++) {
        const user = new User({
            name: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            username: faker.internet.userName(),
            password: await bcrypt.hash('password123', 10),
            roles: [faker.helpers.arrayElement(Object.values(Roles))],
            profilePicture: faker.image.avatar(),
            preferences: {
                notifications: faker.datatype.boolean(),
                theme: faker.helpers.arrayElement(['light', 'dark']),
                language: faker.helpers.arrayElement(['en', 'es', 'fr'])
            },
            enrolledCourses: []  // We'll populate this when seeding courses
        });
        users.push(user);
    }
    await User.insertMany(users);
    console.log(`${users.length} users created`);
    return users;
}

async function generateFakeFile(): Promise<IFileDb[]> {
    const fakeFiles: Partial<IFileDb>[] = [];

    for (let i = 0; i < 10; i++) {
        fakeFiles.push({
            filename: faker.system.fileName(),
            originalname: faker.system.fileName(),
            mimetype: faker.system.mimeType(),
            size: faker.number.int({ min: 1000, max: 1000000 }), // Size in bytes
            url: faker.internet.url(),
            uploadedBy: new Types.ObjectId(), // Assuming you want random user IDs
            uploadedAt: faker.date.recent(),
            version: 1
        });
    }
    const savedFiles = await File.insertMany(fakeFiles, { rawResult: false }) as IFileDb[];

    return savedFiles;
};


async function seedCourses(users: IUserDb[]) {
    const courses = [];
    for (let i = 0; i < 10; i++) {
        const instructors = faker.helpers.arrayElements(
            users.filter(user => user.roles.includes(Roles.Professor)),
            faker.number.int({ min: 1, max: 3 })
        );
        const enrolledStudents = faker.helpers.arrayElements(
            users.filter(user => user.roles.includes(Roles.Student)),
            faker.number.int({ min: 5, max: 30 })
        );

        const course = new Course({
            title: faker.lorem.words(3),
            description: faker.lorem.paragraph(),
            instructors: instructors.map(instructor => ({
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
            xpReward: faker.number.int({ min: 100, max: 1000 }),
            materials: faker.helpers.arrayElements(['textbook', 'video', 'slides', 'exercises'], faker.number.int({ min: 1, max: 4 }))
        });
        courses.push(course);

        // Update enrolled students
        for (const student of enrolledStudents) {
            student.enrolledCourses!.push({
                courseId: course._id,
                courseName: course.title,
                //enrollmentDate: faker.date.past(),
                //lastAccessed: faker.date.recent()
            });
            await student.save();
        }
    }
    await Course.insertMany(courses);
    console.log(`${courses.length} courses created`);
    return courses;
}

async function seedModules(courses: mongoose.Document[], files: IFileDb[]) {
    const modules = [];
    for (const course of courses) {
        for (let i = 0; i < 5; i++) {
            const module = new Module({
                courseId: course._id,
                title: faker.lorem.words(2),
                description: faker.lorem.sentence(),
                order: i + 1,
                xpReward: faker.number.int({ min: 50, max: 200 }),
                badgeReward: faker.helpers.arrayElement([null, 'Bronze', 'Silver', 'Gold']),
                learningObjectives: Array(3).fill(null).map(() => faker.lorem.sentence()),
                estimatedDuration: faker.number.int({ min: 30, max: 180 }),
                difficulty: faker.number.int({ min: 1, max: 5 }),
                tags: faker.helpers.arrayElements(['beginner', 'intermediate', 'advanced', 'theory', 'practical'], faker.number.int({ min: 1, max: 3 })),
                publishedAt: faker.date.past(),
                prerequisitesModulesId: [],
                lessons: Array(3).fill(null).map((_, index) => ({
                    title: faker.lorem.words(3),
                    content: faker.lorem.paragraphs(3),
                    order: index + 1
                })),
                files: files.map(file => ({
                    _id: file._id,
                    url: file.url,
                    version: file.version,
                    uploadedBy: file.uploadedBy
                }))
            });
            modules.push(module);
        }
    }
    await Module.insertMany(modules);
    console.log(`${modules.length} modules created`);
    return modules;
}

async function seedAssignmentsAndSubmissions(modules: IModuleDb[], users: IUserDb[]) {
    const assignments = [];
    const submissions = [];

    for (const module of modules) {
        const assignmentsCount = faker.number.int({ min: 2, max: 5 });

        for (let i = 0; i < assignmentsCount; i++) {
            const assignment = new Assignment({
                courseId: module.courseId,
                moduleId: module._id,
                createdBy: users[0]._id,
                title: faker.lorem.sentence(),
                description: faker.lorem.paragraph(),
                dueDate: faker.date.future(),
                totalPoints: faker.number.int({ min: 10, max: 100 }),
                assignmentType: faker.helpers.arrayElement(['homework', 'quiz', 'project']),
                tasks: [],
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
                }
            });

            const tasksCount = faker.number.int({ min: 2, max: 5 });
            for (let j = 0; j < tasksCount; j++) {
                const taskType = faker.helpers.arrayElement(Object.values(TaskTypeEnum));
                let task;

                const baseTaskData = {
                    title: faker.lorem.sentence(),
                    description: faker.lorem.paragraph(),
                    taskType,
                    status: ProgressTypeEnum.NOT_STARTED,
                    points: faker.number.int({ min: 1, max: 10 }),
                    order: j + 1,
                    taskIndex: j + 1,
                    xpReward: faker.number.int({ min: 10, max: 50 }),
                    requiredForCompletion: faker.datatype.boolean()
                };

                switch (taskType) {
                    case TaskTypeEnum.MULTI_CHOICE:
                        task = {
                            ...baseTaskData,
                            content: {
                                question: faker.lorem.sentence(),
                                options: Array(4).fill(null).map(() => ({
                                    text: faker.lorem.sentence(),
                                    isCorrect: faker.datatype.boolean()
                                }))
                            }
                        } as IMultiChoiceTaskDb;
                        break;
                    case TaskTypeEnum.FILE_UPLOAD:
                        task = {
                            ...baseTaskData,
                            content: {
                                allowedFileTypes: ['pdf', 'doc', 'docx'],
                                maxFileSize: faker.number.int({ min: 1, max: 10 }) * 1024 * 1024, // 1-10 MB
                                //files: IFileDb[]
                            }
                        } as IFileUploadTaskDb;
                        break;
                    case TaskTypeEnum.QUESTION:
                        task = {
                            ...baseTaskData,
                            content: {
                                questionType: faker.helpers.arrayElement(Object.values(QuestionType)),
                                question: faker.lorem.sentence(),
                                correctAnswer: faker.lorem.sentence()
                            }
                        } as IQuestionTaskDb;
                        break;
                }

                assignment.tasks.push(task!);
            }

            assignments.push(assignment);
            submissions.push(await makeSubmissions(assignment));
        }
    }

    await Assignment.insertMany(assignments);
    await Submission.insertMany(submissions);
    console.log(`${assignments.length} assignments and ${submissions.length} submissions created`);
    return assignments;
}

async function makeSubmissions(assignment: IAssignmentDb) {
    const user = await User.findOne();
    const professor = await User.findOne({ roles: Roles.Professor });

    const submission = new Submission({
        userId: user?._id,
        assignmentId: assignment._id,
        status: faker.helpers.arrayElement(Object.values(SubmissionStatus)),
        submittedAt: faker.date.past(),
        lastUpdatedAt: faker.date.recent(),
        attemptNumber: faker.number.int({ min: 1, max: 3 }),
        timeSpent: faker.number.int({ min: 600, max: 3600 }),
        isLate: faker.datatype.boolean(),
        isPartial: faker.datatype.boolean(),
        answers: [],
        grade: faker.number.int({ min: 0, max: assignment.totalPoints }),
        gradedBy: professor?._id,
        gradedAt: faker.date.recent(),
        peerReviews: Array(2).fill(null).map(() => ({
            reviewerId: professor?._id,
            score: faker.number.int({ min: 1, max: 5 }),
            comments: faker.lorem.sentence()
        })),
        plagiarismScore: faker.number.float({ min: 0, max: 1 })
    });

    for (const task of assignment.tasks) {
        let answer;
        const baseAnswerData = {
            taskIndex: task.order,
            answerType: task.taskType,
            status: ProgressTypeEnum.COMPLETED,
            score: faker.number.int({ min: 0, max: task.points }),
            feedback: faker.lorem.sentence(),
            answerIndex: task.order
        };

        switch (task.taskType) {
            case TaskTypeEnum.MULTI_CHOICE:
                answer = {
                    ...baseAnswerData,
                    selectedOptions: (task as IMultiChoiceTaskDb).content.options
                        .filter(() => faker.datatype.boolean())
                        .map(option => option.text)
                } as IMultiChoiceAnswerDb;
                break;
            case TaskTypeEnum.FILE_UPLOAD:
                answer = {
                    ...baseAnswerData,
                    filesId: [new mongoose.Types.ObjectId()]
                } as IFileUploadAnswerDb;
                break;
            case TaskTypeEnum.QUESTION:
                answer = {
                    ...baseAnswerData,
                    response: faker.lorem.paragraph()
                } as IQuestionAnswerDb;
                break;
        }

        submission.answers.push(answer!);
    }

    return submission;
}

// async function seedProgress(users: IUserDb[], courses: ICourseDb[], modules: IModuleDb[], assignments: IAssignmentDb[]) {
//     for (const user of users) {
//         // Create UserProgress
//         const userProgress = await UserProgress.create({
//             user: user._id,
//             courseProgresses: [],
//             totalXpEarned: faker.number.int({ min: 0, max: 1000 }),
//             level: faker.number.int({ min: 1, max: 10 }),
//             lastUpdated: faker.date.recent()
//         });

//         // Create CourseProgress for each course
//         for (const course of courses) {
//             const courseModules = modules.filter(m => m.courseId.equals(course._id));
//             const courseAssignments = assignments.filter(a => courseModules.some(m => m._id.equals(a.moduleId)));

//             const courseProgress = await CourseProgress.create({
//                 user: user._id,
//                 course: course._id,
//                 moduleProgresses: courseModules.map(module => ({
//                     module: module._id,
//                     completed: faker.datatype.boolean(),
//                     xpEarned: faker.number.int({ min: 0, max: module.xpReward }),
//                 })),
//                 assignmentProgress: courseAssignments.map(assignment => ({
//                     assignment: assignment._id,
//                     completed: faker.datatype.boolean(),
//                     score: faker.number.int({ min: 0, max: assignment.totalPoints }),
//                     tasksCompleted: faker.number.int({ min: 0, max: assignment.tasks.length }),
//                     totalTasks: assignment.tasks.length,
//                     lastAccessed: faker.date.recent(),
//                 })),
//                 overallProgress: faker.number.int({ min: 0, max: 100 }),
//                 totalXpEarned: faker.number.int({ min: 0, max: 500 }),
//                 completed: faker.datatype.boolean(),
//                 lastAccessedAt: faker.date.recent(),
//             });

//             userProgress.coursesProgress.push(courseProgress._id);

//             // Create TaskProgress for each task in the course
//             for (const assignment of courseAssignments) {
//                 for (const task of assignment.tasks) {
//                     await TaskProgress.create({
//                         _id: new Types.ObjectId(),
//                         user: user._id,
//                         assignment: assignment._id,
//                         task: task.taskIndex,
//                         status: faker.helpers.arrayElement(Object.values(TaskStatus)),
//                         attempts: faker.number.int({ min: 0, max: 5 }),
//                         score: faker.number.int({ min: 0, max: task.points }),
//                         startedAt: faker.date.recent(),
//                         completedAt: faker.datatype.boolean() ? faker.date.recent() : undefined,
//                         timeSpent: faker.number.int({ min: 0, max: 3600 }),
//                         metadata: {},
//                     });
//                 }
//             }
//         }

//         await userProgress.save();

//         // Create ActivityLogs
//         const activityTypes = ['course_start', 'course_complete', 'assignment_submit', 'task_complete'];
//         for (let i = 0; i < 1; i++) {
//             const action = faker.helpers.arrayElement(activityTypes);
//             let entityKind, entityItem;

//             switch (action) {
//                 case 'course_start':
//                 case 'course_complete':
//                     entityKind = 'Course';
//                     entityItem = faker.helpers.arrayElement(courses)._id;
//                     break;
//                 case 'assignment_submit':
//                     entityKind = 'Assignment';
//                     entityItem = faker.helpers.arrayElement(assignments)._id;
//                     break;
//                     case 'task_complete':
//                         const randomAssignment = faker.helpers.arrayElement(assignments);
//                         const randomTask = faker.helpers.arrayElement(randomAssignment.tasks);
//                         entityKind = 'Task';
//                         entityItem = randomTask._id; // Assuming tasks have their own _id
//                         break;
//             }

//             await ActivityLog.create({
//                 user: user._id,
//                 action,
//                 entity: {
//                     kind: entityKind,
//                     item: entityItem,
//                 },
//                 metadata: {},
//                 timestamp: faker.date.recent(),
//             });
//         }
//     }
//     console.log(`Progress records created for ${users.length} users`);
// }


async function seedProgressModels(users: IUserDb[], courses: ICourseDb[], modules: IModuleDb[], assignments: IAssignmentDb[]) {
    const userProgressDocs: IUserProgressDb[] = [];
    const taskProgressDocs: ITaskProgressDb[] = [];

    for (const user of users) {
        for (const course of courses) {
            const userProgress = new UserProgressDb({
                userId: user._id,
                courseId: course._id,
                totalXP: faker.number.int({ min: 0, max: 10000 }),
                level: faker.number.int({ min: 1, max: 10 }),
                overallProgress: faker.number.float({ min: 0, max: 100, multipleOf: 0.01 }),
                courseProgress: [{
                    courseId: course._id.toString(),
                    userId: user._id.toString(),
                    totalXP: faker.number.int({ min: 0, max: 5000 }),
                    level: faker.number.int({ min: 1, max: 5 }),
                    overallProgress: faker.number.float({ min: 0, max: 100, multipleOf: 0.01 }),
                    moduleProgress: modules
                        .filter(module => module.courseId.equals(course._id))
                        .map(module => ({
                            moduleId: module._id,
                            completed: faker.datatype.boolean(),
                            earnedXP: faker.number.int({ min: 0, max: 1000 }),
                            progressPercentage: faker.number.float({ min: 0, max: 100, multipleOf: 0.01 }),
                            lessonProgress: module.lessons.map(lesson => ({
                                lessonId: new Types.ObjectId(lesson._id),
                                completed: faker.datatype.boolean(),
                                earnedXP: faker.number.int({ min: 0, max: 200 }),
                                progressPercentage: faker.number.float({ min: 0, max: 100, multipleOf: 0.01 }),
                                assignmentProgress: assignments
                                    .filter(assignment => assignment.moduleId.equals(module._id))
                                    .map(assignment => {
                                        const taskProgressIds: Types.ObjectId[] = [];
                                        assignment.tasks.forEach(task => {
                                            const taskProgress = new TaskProgressDb({
                                                userId: user._id,
                                                assignmentId: assignment._id,
                                                taskId: task._id,
                                                completed: faker.datatype.boolean(),
                                                earnedXP: faker.number.int({ min: 0, max: 50 })
                                            });
                                            taskProgressDocs.push(taskProgress);
                                            taskProgressIds.push(taskProgress._id);
                                        });

                                        return {
                                            assignmentId: assignment._id,
                                            submitted: faker.datatype.boolean(),
                                            submissionId: faker.datatype.boolean() ? new Types.ObjectId() : undefined,
                                            earnedXP: faker.number.int({ min: 0, max: 100 }),
                                            progressPercentage: faker.number.float({ min: 0, max: 100, multipleOf: 0.01 }),
                                            taskProgressIds: taskProgressIds
                                        };
                                    })
                            }))
                        }))
                }]
            });

            userProgressDocs.push(userProgress);
        }
    }

    await UserProgressDb.insertMany(userProgressDocs);
    await TaskProgressDb.insertMany(taskProgressDocs);

    console.log(`${userProgressDocs.length} user progress documents created`);
    console.log(`${taskProgressDocs.length} task progress documents created`);
}


