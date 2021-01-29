import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@classes/canvas-test-helper';
import { Vec2 } from '@classes/vec2';
import { MouseButton } from '@enums/mouse-button';
import { DrawingService } from '@services/drawing/drawing.service';
import { SprayService } from './spray.service';

// tslint:disable

describe('SprayService', () => {
    let service: SprayService;
    let mouseEventLeftClick: MouseEvent;

    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let drawSpraySpy: jasmine.Spy<any>;
    let firstSpraySpy: jasmine.Spy<any>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        baseCtxStub = canvasTestHelper.baseCanvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.previewCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'addInEditStack']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(SprayService);

        drawSpraySpy = spyOn<any>(service, 'drawSpray').and.callThrough();
        firstSpraySpy = spyOn<any>(service, 'firstSpray').and.callThrough();

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

    it(' mouseDown should call drawSpray if mouse is down', () => {
        service.mouseDown = true;
        service.mouseDownCoord = { x: 0, y: 0 };

        service.onMouseDown(mouseEventLeftClick);
        expect(drawSpraySpy).toHaveBeenCalled();
    });

    it(' mouseDown should call firstSpray if mouse is down', () => {
        service.mouseDown = true;
        service.mouseDownCoord = { x: 0, y: 0 };

        service.onMouseDown(mouseEventLeftClick);
        expect(firstSpraySpy).toHaveBeenCalled();
    });

    it(' onMouseUp should call clearInterval', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;
        const clearIntervalSpy = spyOn<any>(window, 'clearInterval').and.callThrough();
        service.onMouseUp(mouseEventLeftClick);
        expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.mouseDown = true;
        service.onMouseMove(mouseEventLeftClick);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it(' onMouseMove should not set mouseDownCoord to correct position if mouse was not already down', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.mouseDown = false;

        service.onMouseMove(mouseEventLeftClick);
        expect(service.mouseDownCoord).not.toEqual(expectedResult);
    });

    it(' setEmissionInterval should set interval to correct value', () => {
        const expectedResult = 10;
        service.mouseDown = true;
        service.setEmissionInterval(expectedResult);
        expect(service.currentInterval).toEqual(expectedResult);
    });

    it(' setCurrentSprayDiameter should set diameter to correct value', () => {
        const expectedResult = 10;
        service.mouseDown = true;
        service.setSprayDiameter(expectedResult);
        expect(service.currentSprayDiameter).toEqual(expectedResult);
    });

    it(' setCurrentDotDiameter should set diameter to correct value', () => {
        const expectedResult = 10;
        service.mouseDown = true;
        service.setDotDiameter(expectedResult);
        expect(service.currentDotDiameter).toEqual(expectedResult);
    });

    it(' should change the pixel of the canvas ', () => {
        mouseEventLeftClick = { offsetX: 0, offsetY: 0, button: MouseButton.Left } as MouseEvent;
        service.onMouseDown(mouseEventLeftClick);
        mouseEventLeftClick = { offsetX: 1, offsetY: 0, button: MouseButton.Left } as MouseEvent;
        service.onMouseUp(mouseEventLeftClick);
    });
});
