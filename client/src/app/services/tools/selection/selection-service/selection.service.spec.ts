import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@classes/canvas-test-helper';
import { MouseButton } from '@enums/mouse-button';
import { DrawingService } from '@services/drawing/drawing.service';
import { SelectionService } from './selection.service';

// tslint:disable

describe('SelectionService', () => {
    let service: SelectionService;
    let mouseEventLeftClick: MouseEvent;
    let wheelEvent: WheelEvent;
    let wheelEvent2: WheelEvent;
    let wheelEvent3: WheelEvent;
    let wheelEvent4: WheelEvent;
    let keyBoardEvent: KeyboardEvent;

    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let drawSelectionSpy: jasmine.Spy<any>;
    let clearSelectionSpy: jasmine.Spy<any>;
    let saveSelectionSpy: jasmine.Spy<any>;
    let drawBoxSpy: jasmine.Spy<any>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        baseCtxStub = canvasTestHelper.baseCanvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.previewCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'addInEditStack']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(SelectionService);

        drawSelectionSpy = spyOn<any>(service, 'drawSelection').and.callThrough();
        clearSelectionSpy = spyOn<any>(service, 'clearSelection');
        saveSelectionSpy = spyOn<any>(service, 'saveSelection');
        drawBoxSpy = spyOn<any>(service, 'drawBox').and.callThrough();

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEventLeftClick = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;

        mouseEventLeftClick = {
            offsetX: 35,
            offsetY: 35,
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

    it(' Mouse down should return dragged = false if checkIsDraggable = false', () => {
        service.mouseDown = true;

        service['selectionMouseDown'] = { x: 10, y: 10 };
        service['mouseUpPosition'] = { x: 50, y: 60 };
        service['newPoint'] = { x: 30, y: 30 };
        service['selectionWidth'] = 20;
        service['selectionHeight'] = 20;

        service.onMouseDown(mouseEventLeftClick);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(service['isDragged']).toEqual(false);
    });

    it(' Mouse Up should drawSelection, drawBox and saveSelection if dragged = true', () => {
        service.mouseDown = true;
        service['isDragged'] = true;

        service.selectionData = document.createElement('canvas') as HTMLCanvasElement;
        service.selectionData.width = 30;
        service.selectionData.height = 30;
        service.mouseDownCoord = { x: 25, y: 25 };

        service['selectionMouseDown'] = { x: 10, y: 10 };
        service['mouseUpPosition'] = { x: 50, y: 60 };
        service['newPoint'] = { x: 30, y: 30 };
        service['selectionWidth'] = 20;
        service['selectionHeight'] = 20;

        service.onMouseUp(mouseEventLeftClick);

        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawSelectionSpy).toHaveBeenCalled();
        expect(saveSelectionSpy).toHaveBeenCalled();
    });

    it(' Mouse Up should drawBox and drawPreview if isDraggable = false', () => {
        service.mouseDown = true;
        service['isDraggable'] = false;

        service.selectionData = document.createElement('canvas') as HTMLCanvasElement;
        service.selectionData.width = 30;
        service.selectionData.height = 30;

        service['mousePosition'] = { x: 30, y: 30 };
        service.mouseDownCoord = { x: 25, y: 25 };
        service['selectionMouseDown'] = { x: 10, y: 10 };
        service['mouseUpPosition'] = { x: 50, y: 60 };
        service['newPoint'] = { x: 30, y: 30 };
        service['selectionWidth'] = 20;
        service['selectionHeight'] = 20;

        service.onMouseUp(mouseEventLeftClick);

        expect(drawBoxSpy).toHaveBeenCalled();
    });

    it(' Mouse Move should drawSelection and clearSelection if isDraggable = true', () => {
        service.mouseDown = true;
        service['isDraggable'] = true;

        service.selectionData = document.createElement('canvas') as HTMLCanvasElement;
        service.selectionData.width = 30;
        service.selectionData.height = 30;
        service.mouseDownCoord = { x: 25, y: 25 };

        service['selectionMouseDown'] = { x: 10, y: 10 };
        service['mouseUpPosition'] = { x: 50, y: 60 };
        service['newPoint'] = { x: 30, y: 30 };
        service['selectionWidth'] = 20;
        service['selectionHeight'] = 20;

        service.onMouseMove(mouseEventLeftClick);

        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawSelectionSpy).toHaveBeenCalled();
        expect(clearSelectionSpy).toHaveBeenCalled();
        expect(service['isDragged']).toEqual(true);
    });

    it(' Mouse Move should drawPreview if isDraggable = false', () => {
        service.mouseDown = true;
        service['isDraggable'] = false;

        service.selectionData = document.createElement('canvas') as HTMLCanvasElement;
        service.selectionData.width = 30;
        service.selectionData.height = 30;
        service.mouseDownCoord = { x: 25, y: 25 };

        service['selectionMouseDown'] = { x: 10, y: 10 };
        service['mouseUpPosition'] = { x: 50, y: 60 };
        service['newPoint'] = { x: 30, y: 30 };
        service['selectionWidth'] = 20;
        service['selectionHeight'] = 20;

        service.onMouseMove(mouseEventLeftClick);

        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();

        expect(service['isDragged']).toEqual(false);
    });

    // Tests Keypress

    it(' Escape onKeypress should return mouseDown = false, isDraggable = false when pressed', () => {
        service['selectionMouseDown'] = { x: service['selectionMiddle'].x, y: service['selectionMiddle'].y };
        keyBoardEvent = {
            key: 'Escape',
        } as KeyboardEvent;
        service.onKeyPress(keyBoardEvent);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(service.mouseDown).toEqual(false);
        expect(service['isDraggable']).toEqual(false);
    });

    it(' Magnetisme onKeypress = m should return isMagnetisme = true is magnetisme was not on', () => {
        service['selectionMouseDown'] = { x: service['selectionMiddle'].x, y: service['selectionMiddle'].y };
        keyBoardEvent = {
            key: 'm',
        } as KeyboardEvent;
        service.isMagnetismOn = false;
        service.onKeyPress(keyBoardEvent);
        expect(service.isMagnetismOn).toEqual(true);
    });

    it(' Magnetisme onKeypress = m should return isMagnetisme = false is magnetisme was on', () => {
        service['selectionMouseDown'] = { x: service['selectionMiddle'].x, y: service['selectionMiddle'].y };
        keyBoardEvent = {
            key: 'm',
        } as KeyboardEvent;
        service.isMagnetismOn = true;
        service.onKeyPress(keyBoardEvent);
        expect(service.isMagnetismOn).toEqual(false);
    });

    it(' if ArrowkeyRight is pressed, expect clearSelection and drawSelection to have been called', () => {
        service['selectionMouseDown'] = { x: service['selectionMiddle'].x, y: service['selectionMiddle'].y };
        keyBoardEvent = {
            key: 'ArrowRight',
        } as KeyboardEvent;
        service.onKeyPress(keyBoardEvent);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(clearSelectionSpy).toHaveBeenCalled();
        expect(drawSelectionSpy).toHaveBeenCalled();
    });

    it(' if ArrowkeyLeft is pressed, expect clearSelection and drawSelection to have been called', () => {
        service['selectionMouseDown'] = { x: service['selectionMiddle'].x, y: service['selectionMiddle'].y };
        keyBoardEvent = {
            key: 'ArrowLeft',
        } as KeyboardEvent;
        service.onKeyPress(keyBoardEvent);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(clearSelectionSpy).toHaveBeenCalled();
        expect(drawSelectionSpy).toHaveBeenCalled();
    });

    it(' if ArrowkeyUp is pressed, expect clearSelection and drawSelection to have been called', () => {
        service['selectionMouseDown'] = { x: service['selectionMiddle'].x, y: service['selectionMiddle'].y };
        keyBoardEvent = {
            key: 'ArrowUp',
        } as KeyboardEvent;
        service.onKeyPress(keyBoardEvent);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(clearSelectionSpy).toHaveBeenCalled();
        expect(drawSelectionSpy).toHaveBeenCalled();
    });

    it(' if ArrowkeyDown is pressed, expect clearSelection and drawSelection to have been called', () => {
        service['selectionMouseDown'] = { x: service['selectionMiddle'].x, y: service['selectionMiddle'].y };
        keyBoardEvent = {
            key: 'ArrowDown',
        } as KeyboardEvent;
        service.onKeyPress(keyBoardEvent);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(clearSelectionSpy).toHaveBeenCalled();
        expect(drawSelectionSpy).toHaveBeenCalled();
    });

    // Tests Rotation

    it(' currentSelectionAngle is incremented in mousewheel and deltaY > 0 in mousewheel and deltaY < 0', () => {
        service.currentSelectionAngle = 0;
        service.onMouseWheel(wheelEvent);
        expect(service.currentSelectionAngle).toEqual(1);
    });

    it(' currentSelectionAngle is decremented in mousewheel and deltaY > 0', () => {
        service.currentSelectionAngle = 0;
        service.onMouseWheel(wheelEvent4);
        expect(service.currentSelectionAngle).toEqual(-1);
    });

    it(' currentSelectionAngle is added 15 in mousewheel and deltaY < 0', () => {
        service.currentSelectionAngle = 0;
        service.onMouseWheel(wheelEvent2);
        expect(service.currentSelectionAngle).toEqual(15);
    });

    it('currentSelectionAngle is removed 15 in mousewheel and deltaY > 0', () => {
        service.currentSelectionAngle = 0;
        service.onMouseWheel(wheelEvent3);
        expect(service.currentSelectionAngle).toEqual(-15);
    });

    // Test Magnetisme

    it(' ComputeMagnetTopCorner should return proper coordinates', () => {
        service.currentMagnetAnchor = 0;

        const x = service.computeMagnetTopCorner(mouseEventLeftClick);
        expect(x).toEqual(mouseEventLeftClick);
    });

    it(' ComputeMagnetTopCorner should return proper coordinates', () => {
        service.currentMagnetAnchor = 1;
        service['selectionWidth'] = 40;
        service['selectionHeight'] = 40;

        const x = service.computeMagnetTopCorner({ x: 35, y: 35 });
        expect(x).toEqual({ x: 15, y: 35 });
    });

    it(' ComputeMagnetTopCorner should return proper coordinates', () => {
        service.currentMagnetAnchor = 2;
        service['selectionWidth'] = 40;
        service['selectionHeight'] = 40;

        const x = service.computeMagnetTopCorner({ x: 35, y: 35 });
        expect(x).toEqual({ x: -5, y: 35 });
    });

    it(' ComputeMagnetTopCorner should return proper coordinates', () => {
        service.currentMagnetAnchor = 3;
        service['selectionWidth'] = 40;
        service['selectionHeight'] = 40;

        const x = service.computeMagnetTopCorner({ x: 35, y: 35 });
        expect(x).toEqual({ x: 35, y: 15 });
    });

    it(' ComputeMagnetTopCorner should return proper coordinates', () => {
        service.currentMagnetAnchor = 4;
        service['selectionWidth'] = 40;
        service['selectionHeight'] = 40;

        const x = service.computeMagnetTopCorner({ x: 35, y: 35 });
        expect(x).toEqual({ x: 15, y: 15 });
    });

    it(' ComputeMagnetTopCorner should return proper coordinates', () => {
        service.currentMagnetAnchor = 5;
        service['selectionWidth'] = 40;
        service['selectionHeight'] = 40;

        const x = service.computeMagnetTopCorner({ x: 35, y: 35 });
        expect(x).toEqual({ x: -5, y: 15 });
    });

    it(' ComputeMagnetTopCorner should return proper coordinates', () => {
        service.currentMagnetAnchor = 6;
        service['selectionWidth'] = 40;
        service['selectionHeight'] = 40;

        const x = service.computeMagnetTopCorner({ x: 35, y: 35 });
        expect(x).toEqual({ x: 35, y: -5 });
    });

    it(' ComputeMagnetTopCorner should return proper coordinates', () => {
        service.currentMagnetAnchor = 7;
        service['selectionWidth'] = 40;
        service['selectionHeight'] = 40;

        const x = service.computeMagnetTopCorner({ x: 35, y: 35 });
        expect(x).toEqual({ x: 15, y: -5 });
    });

    it(' ComputeMagnetTopCorner should return proper coordinates', () => {
        service.currentMagnetAnchor = 8;
        service['selectionWidth'] = 40;
        service['selectionHeight'] = 40;

        const x = service.computeMagnetTopCorner({ x: 35, y: 35 });
        expect(x).toEqual({ x: -5, y: -5 });
    });

    it(' ComputeMagnetTopCorner should return proper coordinates', () => {
        service.currentMagnetAnchor = 9;
        service['selectionWidth'] = 40;
        service['selectionHeight'] = 40;

        const x = service.computeMagnetTopCorner({ x: 35, y: 35 });
        expect(x).toEqual({ x: 0, y: 0 });
    });
});
