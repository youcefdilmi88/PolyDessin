import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderChange } from '@angular/material/slider';
import { SidebarToolStateComponent } from './sidebar-tool-state.component';

const GRID_SQUARE_SIZE_STUB = 50;
const GRID_OPACITY_STUB = 50;

describe('SidebarToolStateComponent', () => {
    let component: SidebarToolStateComponent;
    let fixture: ComponentFixture<SidebarToolStateComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SidebarToolStateComponent],
            imports: [MatMenuModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarToolStateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("handleGridSquareSizeSelection should modify toolManagerService's currentGridSquareSize attribute", () => {
        const matSliderChange = {
            value: 50,
        } as MatSliderChange;
        component.handleGridSquareSizeSelection(matSliderChange);
        expect(component.toolManagerService.currentGridSquareSize).toEqual(GRID_SQUARE_SIZE_STUB);
    });
    it("handleGridOpacitySelection should modify toolManagerService's currentGridOpacity attribute", () => {
        const matSliderChange = {
            value: 50,
        } as MatSliderChange;
        component.handleGridOpacitySelection(matSliderChange);
        expect(component.toolManagerService.currentGridOpacity).toEqual(GRID_OPACITY_STUB);
    });
});
