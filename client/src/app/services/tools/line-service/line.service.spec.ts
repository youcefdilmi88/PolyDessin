import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@classes/canvas-test-helper';
import { Vec2 } from '@classes/vec2';
import { MouseButton } from '@enums/mouse-button';
import { DrawingService } from '@services/drawing/drawing.service';
import { LineService } from './line.service';

// tslint:disable

describe('LineService', () => {
    let service: LineService;
    let mouseEventLeftClick: MouseEvent;
    let keyBoardEvent: KeyboardEvent;

    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let drawStraightLineSpy: jasmine.Spy<any>;
    let drawStraightLinesSpy: jasmine.Spy<any>;
    let drawPointSpy: jasmine.Spy<any>;
    let computeAnglespy: jasmine.Spy<any>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        baseCtxStub = canvasTestHelper.baseCanvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.previewCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'addInEditStack']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(LineService);

        drawStraightLinesSpy = spyOn<any>(service, 'drawStraightLines').and.callThrough();
        drawStraightLineSpy = spyOn<any>(service, 'drawStraightLine').and.callThrough();
        drawPointSpy = spyOn<any>(service, 'drawPoint').and.callThrough();
        computeAnglespy = spyOn<any>(service, 'computeAngle');

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEventLeftClick = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' onMouseDown should set mouseDown property to true and doubleClick property to false', () => {
        service.mousePosition = service.getPositionFromMouse(mouseEventLeftClick);
        service.onMouseDown(mouseEventLeftClick);
        expect(service.doubleClick).toEqual(false);
        expect(service.mouseDown).toEqual(true);
        service.align = true;
    });

    it(' onMouseMove should call drawStraightLines if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.keyEscape = false;
        service.onMouseMove(mouseEventLeftClick);
        service.withPoint = true;
        expect(drawStraightLineSpy).toHaveBeenCalled();
    });

    it(' drawStraightLines should call drawPointSpy', () => {
        service.withPoint = true;
        service.onMouseMove(mouseEventLeftClick);
        expect(drawPointSpy).not.toHaveBeenCalled();
    });

    it(' keyEscape should return true when key is pressed', () => {
        keyBoardEvent = {
            key: 'Escape',
        } as KeyboardEvent;
        service.onKeyPress(keyBoardEvent);
        expect(service.keyEscape).toEqual(true);
    });

    it(' keyBackSpace should return true when key is pressed', () => {
        keyBoardEvent = {
            key: 'Backspace',
        } as KeyboardEvent;
        service.onKeyPress(keyBoardEvent);
        expect(service.keyBackspace).toEqual(true);
    });

    it(' align should return true when shift key is pressed', () => {
        keyBoardEvent = {
            shiftKey: true,
        } as KeyboardEvent;
        service.onKeyPress(keyBoardEvent);
        expect(service.align).toEqual(true);
        expect(computeAnglespy).toHaveBeenCalled();
        expect(drawStraightLineSpy).toHaveBeenCalled();
    });

    it(' keyRelease should return false depending on the key pressed', () => {
        keyBoardEvent = {
            shiftKey: false,
        } as KeyboardEvent;
        service.onKeyRelease(keyBoardEvent);
        expect(service.align).toEqual(false);
        expect(drawStraightLinesSpy).toHaveBeenCalled();
        expect(drawStraightLineSpy).toHaveBeenCalled();
    });

    it(' dblClick should call drawStraightLines on baseCtx', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        const expectedResult2: Vec2 = { x: 25, y: 25 };
        spyOn<any>(service, 'distanceTwoPoints');
        service.onDoubleClick(mouseEventLeftClick);
        service.drawStraightLine(baseCtxStub, expectedResult, expectedResult2);
        expect(service.doubleClick).toEqual(true);
        expect(drawStraightLineSpy).toHaveBeenCalled();
    });

    it(" should call the tool's mouse move when receiving a mouse move event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(service, 'onMouseMove').and.callThrough();
        service.onMouseMove(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's mouse move when receiving a mouse up event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(service, 'onMouseUp').and.callThrough();
        service.onMouseUp(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's mouse move when receiving a mouse down event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(service, 'onMouseDown').and.callThrough();
        service.onMouseDown(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEventLeftClick);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEventLeftClick);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should set mouseDown property to false on right click', () => {
        const mouseEventRightClick = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Right,
        } as MouseEvent;
        service.onMouseDown(mouseEventRightClick);
        expect(service.mouseDown).toEqual(true);
    });

    it(' onMouseUp should call drawLine if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.onMouseUp(mouseEventLeftClick);
        expect(drawStraightLinesSpy).not.toHaveBeenCalled();
    });

    it(' onMouseUp should not call drawLine if mouse was not already down', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };
        service.onMouseUp(mouseEventLeftClick);
        expect(drawStraightLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call drawLine if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.onMouseMove(mouseEventLeftClick);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawStraightLineSpy).toHaveBeenCalled();
    });
});
