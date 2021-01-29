import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@classes/canvas-test-helper';
import { MouseButton } from '@enums/mouse-button';
import { DrawingService } from '@services/drawing/drawing.service';
import { SelectionRectangleService } from './selection-rectangle.service';

// tslint:disable

describe('SelectionRectangleService', () => {
    let service: SelectionRectangleService;
    let mouseEventLeftClick: MouseEvent;

    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        baseCtxStub = canvasTestHelper.baseCanvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.previewCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(SelectionRectangleService);

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEventLeftClick = {
            offsetX: 100,
            offsetY: 100,
            button: MouseButton.Left,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' drawPreview should call appropriate functions', () => {
        service['drawingService'].baseCanvas = document.createElement('canvas') as HTMLCanvasElement;
        service['drawingService'].baseCanvas.width = 30;
        service['drawingService'].baseCanvas.height = 30;

        service.mouseDownCoord = { x: 20, y: 20 };
        service['mousePosition'] = { x: 50, y: 50 };
        service['width'] = 30;
        service['height'] = 30;
        service['selectionMouseDown'] = { x: 10, y: 10 };
        service['mouseUpPosition'] = { x: 50, y: 60 };
        service['newPoint'] = { x: 30, y: 30 };

        const beginPathSpy = spyOn(previewCtxStub, 'beginPath');
        const setLineDashSpy = spyOn(previewCtxStub, 'setLineDash');
        const strokeRectSpy = spyOn(previewCtxStub, 'strokeRect');

        service.drawPreview(previewCtxStub, mouseEventLeftClick);
        expect(beginPathSpy).toHaveBeenCalled();
        expect(setLineDashSpy).toHaveBeenCalled();
        expect(strokeRectSpy).toHaveBeenCalledWith(20, 20, 30, 30);
        expect(setLineDashSpy).toHaveBeenCalled();
    });

    it(' drawSelection should call drawSelectionRectangle and computeMagnets if isMagnetism = true', () => {
        service.selectionData = document.createElement('canvas') as HTMLCanvasElement;
        service.selectionData.width = 30;
        service.selectionData.height = 30;

        service.mouseDownCoord = { x: 20, y: 20 };
        service['mousePosition'] = { x: 50, y: 50 };
        service['width'] = 30;
        service['height'] = 30;
        service['selectionMouseDown'] = { x: 10, y: 10 };
        service['mouseUpPosition'] = { x: 50, y: 60 };
        service['newPoint'] = { x: 30, y: 30 };

        service.isMagnetismOn = true;

        spyOn(service, 'drawSelectionRectangle');

        service.drawSelection(previewCtxStub, mouseEventLeftClick);
        expect(service.drawSelectionRectangle).toHaveBeenCalled();
    });

    it(' drawSelection should call drawSelectionRectangle if isMagnetism = false', () => {
        service.selectionData = document.createElement('canvas') as HTMLCanvasElement;
        service.selectionData.width = 30;
        service.selectionData.height = 30;

        service.mouseDownCoord = { x: 20, y: 20 };
        service['mousePosition'] = { x: 50, y: 50 };
        service['width'] = 30;
        service['height'] = 30;
        service['selectionMouseDown'] = { x: 10, y: 10 };
        service['mouseUpPosition'] = { x: 50, y: 60 };
        service['newPoint'] = { x: 30, y: 30 };

        service.isMagnetismOn = false;

        spyOn(service, 'drawSelectionRectangle');

        service.drawSelection(previewCtxStub, mouseEventLeftClick);
        expect(service.drawSelectionRectangle).toHaveBeenCalled();
    });

    it(' clearSelection should call fillStyle and fillRect', () => {
        service.mouseDownCoord = { x: 20, y: 20 };
        service['mousePosition'] = { x: 50, y: 50 };
        service['selectionWidth'] = 30;
        service['selectionHeight'] = 30;
        service['selectionMouseDown'] = { x: 10, y: 10 };
        service['mouseUpPosition'] = { x: 50, y: 60 };
        service['newPoint'] = { x: 30, y: 30 };

        const fillrectSpy = spyOn(baseCtxStub, 'fillRect');
        service.clearSelection(baseCtxStub);
        expect(baseCtxStub.fillStyle).toEqual('#ffffff');
        expect(fillrectSpy).toHaveBeenCalledWith(30, 30, 30, 30);
    });

    it(' drawSelectionRectangle should call appropriate ctx functions', () => {
        service.selectionData = document.createElement('canvas') as HTMLCanvasElement;
        service.selectionData.width = 30;
        service.selectionData.height = 30;

        service.mouseDownCoord = { x: 20, y: 20 };
        service['mousePosition'] = { x: 50, y: 50 };
        service['width'] = 30;
        service['height'] = 30;
        service['selectionMouseDown'] = { x: 10, y: 10 };
        service['mouseUpPosition'] = { x: 50, y: 60 };
        service['newPoint'] = { x: 30, y: 30 };

        const saveSpy = spyOn(baseCtxStub, 'save');
        const beginPathSpy = spyOn(baseCtxStub, 'beginPath');
        const translateSpy = spyOn(baseCtxStub, 'translate');
        const rotateSpy = spyOn(baseCtxStub, 'rotate');
        const drawImageSpy = spyOn(baseCtxStub, 'drawImage');
        const restoreSpy = spyOn(baseCtxStub, 'restore');

        service.drawSelectionRectangle(baseCtxStub, mouseEventLeftClick, 0, 0);
        expect(saveSpy).toHaveBeenCalled();
        expect(beginPathSpy).toHaveBeenCalled();
        expect(translateSpy).toHaveBeenCalled();
        expect(rotateSpy).toHaveBeenCalled();
        expect(drawImageSpy).toHaveBeenCalled();
        expect(restoreSpy).toHaveBeenCalled();
    });
});
