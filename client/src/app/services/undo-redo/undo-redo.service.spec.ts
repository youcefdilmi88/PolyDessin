import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@classes/canvas-test-helper';
import { Vec2 } from '@classes/vec2';
import { DrawingService } from '@services/drawing/drawing.service';
import { UndoRedoService } from './undo-redo.service';

// tslint:disable

describe('UndoRedoService', () => {
    let service: UndoRedoService;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;

    let ctxStack: ImageData[];
    let ctxStackRedo: ImageData[];
    let isStackEmpty: boolean;
    let isStackEmptyRedo: boolean;
    let canvasSizeStack: Vec2[];
    let canvasSizeStackRedo: Vec2[];

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        baseCtxStub = canvasTestHelper.baseCanvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.previewCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'addInEditStack']);
        ctxStack = [new ImageData(1, 1), new ImageData(1, 1), new ImageData(1, 1)];
        ctxStackRedo = [new ImageData(1, 1)];
        isStackEmpty = true;
        isStackEmptyRedo = true;
        canvasSizeStack = [
            { x: 25, y: 25 },
            { x: 25, y: 25 },
            { x: 25, y: 25 },
        ];
        canvasSizeStackRedo = [
            { x: 25, y: 25 },
            { x: 25, y: 25 },
            { x: 25, y: 25 },
        ];

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(UndoRedoService);
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].ctxStack = ctxStack;
        service['drawingService'].ctxStackRedo = ctxStackRedo;
        service['drawingService'].isStackEmpty = isStackEmpty;
        service['drawingService'].isStackEmptyRedo = isStackEmptyRedo;
        service['drawingService'].canvasSizeStack = canvasSizeStack;
        service['drawingService'].canvasSizeStackRedo = canvasSizeStackRedo;

        drawingServiceSpy.baseCtx.canvas.width = drawingServiceSpy.previewCtx.canvas.width = 5;
        drawingServiceSpy.baseCtx.canvas.height = drawingServiceSpy.previewCtx.canvas.height = 5;

        service.rightGrabberElement = document.createElement('button');
        service.cornerGrabberElement = document.createElement('button');
        service.bottomGrabberElement = document.createElement('button');

        service.rightGrabberElement.style.top = drawingServiceSpy.baseCtx.canvas.style.top;
        service.rightGrabberElement.style.left = drawingServiceSpy.baseCtx.canvas.style.left;
        service.bottomGrabberElement.style.top = drawingServiceSpy.baseCtx.canvas.style.top;
        service.bottomGrabberElement.style.left = drawingServiceSpy.baseCtx.canvas.style.left;
        service.cornerGrabberElement.style.top = drawingServiceSpy.baseCtx.canvas.style.top;
        service.cornerGrabberElement.style.left = drawingServiceSpy.baseCtx.canvas.style.left;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' should call the every called functions in undo() when clicking undo', () => {
        const undoSpy = spyOn(service, 'undo').and.callThrough();
        service.undo();
        expect(undoSpy).toHaveBeenCalled();
    });

    it(' should call the every called functions in redo() when clicking redo', () => {
        const redoSpy = spyOn(service, 'redo').and.callThrough();
        service.redo();
        expect(redoSpy).toHaveBeenCalled();
    });

    it(' boolean variable isTackEmpty and isStackEmptyRedo should retrun true when their stack is empty', () => {
        drawingServiceSpy.ctxStack.length = 5;

        expect((service as any).stackUndoEmptyStatus()).toEqual(false);

        drawingServiceSpy.ctxStackRedo.length = 5;

        expect((service as any).stackRedoEmptyStatus()).toEqual(false);

        drawingServiceSpy.ctxStack.length = 1;

        expect((service as any).stackUndoEmptyStatus()).toEqual(true);

        drawingServiceSpy.ctxStackRedo.length = 0;

        expect((service as any).stackRedoEmptyStatus()).toEqual(true);
    });

    it(' boolean variable isTackEmpty and isStackEmptyRedo should retrun true when their stack is empty', () => {
        const undoSpy = spyOn(service as any, 'eraseLastCtxFromUndoStack').and.callThrough();
        service.undo();
        expect(undoSpy).toHaveBeenCalled();
        drawingServiceSpy.ctxStack.length = 1;
        service.undo();
        expect(undoSpy).toHaveBeenCalled();
    });

    it(' boolean variable isTackEmpty and isStackEmptyRedo should retrun true when their stack is empty', () => {
        const undoSpy = spyOn(service as any, 'getLastCanvaSizeFromUndoStack').and.callThrough();
        drawingServiceSpy.canvasSizeStackRedo.length = 2;

        (service as any).getLastCanvaSizeFromUndoStack();
        expect(undoSpy).toHaveBeenCalled();

        drawingServiceSpy.canvasSizeStackRedo.length = 1;

        (service as any).getLastCanvaSizeFromUndoStack();
        expect(drawingServiceSpy.canvasSizeStackRedo[drawingServiceSpy.canvasSizeStackRedo.length - 1]).toEqual({ x: 25, y: 25 });
    });

    it(' boolean variable isTackEmpty and isStackEmptyRedo should retrun true when their stack is empty', () => {
        const undoSpy = spyOn(service, 'undoRedoCurrentTool').and.callThrough();
        drawingServiceSpy.canvasSizeStackRedo.length = 2;

        service.undoRedoCurrentTool(true, 5, 6);
        expect(undoSpy).toHaveBeenCalled();
        expect(drawingServiceSpy.isStackEmpty).not.toBeTruthy();
        expect(drawingServiceSpy.canvasSizeStack[drawingServiceSpy.canvasSizeStack.length - 1]).toEqual({ x: 5, y: 6 });

        service.undoRedoCurrentTool(false, 5, 6);
        expect(drawingServiceSpy.isStackEmpty).not.toBeTruthy();
        expect(drawingServiceSpy.canvasSizeStack[drawingServiceSpy.canvasSizeStack.length - 1]).toEqual({ x: 5, y: 6 });
    });

    it(' boolean variable isTackEmpty and isStackEmptyRedo should retrun true when their stack is empty', () => {
        const undoSpy = spyOn(service as any, 'getLastCanvaSizeFromRedoStack').and.callThrough();
        const undoSpy1 = spyOn(service as any, 'eraseLastCtxFromRedoStack').and.callThrough();
        const undoSpy2 = spyOn(service as any, 'stackRedoEmptyStatus').and.callThrough();
        drawingServiceSpy.ctxStackRedo.length = 0;

        service.redo();
        expect(undoSpy).not.toHaveBeenCalled();
        expect(undoSpy1).not.toHaveBeenCalled();
        expect(undoSpy2).toHaveBeenCalled();
    });

    it(' boolean variable isTackEmpty and isStackEmptyRedo should retrun true when their stack is empty', () => {
        const undoSpy = spyOn(service as any, 'getLastCanvaSizeFromUndoStack').and.callThrough();
        const undoSpy1 = spyOn(service as any, 'eraseLastCtxFromUndoStack').and.callThrough();
        const undoSpy2 = spyOn(service as any, 'stackRedoEmptyStatus').and.callThrough();
        drawingServiceSpy.ctxStack.length = 3;

        service.undo();
        expect(undoSpy).toHaveBeenCalled();
        expect(undoSpy1).toHaveBeenCalled();
        expect(undoSpy2).not.toHaveBeenCalled();
    });
});
