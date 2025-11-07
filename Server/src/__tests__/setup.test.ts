// src/__tests__/setup.test.ts
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

jest.setTimeout(60000); // replica set startup can take time

describe('Test Database Setup', () => {
    let replSet: MongoMemoryReplSet;

    beforeAll(async () => {
        replSet = await MongoMemoryReplSet.create({ 
            replSet: { count: 1 }
        });
        await mongoose.connect(replSet.getUri());
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await replSet.stop();
    });

    it('should have a working replica set with transaction support', async () => {
        // Check connection is alive
        expect(mongoose.connection.readyState).toBe(1);

        // Verify replica set status
        const admin = mongoose.connection.db.admin();
        const replStatus = await admin.command({ replSetGetStatus: 1 });
        expect(replStatus.ok).toBe(1);

        // Test transaction support
        const session = await mongoose.startSession();
        let transactionWorked = false;

        await session.withTransaction(async () => {
            const TestModel = mongoose.model('Test', new mongoose.Schema({ name: String }));
            await TestModel.create([{ name: 'test' }], { session });
            const doc = await TestModel.findOne({ name: 'test' }, null, { session });
            expect(doc).toBeTruthy();
            transactionWorked = true;
        });

        expect(transactionWorked).toBe(true);
        await session.endSession();
    });
});