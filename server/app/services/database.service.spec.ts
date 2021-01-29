import { DeleteStatus } from '@common/communication/delete-status';
import { DrawingMetaData } from '@common/communication/drawing-meta-data';
import { ExportFormat } from '@common/communication/export-format';
import { InsertionStatus } from '@common/communication/insertion-status';
import { expect } from 'chai';
import { describe } from 'mocha';
import { Db, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DatabaseService } from '../services/database.service';

describe('Database service', () => {
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;
    let db: Db;
    let client: MongoClient;
    let testDrawingMeta0: DrawingMetaData;
    let testDrawingMeta1: DrawingMetaData;
    const testDrawingMetas: DrawingMetaData[] = [];

    beforeEach(async () => {
        databaseService = new DatabaseService();

        // Start a local test server
        mongoServer = new MongoMemoryServer();
        const mongoUri = await mongoServer.getUri();
        client = await MongoClient.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // We use the local Mongo Instance and not the production database
        db = client.db(await mongoServer.getDbName());
        databaseService.collection = db.collection('test');

        testDrawingMeta0 = { id: 0, title: 'test0', tags: ['tag0.0', 'tag0.1'], exportFormat: ExportFormat.JPG };
        testDrawingMeta1 = { id: 1, title: 'test1', tags: ['tag1.0', 'tag1.1', 'tag0.0'], exportFormat: ExportFormat.PNG };
        testDrawingMetas.push(testDrawingMeta0);
        testDrawingMetas.push(testDrawingMeta1);
        databaseService.collection.insertOne(testDrawingMeta0);
        databaseService.collection.insertOne(testDrawingMeta1);
    });

    afterEach(async () => {
        client.close();
    });

    it('getAllDrawings() should return all drawings from DB', async () => {
        const drawingMetas = await databaseService.getAllDrawings();
        expect(drawingMetas.length).to.equal(2);
        expect(drawingMetas[0]).to.deep.equals(testDrawingMetas[0]);
        expect(drawingMetas[1]).to.deep.equals(testDrawingMetas[1]);
    });

    it('searchDrawings() should return specific drawings with valid tags', async () => {
        const testTags0: string[] = ['tag0.0'];
        const testTags1: string[] = ['tag0.1'];
        const drawingMetas0 = await databaseService.searchDrawings(testTags0);
        const drawingMetas1 = await databaseService.searchDrawings(testTags1);
        expect(drawingMetas0[0].id).to.deep.equals(testDrawingMetas[0].id);
        expect(drawingMetas0[1].id).to.deep.equals(testDrawingMetas[1].id);
        expect(drawingMetas1[0].id).to.deep.equals(testDrawingMetas[0].id);
    });

    it('searchDrawings() should return empty array with an non-existant tag', async () => {
        const testTags: string[] = ['tagStub', 'testTag'];
        const emptyDrawingMetas = await databaseService.searchDrawings(testTags);
        expect(emptyDrawingMetas).to.deep.equals([]);
    });

    it('searchDrawings() should return all drawings if no tag is specified', async () => {
        const testTag = undefined;
        // tslint:disable-next-line: no-any
        const drawingMetas = await databaseService.searchDrawings(testTag as any);
        expect(drawingMetas[0].id).to.deep.equals(testDrawingMetas[0].id);
        expect(drawingMetas[1].id).to.deep.equals(testDrawingMetas[1].id);
    });

    it('addDrawing() should insert a new Drawing in DB', async () => {
        const newDrawingMeta: DrawingMetaData = { id: 2, title: 'test2', tags: ['testTag'], exportFormat: ExportFormat.JPG };
        await databaseService.addDrawing(newDrawingMeta);
        const drawingMetas = await databaseService.collection.find({}).toArray();
        // tslint:disable-next-line: no-magic-numbers
        expect(drawingMetas.length).to.equal(3);
        expect(drawingMetas.find((x) => x.id === newDrawingMeta.id)).to.deep.equals(newDrawingMeta);
    });

    it('addDrawing() should return an Inserted enum if a new drawing is inserted in DB', async () => {
        const newDrawingMeta: DrawingMetaData = { id: 2, title: 'test2', tags: ['testTag'], exportFormat: ExportFormat.JPG };
        const status = await databaseService.addDrawing(newDrawingMeta);
        expect(status).to.equal(InsertionStatus.Inserted);
    });

    it('addDrawing() should not insert the new drawing if it has an invalid title and invalid tags', async () => {
        const newDrawingMeta: DrawingMetaData = {
            id: 3,
            title: 'MoreThan15CharactersTitle',
            tags: ['tag with spaces'],
            exportFormat: ExportFormat.JPG,
        };
        await databaseService.addDrawing(newDrawingMeta);
        const drawingMetas = await databaseService.collection.find({}).toArray();
        expect(drawingMetas.length).to.equal(2);
    });

    it('addDrawing() should return an InvalidRequest enum if the drawing has an invalid title and invalid tags', async () => {
        const newDrawingMeta: DrawingMetaData = {
            id: 3,
            title: 'MoreThan15CharactersTitle',
            tags: ['tag with spaces'],
            exportFormat: ExportFormat.JPG,
        };
        const status = await databaseService.addDrawing(newDrawingMeta);
        expect(status).to.equal(InsertionStatus.InvalidRequest);
    });

    it('deleteDrawing() should delete the drawing if a existing id is sent', async () => {
        await databaseService.deleteDrawing('0');
        const drawingMetas = await databaseService.collection.find({}).toArray();
        expect(drawingMetas.length).to.equal(1);
    });

    it('deleteDrawing() should return a Deleted enum if the drawing is deleted', async () => {
        const status = await databaseService.deleteDrawing('0');
        expect(status).to.equal(DeleteStatus.Deleted);
    });

    it('deleteDrawing() should not delete a drawing if an invalid id is sent', async () => {
        await databaseService.deleteDrawing('2');
        const drawingMetas = await databaseService.collection.find({}).toArray();
        expect(drawingMetas.length).to.equal(2);
    });

    it('deleteDrawing() should return a NothingFound enum if an invalid id is sent', async () => {
        const status = await databaseService.deleteDrawing('0');
        expect(status).to.equal(DeleteStatus.Deleted);
    });
});
