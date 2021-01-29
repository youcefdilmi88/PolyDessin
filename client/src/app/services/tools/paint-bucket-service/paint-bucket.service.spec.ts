import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@classes/canvas-test-helper';
import { PaintBucketService } from './paint-bucket.service';

// tslint:disable

describe('PaintBucketService', () => {
    let service: PaintBucketService;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        baseCtxStub = canvasTestHelper.baseCanvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.previewCanvas.getContext('2d') as CanvasRenderingContext2D;
        TestBed.configureTestingModule({});
        service = TestBed.inject(PaintBucketService);

        service.drawingService.baseCtx = baseCtxStub;
        service.drawingService.previewCtx = previewCtxStub;
    });

    it('1. should be created', () => {
        expect(service).toBeTruthy();
    });

    it('2. setCurrentTolerance() should set the tolerance correctly', () => {
        service.setCurrentTolerance(18);
        expect(service.tolerance).toBe(18);
    });

    it('3. getPixelColor() should return the right pixel color if x ', () => {
        service.imageData = new ImageData(300, 300);

        service.imageData.data[0] = 127;
        service.imageData.data[1] = 127;
        service.imageData.data[2] = 127;
        service.imageData.data[3] = 255;

        const color = (service as any).getPixelColor(0, 0);

        expect(color).toEqual([127, 127, 127, 255]);
    });

    it('3. getPixelColor() should return the right pixel color', () => {
        service.imageData = new ImageData(300, 300);

        service.imageData.data[0] = 127;
        service.imageData.data[1] = 127;
        service.imageData.data[2] = 127;
        service.imageData.data[3] = 255;

        const color = (service as any).getPixelColor(0, 0);

        expect(color).toEqual([127, 127, 127, 255]);
    });
});
