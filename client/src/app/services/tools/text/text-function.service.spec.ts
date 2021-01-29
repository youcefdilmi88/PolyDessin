import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@classes/canvas-test-helper';
import { Vec2 } from '@classes/vec2';
import { DrawingService } from '@services/drawing/drawing.service';
import { UndoRedoService } from '@services/undo-redo/undo-redo.service';
import { TextFunctionService } from './text-function.service';

// tslint:disable

describe('TextFunctionService', () => {
    let service: TextFunctionService;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let undoRedoServiceSpy: jasmine.SpyObj<UndoRedoService>;

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
        undoRedoServiceSpy = jasmine.createSpyObj('UndoRedoService', ['undo']);

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
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: UndoRedoService, useValue: undoRedoServiceSpy },
            ],
        });

        service = TestBed.inject(TextFunctionService);
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].ctxStack = ctxStack;
        service['drawingService'].ctxStackRedo = ctxStackRedo;
        service['drawingService'].isStackEmpty = isStackEmpty;
        service['drawingService'].isStackEmptyRedo = isStackEmptyRedo;
        service['drawingService'].canvasSizeStack = canvasSizeStack;
        service['drawingService'].canvasSizeStackRedo = canvasSizeStackRedo;

        (service as any).focusIndex = 3;
        (service as any).isFocus = true;

        (service as any).textStack = ['Hello', 'Je suis', 'heureuse'];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('call method render', () => {
        (service as any).position = { x: 10, y: 10 };
        // (service as any).text();

        (service as any).render(drawingServiceSpy.baseCtx);
        expect(service).toBeTruthy();
    });

    it('call method done', () => {
        (service as any).inc = 3;
        (service as any).done();
        expect(service).toBeTruthy();
    });

    it('should add cursor in the middle of word', () => {
        (service as any).focusIndexLvl = 1;
        (service as any).render(drawingServiceSpy.baseCtx);
        expect(service).toBeTruthy();
    });
});
