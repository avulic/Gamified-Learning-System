import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import User, { IUserDb } from '../models/User';
import Role, { IRoleDb } from '../models/Role';
import Course, { ICourseDb } from '../models/Course';
import Module, { IModuleDb } from '../models/Module';
import Assignment, { IAssignmentDb } from '../models/Assignment';
import { BaseTask, IBaseTask, IBaseTaskDb } from '../models/app/Task/BaseTask';
import Submission from '../models/Submission';
import UserProgress from '../models/app/Progress/UserProgress';
import CourseProgress from '../models/app/Progress/CourseProgress';
import ModuleProgress from '../models/app/Progress/ModuleProgress';
import LessonProgress from '../models/app/Progress/LessonProgress';
import AssignmentProgress from '../models/app/Progress/AssignmentProgress';
import TaskProgress from '../models/app/Progress/TaskProgress';
import { TaskTypeEnum, Roles, QuestionType, ProgressTypeEnum } from '../models/enums';
import mongooseDb from '../adapters/mongooseDb';
import startServer from '../server';

async function seed() {
    try {
        await mongooseDb();

        await Promise.all([
            Role.deleteMany({}),
            User.deleteMany({}),
            Course.deleteMany({}),
            Module.deleteMany({}),
            Assignment.deleteMany({}),
            BaseTask.deleteMany({}),
            Submission.deleteMany({}),
            UserProgress.deleteMany({}),
            CourseProgress.deleteMany({}),
            ModuleProgress.deleteMany({}),
            LessonProgress.deleteMany({}),
            AssignmentProgress.deleteMany({}),
            TaskProgress.deleteMany({}),
        ]);

        const roles = await seedRoles();
        const users = await seedUsers(roles);
        const courses = await seedCourses(users);
        const modules = await seedModules(courses);
        const assignments = await seedAssignments(modules);
        const tasks = await seedTasks(assignments);
        await seedSubmissions(users, tasks);
        await seedProgress(users, courses, modules, assignments, tasks);

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

async function seedUsers(roles: IRoleDb[]) {
    const users = [];
    for (let i = 0; i < 50; i++) {
        const user = new User({
            name: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            username: faker.internet.userName(),
            password: await bcrypt.hash('password123', 10),
            roles: [roles[Math.floor(Math.random() * roles.length)]._id],
        });
        users.push(user);
    }
    await User.insertMany(users);
    console.log(`${users.length} users created`);
    return users as IUserDb[];
}

async function seedCourses(users: IUserDb[]) {
    const courses = [];
    for (let i = 0; i < 10; i++) {
        const course = new Course({
            title: faker.lorem.words(3),
            description: faker.lorem.paragraph(),
            instructors: [users[Math.floor(Math.random() * users.length)]._id],
            enrolledStudents: users.slice(0, 20).map(user => user._id),
            startDate: faker.date.past(),
            endDate: faker.date.future(),
            isPublished: faker.datatype.boolean(),
        });
        courses.push(course);
    }
    await Course.insertMany(courses);
    console.log(`${courses.length} courses created`);
    return courses;
}

async function seedModules(courses: ICourseDb[]) {
    const modules = [];
    for (const course of courses) {
        for (let i = 0; i < 5; i++) {
            const module = new Module({
                courseId: course._id,
                title: faker.lorem.words(2),
                description: faker.lorem.sentence(),
                order: i + 1,
            });
            modules.push(module);
        }
    }
    await Module.insertMany(modules);
    console.log(`${modules.length} modules created`);
    return modules;
}

async function seedAssignments(modules: IModuleDb[]) {
    const assignments = [];
    for (const module of modules) {
        for (let i = 0; i < 3; i++) {
            const assignment = new Assignment({
                moduleId: module._id,
                title: faker.lorem.words(2),
                description: faker.lorem.paragraph(),
                dueDate: faker.date.future(),
                totalPoints: faker.number.int({ min: 10, max: 100 }),
            });
            assignments.push(assignment);
        }
    }
    await Assignment.insertMany(assignments);
    console.log(`${assignments.length} assignments created`);
    return assignments;
}

async function seedTasks(assignments: IAssignmentDb[]) {
    const tasks = [];
    for (const assignment of assignments) {
        for (let i = 0; i < 5; i++) {
            const task = new BaseTask({
                assignmentId: assignment._id,
                title: faker.lorem.words(2),
                description: faker.lorem.sentence(),
                taskType: faker.helpers.arrayElement(Object.values(TaskTypeEnum)),
                status: faker.helpers.arrayElement(Object.values(ProgressTypeEnum)),
                dueDate: faker.date.future(),
                xpReward: faker.number.int({ min: 5, max: 50 }),
                requiredForCompletion: faker.datatype.boolean(),
            });
            tasks.push(task);
        }
    }
    await BaseTask.insertMany(tasks);
    console.log(`${tasks.length} tasks created`);
    return tasks;
}

async function seedSubmissions(users: IUserDb[], tasks: IBaseTaskDb[]) {
    const submissions = [];
    for (const task of tasks) {
        for (let i = 0; i < 10; i++) {
            const submission = new Submission({
                userId: users[Math.floor(Math.random() * users.length)]._id,
                assignmentId: task.assignmentId,
                taskId: task._id,
                content: faker.lorem.paragraph(),
                submissionType: faker.helpers.arrayElement(['text', 'file', 'link']),
                status: faker.helpers.arrayElement(['pending', 'submitted', 'graded']),
                submittedAt: faker.date.past(),
                grade: faker.number.int({ min: 0, max: 100 }),
                feedback: faker.lorem.sentence(),
                attempts: faker.number.int({ min: 1, max: 3 }),
            });
            submissions.push(submission);
        }
    }
    await Submission.insertMany(submissions);
    console.log(`${submissions.length} submissions created`);
}

async function seedProgress(users: IUserDb[], courses: ICourseDb[], modules: IModuleDb[], assignments: IAssignmentDb[], tasks: IBaseTaskDb[]) {
    try{
        for (const user of users) {
            const userProgress = new UserProgress({
                userId: user.id,
                courseProgresses: [],
                totalXpEarned: 0,
                level: 1,
                lastUpdated: new Date(),
                version: 1
            });
            await userProgress.save();
    
            for (const course of courses) {
                const courseProgress = new CourseProgress({
                    userId: user.id,
                    courseId: course.id,
                    moduleProgresses: [],
                    overallProgress: 0,
                    totalXpEarned: 0,
                    completed: false,
                    lastAccessedAt: faker.date.recent(),
                    version: 1
                });
                await courseProgress.save();
    
                userProgress.courseProgresses.push(courseProgress.id);
    
                const courseModules = modules.filter(m => m.courseId === course.id);
                for (const module of courseModules) {
                    const moduleProgress = new ModuleProgress({
                        userId: user.id,
                        courseId: course.id,
                        moduleId: module.id,
                        assignmentProgresses: [],
                        completed: false,
                        xpEarned: 0,
                        version: 1
                    });
                    await moduleProgress.save();
    
                    courseProgress.moduleProgresses.push(moduleProgress.id);
    
                    const moduleAssignments = assignments.filter(a => a.moduleId === module.id);
                    for (const assignment of moduleAssignments) {
                        const assignmentProgress = new AssignmentProgress({
                            userId: user.id,
                            assignmentId: assignment.id,
                            moduleId: module.id,
                            taskProgresses: [],
                            status: faker.helpers.arrayElement(Object.values(ProgressTypeEnum)),
                            xpEarned: 0,
                            completed: false,
                            version: 1
                        });
                        await assignmentProgress.save();
    
                        moduleProgress.assignmentProgresses.push(assignmentProgress.id);
    
                        const assignmentTasks = tasks.filter(t => t.assignmentId === assignment.id);
                        for (const task of assignmentTasks) {
                            const taskProgress = new TaskProgress({
                                userId: user.id,
                                taskId: task.id,
                                assignmentId: assignment.id,
                                status: faker.helpers.arrayElement(Object.values(ProgressTypeEnum)),
                                xpEarned: faker.number.int({ min: 0, max: task.xpReward }),
                                completedAt: faker.date.recent(),
                                version: 1
                            });
                            await taskProgress.save();
    
                            assignmentProgress.taskProgresses.push(taskProgress.id);
                        }
    
                        await assignmentProgress.save();
                    }
    
                    await moduleProgress.save();
                }
    
                await courseProgress.save();
            }
    
            await userProgress.save();
        }
    console.log(`Progress records created for ${users.length} users`);

    }catch(e){
    console.log(`Error seeding progress`);
    }
}

seed();