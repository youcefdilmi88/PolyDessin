import { HttpClient, HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { canvasTestHelper } from '@classes/canvas-test-helper';
import { DrawingData } from '@common/communication/drawing-data';
import { ExportFormat } from '@common/communication/export-format';
import { DrawingService } from '@services/drawing/drawing.service';
import { of } from 'rxjs';
import { PopupExportDrawingComponent } from './popup-export-drawing.component';

export class Message {
    title: string;
    body: string;
}

const CANVAS_DIMENSION_STUB_100 = 100;
const CANVAS_DIMENSION_STUB_200 = 200;

describe('PopupExportDrawingComponent', () => {
    const dialogMock = {
        // tslint:disable-next-line: no-empty
        close: () => {},
    };
    const message: Message = {
        title: 'test',
        body: 'test',
    };
    let component: PopupExportDrawingComponent;
    let fixture: ComponentFixture<PopupExportDrawingComponent>;
    let drawingStub: DrawingService;
    let httpClientSpy: jasmine.SpyObj<HttpClient>;

    beforeEach(async(() => {
        drawingStub = new DrawingService();
        drawingStub.baseCtx = canvasTestHelper.baseCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingStub.previewCtx = canvasTestHelper.previewCanvas.getContext('2d') as CanvasRenderingContext2D;
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['post', 'get', 'delete']);
        httpClientSpy.post.and.returnValue(of(message));
        TestBed.configureTestingModule({
            imports: [HttpClientModule, MatDialogModule],
            declarations: [PopupExportDrawingComponent],
            providers: [
                { provide: DrawingService, useValue: drawingStub },
                { provide: MatDialogRef, useValue: dialogMock },
                { provide: HttpClient, useValue: httpClientSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PopupExportDrawingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create', () => {
        component.isDisabled = true;
        component.cancel();
        expect(component.isDisabled).toBeFalsy();
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

    it('should call basicPost when calling saveDrawing()', () => {
        const drawingData: DrawingData[] = [
            { id: 1234, title: '1234', tags: ['1234', '1234'], imageData: '1234', exportFormat: 1 },
            { id: 5678, title: '5678', tags: ['5678', '5678'], imageData: '5678', exportFormat: 0 },
        ];

        httpClientSpy.post.and.returnValue(of(drawingData));
        component.exportDrawing();
        expect(httpClientSpy.post.calls.count()).toEqual(1);
    });

    it('should add tag', () => {
        component.canvasToImage();
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
