import { TestBed } from '@angular/core/testing';
import { MouseButton } from '@app/enums/mouse-button';
import { canvasTestHelper } from '@classes/canvas-test-helper';
import { Vec2 } from '@classes/vec2';
import { DrawingService } from '@services/drawing/drawing.service';
import { EyedropperService } from './eyedropper.service';

// tslint:disable

describe('EyedropperService', () => {
    let service: EyedropperService;
    let mouseEventLeftClick: MouseEvent;

    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let eyedropperSpy: jasmine.Spy<any>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        baseCtxStub = canvasTestHelper.baseCanvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.previewCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'addInEditStack']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(EyedropperService);
        eyedropperSpy = spyOn<any>(service, 'selectPixelColor').and.callThrough();

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

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEventLeftClick);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should set mouseDown property to true on right click', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 2,
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should set mouseDown property to false on middle click', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 1,
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseUp should call selectPixelColor if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseUp(mouseEventLeftClick);
        expect(eyedropperSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should not call drawLine if mouse was not already down', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };

        service.onMouseUp(mouseEventLeftClick);
        expect(eyedropperSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call drawLine if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseMove(mouseEventLeftClick);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(eyedropperSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawLine if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseMove(mouseEventLeftClick);
        expect(eyedropperSpy).toHaveBeenCalled();
    });

    it("Testing currentPrimaryColor should be this color: '#232323' when you call setPrimaryColor", () => {
        service.setCurrentPrimaryColor('#232323');
        expect(service.currentPrimaryColor).toEqual('#232323');
    });

    it("Testing currentSecondaryColor should be this color: '#565656' when you call setSecondaryColor", () => {
        service.setCurrentSecondaryColor('#565656');
        expect(service.currentSecondaryColor).toEqual('#565656');
    });

    it('Testing the fonction rgbToHex should return proper color in hexadecimal', () => {
        const hex = (service as any).rgbToHex(252, 186, 3);
        expect(hex).toEqual('fcba03');
    });
});
