import { HttpClient, HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { canvasTestHelper } from '@classes/canvas-test-helper';
import { DrawingData } from '@common/communication/drawing-data';
import { DrawingService } from '@services/drawing/drawing.service';
import { of } from 'rxjs';
import { PopupSaveDrawingComponent } from './popup-save-drawing.component';

export class Message {
    title: string;
    body: string;
}

describe('PopupSaveDrawingComponent', () => {
    let component: PopupSaveDrawingComponent;
    let fixture: ComponentFixture<PopupSaveDrawingComponent>;
    let drawingStub: DrawingService;
    let httpClientSpy: jasmine.SpyObj<HttpClient>;
    const message: Message = {
        title: 'test',
        body: 'test',
    };

    const dialogMock = {
        // tslint:disable: no-empty
        close: () => {},
    };

    beforeEach(async(() => {
        drawingStub = new DrawingService();
        drawingStub.baseCtx = canvasTestHelper.baseCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingStub.previewCtx = canvasTestHelper.previewCanvas.getContext('2d') as CanvasRenderingContext2D;
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['post', 'get', 'delete']);
        httpClientSpy.post.and.returnValue(of(message));

        TestBed.configureTestingModule({
            declarations: [PopupSaveDrawingComponent],
            imports: [HttpClientModule, MatDialogModule],
            providers: [
                { provide: MatDialogRef, useValue: dialogMock },
                { provide: DrawingService, useValue: drawingStub },
                { provide: HttpClient, useValue: httpClientSpy },
                { provide: MAT_DIALOG_DATA, useValue: [] },
            ],
        }).compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(PopupSaveDrawingComponent);
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

    it('should call basicPost when calling saveDrawing()', () => {
        const drawingData: DrawingData[] = [
            { id: 1234, title: '1234', tags: ['1234', '1234'], imageData: '1234', exportFormat: 1 },
            { id: 5678, title: '5678', tags: ['5678', '5678'], imageData: '5678', exportFormat: 0 },
        ];

        httpClientSpy.post.and.returnValue(of(drawingData));
        component.saveDrawing();
        expect(httpClientSpy.post.calls.count()).toEqual(1);
    });

    it('should add tag', () => {
        // tslint:disable: no-any
        const inputTest = (component as any).input as HTMLInputElement;
        const valueTest = ((component as any).value = 'salut');
        const event: MatChipInputEvent = {
            input: inputTest,
            value: valueTest,
        };
        component.tags = ['test', 'allo'];
        component.add(event);
        // tslint:disable-next-line: no-magic-numbers
        expect(component.tags.length).toEqual(3);
        expect(event.value).not.toEqual('');
    });

    it('should add tag', () => {
        component.tags = ['test', 'allo'];
        component.canvasToImage();
    });

    it('should remove tag', () => {
        component.tags = ['test', 'allo'];
        component.remove('test');
        expect(component.tags[0]).toEqual('allo');
    });

    it('should return false if the tag is invalid', () => {
        component.tags = ['123'];
        const bool: boolean = (component as any).checkTag();
        expect(bool).toBeTruthy();
    });

    it('should return false if the tag is invalid', () => {
        component.tags = ['test', 'allo', 'test', 'allo', 'allo', 'test', 'allo', 'allo', 'test', 'allo', 'allo', 'test', 'allo'];
        const bool: boolean = (component as any).checkTag();
        expect(bool).toEqual(false);
    });

    it('should return false if the tag is invalid', () => {
        component.setPNG(true);
        expect(component.isPNG).toBeTruthy();
    });
});
