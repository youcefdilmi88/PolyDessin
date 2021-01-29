import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DrawingData } from '@common/communication/drawing-data';
import { DrawingEmailData } from '@common/communication/drawing-email-data';
import { ExportFormat } from '@common/communication/export-format';
import { DatabaseService } from './database.service';

const ID_STUB = 1234;
describe('DatabaseService', () => {
    let service: DatabaseService;
    let httpMock: HttpTestingController;
    let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(DatabaseService);
        httpMock = TestBed.inject(HttpTestingController);
        // tslint:disable-next-line: no-string-literal
        baseUrl = service['BASE_URL'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(httpMock).toBeTruthy();
    });

    it('basicSendByEmail() should send correct data to correct url', () => {
        const drawingDataStub: DrawingData = {
            id: ID_STUB,
            title: 'titleStub',
            tags: [],
            imageData: 'DataStringStub',
            exportFormat: ExportFormat.PNG,
        };
        const sentData: DrawingEmailData = { data: drawingDataStub, email: 'emailStub' };

        // tslint:disable-next-line: no-empty
        service.basicSendByEmail(sentData).subscribe(() => {}, fail);
        const req = httpMock.expectOne(baseUrl + '/send');
        expect(req.request.method).toBe('POST');
        // actually send the request
        req.flush(sentData);
    });
});
