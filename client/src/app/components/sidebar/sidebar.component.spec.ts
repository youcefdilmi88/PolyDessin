import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { SidebarComponent } from './sidebar.component';

// tslint:disable

class MatDialogStub {
    result: boolean = true;

    setResult(val: boolean): void {
        this.result = val;
    }

    open(): any {
        return { afterClosed: () => of(this.result) };
    }
}
const GRID_SQUARE_SIZE_STUB = 25;
const DECREASED_GRID_SQUARE_SIZE = 20;
const INCREASED_GRID_SQUARE_SIZE = 30;

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    const dialogStub = new MatDialogStub();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SidebarComponent],
            providers: [{ provide: MatDialog, useValue: dialogStub }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeDefined();
    });

    it('onKeyDown() should not call function if a dialog is opened', () => {
        component.isDialogOpened = true;
        const keyboardEventG = {
            key: 'g',
        } as KeyboardEvent;
        const keyboardEventE = {
            key: 'e',
        } as KeyboardEvent;
        const openExportDialogSpy = spyOn(component, 'openExportDialog');
        component.onKeydown(keyboardEventE);
        expect(openExportDialogSpy).not.toHaveBeenCalled();
        const handleClickToggleGridSpy = spyOn(component, 'handleClickToggleGrid');
        component.onKeydown(keyboardEventG);
        expect(handleClickToggleGridSpy).not.toHaveBeenCalled();
    });

    it('onKeyDown() should call corresponding function when CTRL+key is pressed', () => {
        component.isDialogOpened = false;
        const keyboardEventCTRLG = {
            key: 'g',
            ctrlKey: true,
        } as KeyboardEvent;
        const openCarrouselDialogSpy = spyOn(component, 'openCarrouselDialog');
        component.onKeydown(keyboardEventCTRLG);
        expect(openCarrouselDialogSpy).toHaveBeenCalled();
    });

    it('onKeyDown() should call corresponding function when only key is pressed', () => {
        component.isDialogOpened = false;
        const keyboardEventG = {
            key: 'g',
        } as KeyboardEvent;
        const handleClickToggleGridSpy = spyOn(component as any, 'handleClickToggleGrid');
        component.onKeydown(keyboardEventG);
        expect(handleClickToggleGridSpy).toHaveBeenCalled();
    });

    it("decreaseGridSquareSize should decrease toolManagerService's currentGridSquareSize attribute", () => {
        component.toolManagerService.currentGridSquareSize = GRID_SQUARE_SIZE_STUB;
        component.decreaseGridSquareSize();
        expect(component.toolManagerService.currentGridSquareSize).toEqual(DECREASED_GRID_SQUARE_SIZE);
    });

    it("increaseGridSquareSize should increase toolManagerService's currentGridSquareSize attribute", () => {
        component.toolManagerService.currentGridSquareSize = GRID_SQUARE_SIZE_STUB;
        component.increaseGridSquareSize();
        expect(component.toolManagerService.currentGridSquareSize).toEqual(INCREASED_GRID_SQUARE_SIZE);
    });
});
