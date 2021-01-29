import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@classes/canvas-test-helper';
import { Vec2 } from '@classes/vec2';
import { MouseButton } from '@enums/mouse-button';
import { DrawingService } from '@services/drawing/drawing.service';
import { FeatherService } from './feather.service';

// tslint:disable

describe('FeatherService', () => {
    let service: FeatherService;
    let mouseEventLeftClick: MouseEvent;
    let wheelEvent: WheelEvent;
    let wheelEvent2: WheelEvent;
    let wheelEvent3: WheelEvent;
    let wheelEvent4: WheelEvent;

    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let drawFeatherLineSpy: jasmine.Spy<any>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        baseCtxStub = canvasTestHelper.baseCanvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.previewCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'addInEditStack']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(FeatherService);
        drawFeatherLineSpy = spyOn<any>(service, 'drawFeatherLine').and.callThrough();

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEventLeftClick = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;

        wheelEvent = {
            deltaY: -125,
            altKey: true,
        } as WheelEvent;

        wheelEvent2 = {
            deltaY: -125,
            altKey: false,
        } as WheelEvent;

        wheelEvent3 = {
            deltaY: 125,
            altKey: false,
        } as WheelEvent;

        wheelEvent4 = {
            deltaY: 125,
            altKey: true,
        } as WheelEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
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
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseUp should call drawFeatherLine if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.onMouseUp(mouseEventLeftClick);
        expect(drawFeatherLineSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should not call drawFeatherLine if mouse was not already down', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };
        service.onMouseUp(mouseEventLeftClick);
        expect(drawFeatherLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call drawFeatherLine if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.onMouseMove(mouseEventLeftClick);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawFeatherLineSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawFeatherLine if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;
        service.onMouseMove(mouseEventLeftClick);
        expect(drawingServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawFeatherLineSpy).not.toHaveBeenCalled();
    });

    it(' currentFeatherAngle is incremented in mousewheel and deltaY < 0', () => {
        service.currentFeatherAngle = 0;
        service.onMouseWheel(wheelEvent);
        expect(service.currentFeatherAngle).toEqual(1);
    });

    it(' currentFeatherAngle is decremented in mousewheel and deltaY > 0', () => {
        service.currentFeatherAngle = 0;
        service.onMouseWheel(wheelEvent4);
        expect(service.currentFeatherAngle).toEqual(-1);
    });

    it(' currentFeatherAngle + 15 should be done in mousewheel and deltaY < 0', () => {
        service.currentFeatherAngle = 0;
        service.onMouseWheel(wheelEvent2);
        expect(service.currentFeatherAngle).toEqual(15);
    });

    it('currentFeatherAngle - 15 should be done in mousewheel and deltaY > 0', () => {
        service.currentFeatherAngle = 0;
        service.onMouseWheel(wheelEvent3);
        expect(service.currentFeatherAngle).toEqual(-15);
    });
});
