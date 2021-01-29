import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@classes/canvas-test-helper';
import { Vec2 } from '@classes/vec2';
import { MouseButton } from '@enums/mouse-button';
import { DrawingService } from '@services/drawing/drawing.service';
import { BrushService } from './brush.service';

// tslint:disable

describe('BrushService', () => {
    let service: BrushService;
    let mouseEventLeftClick: MouseEvent;

    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let drawBrushLineSpy: jasmine.Spy<any>;
    let drawBrushLine1Spy: jasmine.Spy<any>;
    let drawBrushLine2Spy: jasmine.Spy<any>;
    let drawBrushLine3Spy: jasmine.Spy<any>;
    let drawBrushLine4Spy: jasmine.Spy<any>;
    let drawBrushLine5Spy: jasmine.Spy<any>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        baseCtxStub = canvasTestHelper.baseCanvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.previewCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'addInEditStack']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(BrushService);

        drawBrushLineSpy = spyOn<any>(service, 'drawBrushLine').and.callThrough();
        drawBrushLine1Spy = spyOn<any>(service, 'drawBrushLine1').and.callThrough();
        drawBrushLine2Spy = spyOn<any>(service, 'drawBrushLine2').and.callThrough();
        drawBrushLine3Spy = spyOn<any>(service, 'drawBrushLine3').and.callThrough();
        drawBrushLine4Spy = spyOn<any>(service, 'drawBrushLine4').and.callThrough();
        drawBrushLine5Spy = spyOn<any>(service, 'drawBrushLine5').and.callThrough();

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

    it(' onMouseUp should call drawBrushLine if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseUp(mouseEventLeftClick);
        expect(drawBrushLineSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should not call drawBrushLine if mouse was not already down', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };

        service.onMouseUp(mouseEventLeftClick);
        expect(drawBrushLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call drawBrushLine if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseMove(mouseEventLeftClick);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawBrushLineSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawBrushLine if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;

        service.onMouseMove(mouseEventLeftClick);
        expect(drawingServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawBrushLineSpy).not.toHaveBeenCalled();
    });

    it(' drawBrushLine should call drawBrushLine 1', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.setCurrentTexture('Texture 1');
        service.currentTexture = 'Texture 1';

        service.onMouseMove(mouseEventLeftClick);
        expect(drawBrushLine1Spy).toHaveBeenCalled();
    });

    it(' drawBrushLine should call drawBrushLine 2', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.setCurrentTexture('Texture 2');
        service.currentTexture = 'Texture 2';

        service.onMouseMove(mouseEventLeftClick);
        expect(drawBrushLine2Spy).toHaveBeenCalled();
    });

    it(' drawBrushLine should call drawBrushLine 3', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.setCurrentTexture('Texture 3');
        service.currentTexture = 'Texture 3';

        service.onMouseMove(mouseEventLeftClick);
        expect(drawBrushLine3Spy).toHaveBeenCalled();
    });

    it(' drawBrushLine should call drawBrushLine 4', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.setCurrentTexture('Texture 4');
        service.currentTexture = 'Texture 4';

        service.onMouseMove(mouseEventLeftClick);
        expect(drawBrushLine4Spy).toHaveBeenCalled();
    });

    it(' drawBrushLine should call drawBrushLine 5', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.setCurrentTexture('Texture 5');
        service.currentTexture = 'Texture 5';

        service.onMouseMove(mouseEventLeftClick);
        expect(drawBrushLine5Spy).toHaveBeenCalled();
    });

    // Exemple de test d'intégration qui est quand même utile
    it(' should change the pixel of the canvas ', () => {
        mouseEventLeftClick = { offsetX: 0, offsetY: 0, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEventLeftClick);
        mouseEventLeftClick = { offsetX: 1, offsetY: 0, button: 0 } as MouseEvent;
        service.onMouseUp(mouseEventLeftClick);

        // // Premier pixel seulement
        // const imageData: ImageData = baseCtxStub.getImageData(0, 0, 1, 1);
        // expect(imageData.data[0]).toEqual(0); // R
        // expect(imageData.data[1]).toEqual(0); // G
        // expect(imageData.data[2]).toEqual(0); // B
        // // tslint:disable-next-line:no-magic-numbers
        // expect(imageData.data[3]).not.toEqual(0); // A
    });
});
