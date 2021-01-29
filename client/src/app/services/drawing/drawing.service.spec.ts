import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@classes/canvas-test-helper';
import { DrawingService } from './drawing.service';

// tslint:disable

describe('DrawingService', () => {
    let service: DrawingService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawingService);

        service.baseCanvas = canvasTestHelper.baseCanvas;
        service.previewCanvas = canvasTestHelper.previewCanvas;
        service.baseCtx = canvasTestHelper.baseCanvas.getContext('2d') as CanvasRenderingContext2D;
        service.previewCtx = canvasTestHelper.previewCanvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should clear the whole canvas', () => {
        service.clearCanvas(service.baseCtx);
        const pixelBuffer = new Uint32Array(service.baseCtx.getImageData(0, 0, service.baseCanvas.width, service.baseCanvas.height).data.buffer);
        const hasColoredPixels = pixelBuffer.some((color) => color !== 0);
        expect(hasColoredPixels).toEqual(false);
    });

    it("Testing currentBehavior should be 'contour seulement'", () => {
        expect(service.id).toEqual(0);
        expect(service.editStack.length).toEqual(0);
    });

    it("Testing currentBehavior should be 'contour seulement'", () => {
        service.id = 2;
        service.addInEditStack();
        expect(service.id).toEqual(3);
        expect(service.editStack.length).toEqual(1);
        service.clearEditStack();
        expect(service.editStack.length).toEqual(0);
    });
});
