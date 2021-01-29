import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@classes/canvas-test-helper';
import { DrawingService } from '@services/drawing/drawing.service';
import { SelectionEllipseService } from '@tools/selection/selection-ellipse/selection-ellipse.service';
import { SelectionRectangleService } from '@tools/selection/selection-rectangle/selection-rectangle.service';
import { ClipboardService } from './clipboard.service';

// tslint:disable

describe('ClipboardService', () => {
    let service: ClipboardService;
    let selectionData: HTMLCanvasElement;
    let keyBoardEvent: KeyboardEvent;

    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let selectRectServiceSpy: jasmine.SpyObj<SelectionRectangleService>;
    let selectEllipseServiceSpy: jasmine.SpyObj<SelectionEllipseService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        baseCtxStub = canvasTestHelper.baseCanvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.previewCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'addInEditStack']);
        selectRectServiceSpy = jasmine.createSpyObj('SelectionRectangleService', [
            'clearSelection',
            'drawSelection',
            'drawBox',
            'saveSelection',
            'onKeyPress',
        ]);
        selectEllipseServiceSpy = jasmine.createSpyObj('SelectionEllipseService', [
            'clearSelection',
            'drawSelection',
            'drawBox',
            'saveSelection',
            'onKeyPress',
        ]);
        // selectRectServiceSpy.drawSelection(previewCtxStub, { x: 10, y: 10 });
        // selectRectServiceSpy.clearSelection(previewCtxStub);
        selectionData = document.createElement('canvas') as HTMLCanvasElement;

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: SelectionRectangleService, useValue: selectRectServiceSpy },
                { provide: SelectionEllipseService, useValue: selectEllipseServiceSpy },
            ],
        });
        service = TestBed.inject(ClipboardService);

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;

        service['selectionService'].clipboard = selectionData;
        service['selectionEllipse'].clipboard = selectionData;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onKeyPress delete', () => {
        keyBoardEvent = {
            key: 'Delete',
        } as KeyboardEvent;
        service.onKeyPress(keyBoardEvent);
    });

    it('onKeyPress copy', () => {
        keyBoardEvent = {
            ctrlKey: true,
            keyCode: 67,
        } as KeyboardEvent;
        service.onKeyPress(keyBoardEvent);
    });

    it('onKeyPress cut', () => {
        keyBoardEvent = {
            ctrlKey: true,
            keyCode: 88,
        } as KeyboardEvent;
        service.onKeyPress(keyBoardEvent);
    });

    it('onKeyPress paste', () => {
        keyBoardEvent = {
            ctrlKey: true,
            keyCode: 86,
        } as KeyboardEvent;
        selectRectServiceSpy.clipboard = document.createElement('canvas') as HTMLCanvasElement;
        selectRectServiceSpy.selectionMiddle = { x: 6, y: 20 };
        selectRectServiceSpy.newPoint = { x: 6, y: 20 };

        service.onKeyPress(keyBoardEvent);
    });

    it('ellipse paste', () => {
        service.isEllipse = true;
        selectEllipseServiceSpy.clipboard = document.createElement('canvas') as HTMLCanvasElement;
        selectEllipseServiceSpy.selectionMiddle = { x: 6, y: 20 };
        selectEllipseServiceSpy.newPoint = { x: 6, y: 20 };
        service.paste();
    });

    it('rectangle paste', () => {
        service.isEllipse = false;
        selectRectServiceSpy.clipboard = document.createElement('canvas') as HTMLCanvasElement;
        selectRectServiceSpy.selectionMiddle = { x: 6, y: 20 };
        selectRectServiceSpy.newPoint = { x: 6, y: 20 };
        service.paste();
    });

    it(' copy', () => {
        service.copy();
    });

    it(' cut', () => {
        service.cut();
    });

    it(' delete', () => {
        service.delete();
    });

    it(' copy', () => {
        service.isEllipse = true;
        service.copy();
    });

    it(' cut', () => {
        service.isEllipse = true;
        service.cut();
    });

    it(' delete', () => {
        service.isEllipse = true;
        service.delete();
    });
});
