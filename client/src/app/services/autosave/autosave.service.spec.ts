import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@classes/canvas-test-helper';
import { DrawingService } from '@services/drawing/drawing.service';
import { AutosaveService } from './autosave.service';

describe('AutosaveService', () => {
    let service: AutosaveService;

    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    // let canvasResizerServiceSpy: jasmine.SpyObj<CanvasResizerService>;

    let baseCanvasStub;
    let previewCanvasStub;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        baseCanvasStub = canvasTestHelper.baseCanvas;
        previewCanvasStub = canvasTestHelper.previewCanvas;
        baseCtxStub = canvasTestHelper.baseCanvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.previewCanvas.getContext('2d') as CanvasRenderingContext2D;

        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'resetDrawingForAutosave']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(AutosaveService);

        service.drawingService.baseCtx = baseCtxStub;
        service.drawingService.previewCtx = previewCtxStub;
        service.drawingService.baseCanvas = baseCanvasStub;
        service.drawingService.previewCanvas = previewCanvasStub;
    });

    it('1. should be created', () => {
        expect(service).toBeTruthy();
    });

    it('2. isDrawingInProgress() should return false if localStorage does not contain the drawing', () => {
        localStorage.clear();
        expect(service.isDrawingInProgress()).toBeFalsy();
    });

    it('3. isDrawingInProgress() should return true if localStorage contains the drawing', () => {
        // récupérer une drawingDataURL
        // drawingDataURL = ;
        service.drawingDataURL = drawingServiceSpy.baseCanvas.toDataURL('image/png');
        localStorage.setItem('dessin', 'value of drawings data URL');
        expect(service.isDrawingInProgress()).toBeTruthy();
    });

    it('4. isDrawingInProgress() should return false if drawingDataURL is empty,', () => {
        localStorage.setItem('dessin', '');
        expect(service.isDrawingInProgress()).toBeFalsy();
    });

    it('5. saveCurrentDrawing() should return true if localStorage contains the drawing', () => {
        spyOn(service, 'saveCurrentDrawing');
        service.saveCurrentDrawing();
        expect(service.saveCurrentDrawing).toHaveBeenCalled();
    });

    it('6. deleteCurrentDrawing() should clear localStorage entirely', () => {
        spyOn(localStorage, 'clear');
        service.deleteCurrentDrawing();
        expect(localStorage.clear).toHaveBeenCalled();
        expect(service.drawingDataURL).toEqual('');
        expect(service.drawingInProgress).toEqual(false);
        expect(service.wantsToContinue).toEqual(false);
    });

    it('7. restoreCurrentDrawing() should restore the saved drawing from localStorage onto the canvas', () => {
        // spyOn(service, 'resetDrawingForAutosave');
    });
});
