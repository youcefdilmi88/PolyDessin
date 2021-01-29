import { Application } from '@app/app';
import { DatabaseService } from '@app/services/database.service';
import { TYPES } from '@app/types';
import { DeleteStatus } from '@common/communication/delete-status';
import { DrawingMetaData } from '@common/communication/drawing-meta-data';
import { ExportFormat } from '@common/communication/export-format';
import { InsertionStatus } from '@common/communication/insertion-status';
import { expect } from 'chai';
import 'mocha';
import * as supertest from 'supertest';
import { Stubbed, testingContainer } from '../../test/test-utils';

// tslint:disable:no-any
const HTTP_STATUS_CREATED = 201;
const HTTP_STATUS_ERROR = 500;

describe('DatabaseController', () => {
    let databaseService: Stubbed<DatabaseService>;
    let app: Express.Application;
    let testDrawingMeta0: DrawingMetaData;
    let testDrawingMeta1: DrawingMetaData;
    const testDrawingMetas: DrawingMetaData[] = [];
    testDrawingMeta0 = { id: 0, title: 'test0', tags: ['tag0.0', 'tag0.1'], exportFormat: ExportFormat.JPG };
    testDrawingMeta1 = { id: 1, title: 'test1', tags: ['tag1.0', 'tag1.1', 'tag0.0'], exportFormat: ExportFormat.PNG };
    testDrawingMetas.push(testDrawingMeta0);
    testDrawingMetas.push(testDrawingMeta1);
    beforeEach(async () => {
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.DatabaseService).toConstantValue({
            getAllDrawings: sandbox.stub().resolves(testDrawingMetas),
            searchDrawings: sandbox.stub().resolves(testDrawingMetas),
            addDrawing: sandbox.stub().resolves(InsertionStatus.Inserted),
            deleteDrawing: sandbox.stub().resolves(DeleteStatus.Deleted),
            start: sandbox.stub().resolves(),
            closeConnection: sandbox.stub().resolves(),
        });
        databaseService = container.get(TYPES.DatabaseService);
        app = container.get<Application>(TYPES.Application).app;
    });

    it('post request to /save should respond a HTTP_STATUS_CREATED status code and an Inserted enum if drawing if inserted', async () => {
        return supertest(app)
            .post('/save')
            .expect(HTTP_STATUS_CREATED)
            .then((response: any) => {
                expect(response.body.body).to.deep.equal(InsertionStatus.Inserted);
            });
    });

    it('post request to /save should respond a HTTP_STATUS_ERROR status code and a NotInserted enum if drawing is not inserted', async () => {
        databaseService.addDrawing.resolves(InsertionStatus.NotInserted);
        return supertest(app)
            .post('/save')
            .expect(HTTP_STATUS_ERROR)
            .then((response: any) => {
                expect(response.body.body).to.deep.equal(InsertionStatus.NotInserted);
            });
    });

    it('post request to /save should respond a HTTP_STATUS_ERROR status code and a InvalidRequest enum if drawing format is not valid', async () => {
        databaseService.addDrawing.resolves(InsertionStatus.InvalidRequest);
        return supertest(app)
            .post('/save')
            .expect(HTTP_STATUS_ERROR)
            .then((response: any) => {
                expect(response.body.body).to.deep.equal(InsertionStatus.InvalidRequest);
            });
    });

    it('post request to /save should respond a HTTP_STATUS_ERROR status code and a DatabaseError enum if database request fails', async () => {
        databaseService.addDrawing.rejects();
        return supertest(app)
            .post('/save')
            .expect(HTTP_STATUS_ERROR)
            .then((response: any) => {
                expect(response.body.body).to.deep.equal(InsertionStatus.DatabaseError);
            });
    });
});
