import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorPaletteComponent } from './color-palette.component';

// tslint:disable: no-any

describe('ColorPaletteComponent', () => {
    let component: ColorPaletteComponent;
    let fixture: ComponentFixture<ColorPaletteComponent>;
    let mouseEvent: MouseEvent;
    let emitColorSpy: jasmine.Spy<any>;
    let drawSpy: jasmine.Spy<any>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ColorPaletteComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorPaletteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        mouseEvent = { offsetX: 25, offsetY: 25, button: 0 } as MouseEvent;
        emitColorSpy = spyOn<any>(component, 'emitColor').and.callThrough();
        drawSpy = spyOn<any>(component, 'draw');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onMouseDown should set mouseDown to true', () => {
        component.onMouseDown(mouseEvent);
        expect(component.mouseDown).toEqual(true);
    });

    it('onMouseUp should set mouseDown to false', () => {
        component.onMouseUp(mouseEvent);
        expect(component.mouseDown).toEqual(false);
    });

    it('onMouseMove should call draw and emitcolor', () => {
        component.mouseDown = true;
        mouseEvent = { offsetX: 25, offsetY: 25, button: 0 } as MouseEvent;
        component.onMouseMove(mouseEvent);
        expect(drawSpy).toHaveBeenCalled();
        expect(emitColorSpy).toHaveBeenCalled();
    });

    it('getColorPosition should return Hex color string', () => {
        spyOn<any>(component, 'RGBToHex');
        component.getColorAtPosition(0, 0);

        expect(component.RGBToHex).toHaveBeenCalled();
    });
});
