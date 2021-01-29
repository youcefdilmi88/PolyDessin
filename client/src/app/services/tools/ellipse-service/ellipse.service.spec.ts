import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@classes/canvas-test-helper';
import { Vec2 } from '@classes/vec2';
import { MouseButton } from '@enums/mouse-button';
import { DrawingService } from '@services/drawing/drawing.service';
import { EllipseService } from './ellipse.service';

// tslint:disable

describe('EllipseService', () => {
    let service: EllipseService;
    let mouseEventLeftClick: MouseEvent;

    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let drawEllipseSpy: jasmine.Spy<any>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        baseCtxStub = canvasTestHelper.baseCanvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.previewCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'addInEditStack']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(EllipseService);
        drawEllipseSpy = spyOn<any>(service, 'drawEllipse').and.callThrough();

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

    it("Testing currentBehavior should be 'Contour seulement'", () => {
        service.setCurrentBehavior('Contour seulement');
        expect((service as any).currentBehavior).toEqual('Contour seulement');
    });

    it("Testing the fonction setCurrentValue should be 'Plein sans contour'", () => {
        service.setCurrentBehavior('Plein sans contour');
        expect((service as any).currentBehavior).toEqual('Plein sans contour');
    });

    it("Testing the fonction setCurrentValue should be 'Plein avec contour'", () => {
        service.setCurrentBehavior('Plein avec contour');
        expect((service as any).currentBehavior).toEqual('Plein avec contour');
    });

    it("Testing the fonction setCurrentValue should be 'Contour seulement'", () => {
        service.setCurrentBehavior('Plein sans contour');
        service.setCurrentBehavior('Contour seulement');
        expect((service as any).currentBehavior).toEqual('Contour seulement');
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
        expect(drawEllipseSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should not call drawLine if mouse was not already down', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };

        service.onMouseUp(mouseEventLeftClick);
        expect(drawEllipseSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call drawLine if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseMove(mouseEventLeftClick);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawEllipseSpy).toHaveBeenCalled();
    });

    it(' on shift width should equal height for currentBehavior for coontour shape', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEventLeftClick);
        (service as any).drawEllipse(baseCtxStub, expectedResult, mouseEventLeftClick);
        expect((service as any).radianX).toEqual((service as any).radianY);
    });

    it(' on shift width should equal height for currentBehavior for filled shape', () => {
        const expectedResult: Vec2 = { x: 25, y: 28 };
        service.onMouseDown(mouseEventLeftClick);
        (service as any).drawEllipse(baseCtxStub, expectedResult, mouseEventLeftClick);
        expect((service as any).radianX).not.toEqual((service as any).radianY);
    });

    it(' on shift width should NOT equal height for currentBehavior for filled shape', () => {
        const expectedResult: Vec2 = { x: 25, y: 28 };
        service.onMouseDown(mouseEventLeftClick);
        (service as any).drawEllipse(baseCtxStub, expectedResult, mouseEventLeftClick);
        expect((service as any).radianX).not.toEqual((service as any).radianY);
    });

    it("Should Pass through function fillrec since currentBehavior is 'Plein sans contour'", () => {
        service.setCurrentBehavior('Plein sans contour');
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEventLeftClick);
        (service as any).drawEllipse(baseCtxStub, expectedResult, mouseEventLeftClick);
        expect((service as any).currentBehavior).toEqual('Plein sans contour');
    });

    it(' on currentBehavior juste contour lineWidth should change to how its set', () => {
        service.currentLineWidth = 3;
        expect(baseCtxStub.lineWidth).not.toEqual(3);
    });

    it(' onMouseMove should not call drawLine if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;

        service.onMouseMove(mouseEventLeftClick);
        expect(drawingServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawEllipseSpy).not.toHaveBeenCalled();
    });
});
