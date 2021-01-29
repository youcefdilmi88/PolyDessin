import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@classes/canvas-test-helper';
import { Vec2 } from '@classes/vec2';
import { MouseButton } from '@enums/mouse-button';
import { DrawingService } from '@services/drawing/drawing.service';
import { PolygonService } from './polygon.service';

// tslint:disable

describe('PolygonService', () => {
    let service: PolygonService;
    let mouseEventLeftClick: MouseEvent;

    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let drawPolygonSpy: jasmine.Spy<any>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        baseCtxStub = canvasTestHelper.baseCanvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.previewCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'addInEditStack']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(PolygonService);
        drawPolygonSpy = spyOn<any>(service, 'drawPolygon').and.callThrough();

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

    it("Testing currentBehavior should be 'contour seulement'", () => {
        service.setCurrentBehavior('contour seulement');
        expect(service.currentBehavior).toEqual('contour seulement');
    });

    it("Testing the fonction setCurrentValue should be 'plein sans contour'", () => {
        service.setCurrentBehavior('plein sans contour');
        expect(service.currentBehavior).toEqual('plein sans contour');
    });

    it("Testing the fonction setCurrentValue should be 'plein avec contour'", () => {
        service.setCurrentBehavior('plein avec contour');
        expect(service.currentBehavior).toEqual('plein avec contour');
    });

    it("Testing the fonction setCurrentValue should be 'contour seulement'", () => {
        service.setCurrentBehavior('plein sans contour');
        service.setCurrentBehavior('contour seulement');
        expect(service.currentBehavior).toEqual('contour seulement');
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
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseUp should call drawLine if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseUp(mouseEventLeftClick);
        expect(drawPolygonSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should not call drawLine if mouse was not already down', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };

        service.onMouseUp(mouseEventLeftClick);
        expect(drawPolygonSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call drawLine if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseMove(mouseEventLeftClick);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawPolygonSpy).toHaveBeenCalled();
    });

    it("Should Pass through function fillrec since currentBehavior is 'plein sans contour'", () => {
        service.setCurrentBehavior('plein sans contour');
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEventLeftClick);
        service.drawPolygon(baseCtxStub, expectedResult);
        expect(service.currentBehavior).toEqual('plein sans contour');
    });

    it("Should Pass through function fillrec since currentBehavior is 'plein sans contour'", () => {
        service.setCurrentSideNumber(4);
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEventLeftClick);
        service.drawPolygon(baseCtxStub, expectedResult);
        expect(service.currentSidesNumber).toEqual(4);
    });

    it(' on currentBehavior juste contour lineWidth should change to how its set', () => {
        service.currentLineWidth = 3;
        expect(baseCtxStub.lineWidth).not.toEqual(3);
    });

    it(' onMouseMove should not call drawLine if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;
    });
});
