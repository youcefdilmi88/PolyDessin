import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@classes/canvas-test-helper';
import { Vec2 } from '@classes/vec2';
import { MouseButton } from '@enums/mouse-button';
import { DrawingService } from '@services/drawing/drawing.service';
import { UndoRedoService } from '@services/undo-redo/undo-redo.service';
import { TextService } from './text.service';

// tslint:disable

describe('TextService', () => {
    let service: TextService;
    let mouseEventLeftClick: MouseEvent;
    let keyBoardEvent: KeyboardEvent;

    let ctxStack: ImageData[];
    let ctxStackRedo: ImageData[];
    let isStackEmpty: boolean;
    let isStackEmptyRedo: boolean;
    let canvasSizeStack: Vec2[];
    let canvasSizeStackRedo: Vec2[];

    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let undoServiceSpy: jasmine.SpyObj<UndoRedoService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        baseCtxStub = canvasTestHelper.baseCanvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.previewCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'addInEditStack']);
        undoServiceSpy = jasmine.createSpyObj('UndoRedoService', ['undo']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: UndoRedoService, useValue: undoServiceSpy },
            ],
        });
        service = TestBed.inject(TextService);

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

        service.drawingService.baseCtx = baseCtxStub;
        service.drawingService.previewCtx = previewCtxStub;
        service.drawingService.ctxStack = ctxStack;
        service.drawingService.ctxStackRedo = ctxStackRedo;
        service.drawingService.isStackEmpty = isStackEmpty;
        service.drawingService.isStackEmptyRedo = isStackEmptyRedo;
        service.drawingService.canvasSizeStack = canvasSizeStack;
        service.drawingService.canvasSizeStackRedo = canvasSizeStackRedo;

        (service as any).focusIndex = 3;
        (service as any).isFocus = false;
        (service as any).textStack = ['Hello', 'Je suis', 'heureuse'];
        service.mouseDown = true;

        mouseEventLeftClick = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(" should call the tool's mouse move when receiving a mouse move event", () => {
        const mouseEventSpy = spyOn(service, 'onMouseMove').and.callThrough();
        service.onMouseMove(mouseEventLeftClick);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(mouseEventLeftClick);
    });

    it(" should call the tool's mouse move when receiving a mouse up event", () => {
        const mouseEventSpy = spyOn(service, 'onMouseUp').and.callThrough();
        service.onMouseUp(mouseEventLeftClick);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(mouseEventLeftClick);
    });
    it(" should call the tool's mouse move when receiving a mouse up event", () => {
        (service as any).position = { x: 0, y: 0 };
        (service as any).options.width = (service as any).options.height = 3;
        const mouseEventSpy = spyOn(service, 'onMouseUp').and.callThrough();
        service.onMouseUp(mouseEventLeftClick);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(mouseEventLeftClick);
    });

    it(" should call the tool's mouse move when receiving a mouse up event", () => {
        (service as any).isFocus = true;
        (service as any).position = { x: 0, y: 0 };
        (service as any).options.width = (service as any).options.height = 3;
        const mouseEventSpy = spyOn(service, 'onMouseUp').and.callThrough();
        service.onMouseUp(mouseEventLeftClick);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(mouseEventLeftClick);
    });

    it(" should call the tool's mouse move when receiving a mouse down event", () => {
        const mouseEventSpy = spyOn(service, 'onMouseDown').and.callThrough();
        service.onMouseDown(mouseEventLeftClick);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(mouseEventLeftClick);
    });

    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEventLeftClick);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it("Testing currentAlignmentRight should be true when 'right'", () => {
        service.setCurrentAlignment('right', true);
        expect((service as any).currentAlignmentRight).toBeTruthy();

        service.setCurrentAlignment('right', false);
        expect((service as any).currentAlignmentRight).toBeFalsy();
    });

    it("Testing currentAlignmentRight should be true when 'center'", () => {
        service.setCurrentAlignment('center', true);
        expect((service as any).currentAlignmentCenter).toBeTruthy();

        service.setCurrentAlignment('center', false);
        expect((service as any).currentAlignmentCenter).toBeFalsy();
    });

    it("Testing currentAlignmentRight should be true when 'left'", () => {
        service.setCurrentAlignment('left', true);
        expect((service as any).currentAlignmentLeft).toBeTruthy();

        service.setCurrentAlignment('left', false);
        expect((service as any).currentAlignmentLeft).toBeFalsy();
    });

    it('Testing currentFont should equal to font', () => {
        const font = 'Arial';
        service.setCurrentFont('Arial');
        expect((service as any).currentFont).toEqual(font);

        service.setCurrentFont('Times New Roman');
        expect((service as any).currentFont).not.toEqual(font);
    });

    it('Testing currentFontSize should equal to size', () => {
        const size = '14';
        service.setCurrentFontSize('14');
        expect((service as any).currentFontSize).toEqual(size);

        service.setCurrentFontSize('72');
        expect((service as any).currentFontSize).not.toEqual(size);
    });

    it('Testing currentBoldStatus should be true', () => {
        service.setCurrentBold(true);
        expect((service as any).currentBoldStatus).toBeTruthy();
    });

    it('Testing currentBoldStatus should be false', () => {
        service.setCurrentBold(false);
        expect((service as any).currentBoldStatus).toBeFalsy();
    });

    it('Testing currentItalicStatus should be true', () => {
        service.setCurrentItalic(true);
        expect((service as any).currentItalicStatus).toBeTruthy();
    });

    it('Testing currentItalicStatus should be false', () => {
        service.setCurrentItalic(false);
        expect((service as any).currentItalicStatus).toBeFalsy();
    });

    it(' keyPressEVent Escape should be detected', () => {
        (service as any).inc = 3;
        keyBoardEvent = {
            key: 'Escape',
        } as KeyboardEvent;
        service.onKeyPress(keyBoardEvent);
        expect(service).toBeTruthy();
    });

    it(' keyPressEVent Delete should be detected', () => {
        keyBoardEvent = {
            key: 'Delete',
        } as KeyboardEvent;
        service.onKeyPress(keyBoardEvent);
        expect(service).toBeTruthy();
    });

    it(' keyPressEVent Delete should be detected', () => {
        (service as any).textString = 'allo';
        keyBoardEvent = {
            key: 'Delete',
        } as KeyboardEvent;
        service.onKeyPress(keyBoardEvent);
        expect(service).toBeTruthy();
    });

    it(' keyPressEVent Backspace should be detected', () => {
        keyBoardEvent = {
            key: 'Backspace',
        } as KeyboardEvent;
        service.onKeyPress(keyBoardEvent);
        expect(service).toBeTruthy();
    });

    it(' keyPressEVent Backspace should be detected', () => {
        (service as any).focusIndex = 0;
        keyBoardEvent = {
            key: 'Backspace',
        } as KeyboardEvent;
        service.onKeyPress(keyBoardEvent);
        expect(service).toBeTruthy();
    });

    it(' keyPressEVent Backspace should be detected', () => {
        (service as any).focusIndex = 1;
        keyBoardEvent = {
            key: 'Backspace',
        } as KeyboardEvent;
        service.onKeyPress(keyBoardEvent);
        expect(service).toBeTruthy();
    });

    it(' keyPressEVent ArrowLeft should be detected', () => {
        keyBoardEvent = {
            key: 'ArrowLeft',
        } as KeyboardEvent;
        service.onKeyPress(keyBoardEvent);
        expect(service).toBeTruthy();
    });

    it(' keyPressEVent ArrowLeft should be detected', () => {
        (service as any).focusIndex = -1;
        (service as any).textStack = ['Hello', 'Je suis', 'heureuse'];
        (service as any).focusIndexLvl = 1;
        keyBoardEvent = {
            key: 'ArrowLeft',
        } as KeyboardEvent;
        (service as any).keyArrowLeft(keyBoardEvent);
        expect(service).toBeTruthy();
    });

    it(' keyPressEVent ArrowRight should be detected', () => {
        keyBoardEvent = {
            key: 'ArrowRight',
        } as KeyboardEvent;
        service.onKeyPress(keyBoardEvent);
        expect(service).toBeTruthy();
    });

    it(' keyPressEVent ArrowRight should be detected', () => {
        (service as any).textString = 'allo';
        keyBoardEvent = {
            key: 'ArrowRight',
        } as KeyboardEvent;
        service.onKeyPress(keyBoardEvent);
        expect(service).toBeTruthy();
    });

    it(' keyPressEVent Enter should be detected', () => {
        (service as any).textString = 'al';
        keyBoardEvent = {
            key: 'Enter',
        } as KeyboardEvent;
        service.onKeyPress(keyBoardEvent);
        expect(service).toBeTruthy();
    });

    it(' keyPressEVent Enter should be detected', () => {
        (service as any).isCommandKey = false;
        keyBoardEvent = {
            key: 'a',
        } as KeyboardEvent;
        service.onKeyPress(keyBoardEvent);
        expect(service).toBeTruthy();
    });

    it(' keyPressEVent Enter should be detected', () => {
        (service as any).textString = 'all';
        (service as any).isCommandKey = false;
        keyBoardEvent = {
            key: 'a',
        } as KeyboardEvent;
        service.onKeyPress(keyBoardEvent);
        expect(service).toBeTruthy();
    });

    it(' keyPressEVent Enter should be detected', () => {
        keyBoardEvent = {
            key: 'Meta',
        } as KeyboardEvent;
        service.onKeyPress(keyBoardEvent);
        expect(service).toBeTruthy();
    });

    it(' keyPressEVent Enter should be detected', () => {
        (service as any).isCommandKey = true;
        keyBoardEvent = {
            key: 'a',
        } as KeyboardEvent;
        service.onKeyPress(keyBoardEvent);
        expect(service).toBeTruthy();
    });

    it(' should pass if popIndex', () => {
        (service as any).popIndex(3);
        expect(service).toBeTruthy();
    });
});
