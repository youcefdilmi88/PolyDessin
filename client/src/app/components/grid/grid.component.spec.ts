import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@classes/canvas-test-helper';
import { GridComponent } from './grid.component';

const CANVAS_DIMENSION_STUB = 100;
const GRID_SQUARE_SIZE_STUB = 30;
const GRID_OPACITY_STUB = 50;
const OFFSET_ARRAY_SIZE_STUB = 3;

describe('GridComponent', () => {
    let component: GridComponent;
    let fixture: ComponentFixture<GridComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [GridComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GridComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('verticalLineArray() should return the correct amount of line offsets', () => {
        component.drawingService.baseCanvas = canvasTestHelper.baseCanvas;
        component.drawingService.baseCanvas.width = CANVAS_DIMENSION_STUB;
        component.toolManagerService.currentGridSquareSize = GRID_SQUARE_SIZE_STUB;
        const offsets = component.verticalLineArray();
        expect(offsets.length).toEqual(OFFSET_ARRAY_SIZE_STUB);
        expect(offsets[0]).toEqual('30px');
        expect(offsets[1]).toEqual('60px');
        expect(offsets[2]).toEqual('90px');
    });

    it('horizontalLineArray() should return the correct amount of line offsets', () => {
        component.drawingService.baseCanvas = canvasTestHelper.baseCanvas;
        component.drawingService.baseCanvas.height = CANVAS_DIMENSION_STUB;
        component.toolManagerService.currentGridSquareSize = GRID_SQUARE_SIZE_STUB;
        const offsets = component.horizontalLineArray();
        expect(offsets.length).toEqual(OFFSET_ARRAY_SIZE_STUB);
        expect(offsets[0]).toEqual('30px');
        expect(offsets[1]).toEqual('60px');
        expect(offsets[2]).toEqual('90px');
    });

    it("getHorizontalLineLength() should return canva's width", () => {
        component.drawingService.baseCanvas = canvasTestHelper.baseCanvas;
        component.drawingService.baseCanvas.width = CANVAS_DIMENSION_STUB;
        const canvasWidth = component.getHorizontalLineLength();
        expect(canvasWidth).toEqual('100px');
    });

    it("getVerticalLineLength() should return canva's height", () => {
        component.drawingService.baseCanvas = canvasTestHelper.baseCanvas;
        component.drawingService.baseCanvas.height = CANVAS_DIMENSION_STUB;
        const canvasHeight = component.getVerticalLineLength();
        expect(canvasHeight).toEqual('100px');
    });

    it("getGridOpacity() should return toolManagerService's currentGridOpacity percentage", () => {
        component.toolManagerService.currentGridOpacity = GRID_OPACITY_STUB;
        const gridOpacity = component.getGridOpacity();
        expect(gridOpacity).toEqual('50%');
    });
});
