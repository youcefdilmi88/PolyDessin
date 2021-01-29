import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@classes/canvas-test-helper';
import { MouseButton } from '@enums/mouse-button';
import { DrawingService } from '@services/drawing/drawing.service';
import { SelectionEllipseService } from './selection-ellipse.service';

// tslint:disable

describe('SelectionEllipseService', () => {
    let service: SelectionEllipseService;
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
        service = TestBed.inject(SelectionEllipseService);
        drawEllipseSpy = spyOn<any>(service, 'drawEllipse').and.callThrough();

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

    it(' drawPreview should call appropriate drawEllipse and saveSelection', () => {
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

        const strokeSpy = spyOn(previewCtxStub, 'stroke');
        const saveSelectionSpy = spyOn(service, 'saveSelection');

        service.drawPreview(previewCtxStub, mouseEventLeftClick);
        expect(drawEllipseSpy).toHaveBeenCalled();
        expect(strokeSpy).toHaveBeenCalled();
        expect(saveSelectionSpy).toHaveBeenCalled();
    });

    it(' drawSelection should call drawSelectionEllipse if magnetism = true', () => {
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

        spyOn(service, 'drawSelectionEllipse');

        service.drawSelection(previewCtxStub, mouseEventLeftClick);
        expect(service.drawSelectionEllipse).toHaveBeenCalled();
    });

    it(' drawSelection should call drawSelectionEllipse if magnetism = false', () => {
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

        spyOn(service, 'drawSelectionEllipse');

        service.drawSelection(previewCtxStub, mouseEventLeftClick);
        expect(service.drawSelectionEllipse).toHaveBeenCalled();
    });

    it(' clearSelection should call fillStyle, ellipse and fill', () => {
        service.mouseDownCoord = { x: 20, y: 20 };
        service['mousePosition'] = { x: 50, y: 50 };
        service['width'] = 30;
        service['height'] = 30;
        service['selectionMouseDown'] = { x: 10, y: 10 };
        service['mouseUpPosition'] = { x: 50, y: 60 };
        service['newPoint'] = { x: 30, y: 30 };

        const ellipseSpy = spyOn(baseCtxStub, 'ellipse');
        const fillSpy = spyOn(baseCtxStub, 'fill');

        service.clearSelection(baseCtxStub);
        expect(baseCtxStub.fillStyle).toEqual('#ffffff');
        expect(ellipseSpy).toHaveBeenCalled();
        expect(fillSpy).toHaveBeenCalled();
    });

    it(' drawSelectionEllipse should call appropriate ctx functions', () => {
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
        const ellipseSpy = spyOn(baseCtxStub, 'ellipse');
        const clipSpy = spyOn(baseCtxStub, 'clip');

        service.drawSelectionEllipse(baseCtxStub, mouseEventLeftClick, 0, 0);
        expect(saveSpy).toHaveBeenCalled();
        expect(beginPathSpy).toHaveBeenCalled();
        expect(translateSpy).toHaveBeenCalled();
        expect(rotateSpy).toHaveBeenCalled();
        expect(ellipseSpy).toHaveBeenCalled();
        expect(clipSpy).toHaveBeenCalled();
        expect(restoreSpy).toHaveBeenCalled();
        expect(drawImageSpy).toHaveBeenCalled();
        expect(restoreSpy).toHaveBeenCalled();
    });
});
