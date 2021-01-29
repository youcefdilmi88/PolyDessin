import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { canvasTestHelper } from '@classes/canvas-test-helper';
import { DrawingData } from '@common/communication/drawing-data';
import { DrawingEmailData } from '@common/communication/drawing-email-data';
import { ExportFormat } from '@common/communication/export-format';
import { SendResponse } from '@common/communication/send-response';
import { SendStatus } from '@common/communication/send-status';
import { ResponseMessageComponent } from '@components/response-message/response-message.component';
import { DatabaseService } from '@services/database/database.service';
import { DrawingService } from '@services/drawing/drawing.service';
import { of, throwError } from 'rxjs';
import { SendEmailComponent } from './send-email.component';
import SpyObj = jasmine.SpyObj;

const CANVAS_DIMENSION_STUB_100 = 100;
const CANVAS_DIMENSION_STUB_200 = 200;
const ID_STUB = 1234;
const HTTP_STATUS_ERROR = 500;

describe('SendEmailComponent', () => {
    let component: SendEmailComponent;
    let fixture: ComponentFixture<SendEmailComponent>;
    let drawingStub: DrawingService;
    let databaseServiceSpy: SpyObj<DatabaseService>;
    let matDialogSpy: SpyObj<MatDialog>;
    const sendResponseStub: SendResponse = {
        body: SendStatus.SentExported,
    };
    let matDialogRefSpy: SpyObj<MatDialogRef<SendEmailComponent>>;

    beforeEach(async(() => {
        drawingStub = new DrawingService();
        drawingStub.baseCtx = canvasTestHelper.baseCanvas.getContext('2d') as CanvasRenderingContext2D;
        databaseServiceSpy = jasmine.createSpyObj('DatabaseService', ['basicSendByEmail']);
        databaseServiceSpy.basicSendByEmail.and.returnValue(of(sendResponseStub));
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        matDialogRefSpy = jasmine.createSpyObj('MatDialog', ['close']);

        TestBed.configureTestingModule({
            imports: [HttpClientModule, MatDialogModule],
            declarations: [SendEmailComponent],

            providers: [
                { provide: MatDialogRef, useValue: matDialogRefSpy },
                { provide: DrawingService, useValue: drawingStub },
                { provide: DatabaseService, useValue: databaseServiceSpy },
                { provide: MatDialog, useValue: matDialogSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SendEmailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Image preview should be defined after view initialization', () => {
        spyOn(component, 'canvasToImage').and.returnValue('DataStringStub');
        component.ngAfterViewInit();
        expect(component.imagePreview.nativeElement.src).toContain('DataStringStub');
    });

    it('selectFormat() should assign correct enum value to exportFormat class attribute', () => {
        const matButtonToggleChange = {
            value: 'png',
        } as MatButtonToggleChange;
        component.selectFormat(matButtonToggleChange);
        expect(component.exportFormat).toEqual(ExportFormat.PNG);
        matButtonToggleChange.value = 'jpg';
        component.selectFormat(matButtonToggleChange);
        expect(component.exportFormat).toEqual(ExportFormat.JPG);
        matButtonToggleChange.value = 'png';
        component.selectFormat(matButtonToggleChange);
        expect(component.exportFormat).toEqual(ExportFormat.PNG);
    });

    it('cancel() should set isDisabled class attribute to false', () => {
        component.isDisabled = true;
        component.cancel();
        expect(component.isDisabled).toBeFalse();
    });

    it('isDisabledDialog() should return true if FormControl has errors', () => {
        let isDisabled = component.isDisabledDialog(); // Returns false because input field is empty
        expect(isDisabled).toBeTrue();
        component.titleFormControl.setErrors({
            required: false,
        });
        component.emailFormControl.setErrors({
            required: false,
        });
        isDisabled = component.isDisabledDialog();
        expect(isDisabled).toBeFalse();
    });

    it('canvasToImage() should call specific context functions with specific parameters', () => {
        drawingStub.baseCtx.canvas.width = CANVAS_DIMENSION_STUB_100;
        drawingStub.baseCtx.canvas.height = CANVAS_DIMENSION_STUB_100;
        drawingStub.baseCtx.globalCompositeOperation = 'source-over';
        component.exportFormat = ExportFormat.JPG;
        const imageDataStub: ImageData = drawingStub.baseCtx.createImageData(CANVAS_DIMENSION_STUB_200, CANVAS_DIMENSION_STUB_200);
        const getImageDataSpy = spyOn(drawingStub.baseCtx, 'getImageData').and.returnValue(imageDataStub);
        const fillRectSpy = spyOn(drawingStub.baseCtx, 'fillRect');
        const drawImageSpy = spyOn(drawingStub.baseCtx, 'drawImage');
        const clearRectSpy = spyOn(drawingStub.baseCtx, 'clearRect');
        const putImageDataSpy = spyOn(drawingStub.baseCtx, 'putImageData');
        const toDataURLSpy = spyOn(drawingStub.baseCtx.canvas, 'toDataURL').and.returnValue('dataStringStub');
        const dataURL = component.canvasToImage();
        expect(getImageDataSpy).toHaveBeenCalledWith(0, 0, CANVAS_DIMENSION_STUB_100, CANVAS_DIMENSION_STUB_100);
        expect(fillRectSpy).toHaveBeenCalledWith(0, 0, CANVAS_DIMENSION_STUB_100, CANVAS_DIMENSION_STUB_100);
        expect(drawImageSpy).toHaveBeenCalled();
        expect(clearRectSpy).toHaveBeenCalledWith(0, 0, CANVAS_DIMENSION_STUB_100, CANVAS_DIMENSION_STUB_100);
        expect(putImageDataSpy).toHaveBeenCalled();
        expect(toDataURLSpy).toHaveBeenCalledWith('image/jpeg');
        expect(drawingStub.baseCtx.filter).toEqual('none');
        expect(drawingStub.baseCtx.globalCompositeOperation).toEqual('source-over');
        expect(drawingStub.baseCtx.fillStyle).toEqual('#ffffff');
        expect(dataURL).toEqual('dataStringStub');
    });

    it("sendDrawing() should call dataBaseService's basicSendByEmail() with correct data", () => {
        component.titleInput.nativeElement.value = 'titleStub';
        spyOn(component, 'canvasToImage').and.returnValue('DataStringStub');
        component.exportFormat = ExportFormat.PNG;
        component.emailInput.nativeElement.value = 'emailStub';
        spyOn(Date, 'now').and.returnValue(ID_STUB);
        const newDrawingDataStub: DrawingData = {
            id: ID_STUB,
            title: 'titleStub',
            tags: [],
            imageData: 'DataStringStub',
            exportFormat: ExportFormat.PNG,
        };
        const newDrawingEmailDataStub: DrawingEmailData = {
            data: newDrawingDataStub,
            email: 'emailStub',
        };
        component.sendDrawing();
        expect(databaseServiceSpy.basicSendByEmail).toHaveBeenCalledWith(newDrawingEmailDataStub);
    });

    it('sendDrawing() open dialog with correct message when basicSendByEmail() is successful', () => {
        component.emailInput.nativeElement.value = 'emailStub';

        component.exportFormat = ExportFormat.JPG;
        component.sendDrawing();
        expect(matDialogSpy.open).toHaveBeenCalledWith(ResponseMessageComponent, {
            data: "Votre dessin a été exporté au format JPG dans le dossier server/emailed et envoyé à l'adresse emailStub.",
        });
    });

    it('sendDrawing() open dialog with correct message when basicSendByEmail() returns WriteError enum', () => {
        databaseServiceSpy.basicSendByEmail.and.returnValue(
            throwError(new HttpErrorResponse({ error: { body: SendStatus.WriteError }, status: HTTP_STATUS_ERROR })),
        );

        component.sendDrawing();
        expect(matDialogSpy.open).toHaveBeenCalledWith(ResponseMessageComponent, {
            data: "Erreur d'écriture du fichier.",
        });
    });

    it('sendDrawing() open dialog with correct message when basicSendByEmail() returns NotSent enum', () => {
        databaseServiceSpy.basicSendByEmail.and.returnValue(
            throwError(new HttpErrorResponse({ error: { body: SendStatus.NotSent }, status: HTTP_STATUS_ERROR })),
        );

        component.sendDrawing();
        expect(matDialogSpy.open).toHaveBeenCalledWith(ResponseMessageComponent, {
            data: "Votre dessin n'a pas pu être envoyé par courriel.",
        });
    });

    it('sendDrawing() open dialog with correct message when basicSendByEmail() when server is offline', () => {
        databaseServiceSpy.basicSendByEmail.and.returnValue(throwError(new HttpErrorResponse({ error: { status: 0 } })));

        component.sendDrawing();
        expect(matDialogSpy.open).toHaveBeenCalledWith(ResponseMessageComponent, {
            data: 'Connexion au serveur refusée.',
        });
    });

    it('applyFilter1() set current filter to none', () => {
        spyOn(component, 'canvasToImage').and.returnValue('a');
        component.canvasToImage();
        component.applyFilter('none');
        expect(component.currentFilter).toEqual('none');
        expect(component.imagePreview.nativeElement.src.endsWith('a'));
    });

    it('applyFilter2() set current filter to brightness(40%)', () => {
        spyOn(component, 'canvasToImage').and.returnValue('a');
        component.canvasToImage();
        component.applyFilter('brightness(40%)');
        expect(component.currentFilter).toEqual('brightness(40%)');
        expect(component.imagePreview.nativeElement.src.endsWith('a'));
    });

    it('applyFilter3() set current filter to sepia(100%)', () => {
        spyOn(component, 'canvasToImage').and.returnValue('a');
        component.canvasToImage();
        component.applyFilter('sepia(100%)');
        expect(component.currentFilter).toEqual('sepia(100%)');
        expect(component.imagePreview.nativeElement.src.endsWith('a'));
    });

    it('applyFilter4() set current filter to grayscale(100%)', () => {
        spyOn(component, 'canvasToImage').and.returnValue('a');
        component.canvasToImage();
        component.applyFilter('grayscale(100%)');
        expect(component.currentFilter).toEqual('grayscale(100%)');
        expect(component.imagePreview.nativeElement.src.endsWith('a'));
    });

    it('applyFilter5() set current filter to invert(100%)', () => {
        spyOn(component, 'canvasToImage').and.returnValue('a');
        component.canvasToImage();
        component.applyFilter('invert(100%)');
        expect(component.currentFilter).toEqual('invert(100%)');
        expect(component.imagePreview.nativeElement.src.endsWith('a'));
    });

    it('applyFilter6() set current filter to contrast(40%)', () => {
        spyOn(component, 'canvasToImage').and.returnValue('a');
        component.canvasToImage();
        component.applyFilter('contrast(40%)');
        expect(component.currentFilter).toEqual('contrast(40%)');
        expect(component.imagePreview.nativeElement.src.endsWith('a'));
    });
});
