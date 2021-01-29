import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@classes/canvas-test-helper';
import { Vec2 } from '@classes/vec2';
import { MouseButton } from '@enums/mouse-button';
import { DrawingService } from '@services/drawing/drawing.service';
import { StampService } from './stamp.service';

// tslint:disable

describe('StampService', () => {
    let service: StampService;
    let mouseEvent: MouseEvent;
    let wheelEvent: WheelEvent;
    let wheelEvent2: WheelEvent;
    let wheelEvent3: WheelEvent;
    let wheelEvent4: WheelEvent;

    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let drawImageStampSpy: jasmine.Spy<any>;
    let updateScaleSpy: jasmine.Spy<any>;
    let selectStampSpy: jasmine.Spy<any>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        baseCtxStub = canvasTestHelper.baseCanvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.previewCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'addInEditStack']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(StampService);
        drawImageStampSpy = spyOn<any>(service, 'drawImageStamp').and.callThrough();
        updateScaleSpy = spyOn<any>(service, 'updateScale').and.callThrough();
        selectStampSpy = spyOn<any>(service, 'selectStamp').and.callThrough();

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEvent = {
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
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should set mouseDown property to false on right click', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 1,
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it(' mouseDown should call drawImageStamp if mouse is down', () => {
        service.mouseDown = true;
        service.mouseDownCoord = { x: 0, y: 0 };

        service.onMouseDown(mouseEvent);
        expect(drawImageStampSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should not call drawImageStamp if mouse was not already down', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };

        service.onMouseUp(mouseEvent);
        expect(drawImageStampSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.mouseDown = false;
        service.onMouseMove(mouseEvent);
        expect(service['mousePreviewPos']).toEqual(expectedResult);
    });

    it(' onMouseMove should call drawImageStamp in previewCtx', () => {
        service.mouseDown = false;
        service['mousePreviewPos'] = { x: 0, y: 0 };

        service.onMouseMove(mouseEvent);
        expect(drawImageStampSpy).toHaveBeenCalled();
    });

    it(' setCurrentStamp should set stamp to Étampe 1', () => {
        service.setCurrentStamp('Étampe 1');
        expect(service.currentStamp).toEqual('Étampe 1');
        expect(selectStampSpy).toHaveBeenCalled();
    });

    it(' setCurrentStamp should set stamp to Étampe 2', () => {
        service.setCurrentStamp('Étampe 2');
        expect(service.currentStamp).toEqual('Étampe 2');
        expect(selectStampSpy).toHaveBeenCalled();
    });

    it(' setCurrentStamp should set stamp to Étampe 3', () => {
        service.setCurrentStamp('Étampe 3');
        expect(service.currentStamp).toEqual('Étampe 3');
        expect(selectStampSpy).toHaveBeenCalled();
    });

    it(' setCurrentStamp should set stamp to Étampe 4', () => {
        service.setCurrentStamp('Étampe 4');
        expect(service.currentStamp).toEqual('Étampe 4');
        expect(selectStampSpy).toHaveBeenCalled();
    });

    it(' setCurrentStamp should set stamp to Étampe 5', () => {
        service.setCurrentStamp('Étampe 5');
        expect(service.currentStamp).toEqual('Étampe 5');
        expect(selectStampSpy).toHaveBeenCalled();
    });

    it(' setCurrentScale should set scale to correct value', () => {
        const expectedResult = 2;
        service.setCurrentScale(expectedResult);
        expect(service.currentStampScale).toEqual(expectedResult);
        expect(updateScaleSpy).toHaveBeenCalled();
    });

    it(' initialiseScale should initialise scale to 1', () => {
        service.initialiseScale();
        expect(service.currentStampScale).toEqual(1);
        expect(updateScaleSpy).toHaveBeenCalled();
    });

    it(' currentStampAngle is incremented in mousewheel and deltaY > 0 in mousewheel and deltaY < 0', () => {
        service.currentStampAngle = 0;
        service.onMouseWheel(wheelEvent);
        expect(service.currentStampAngle).toEqual(1);
    });

    it(' currentStampAngle is decremented in mousewheel and deltaY > 0', () => {
        service.currentStampAngle = 0;
        service.onMouseWheel(wheelEvent4);
        expect(service.currentStampAngle).toEqual(-1);
    });

    it(' currentStampAngle is added 15 in mousewheel and deltaY < 0', () => {
        service.currentStampAngle = 0;
        service.onMouseWheel(wheelEvent2);
        expect(service.currentStampAngle).toEqual(15);
    });

    it(' currentStampAngle is removed 15 in mousewheel and deltaY > 0', () => {
        service.currentStampAngle = 0;
        service.onMouseWheel(wheelEvent3);
        expect(service.currentStampAngle).toEqual(-15);
    });
});
