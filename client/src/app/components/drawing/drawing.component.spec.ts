import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Tool } from '@classes/tool';
import { MouseButton } from '@enums/mouse-button';
import { DrawingService } from '@services/drawing/drawing.service';
import { PencilService } from '@tools/pencil-service/pencil.service';
import { DrawingComponent } from './drawing.component';

class ToolStub extends Tool {}

describe('DrawingComponent', () => {
    let component: DrawingComponent;
    let fixture: ComponentFixture<DrawingComponent>;
    let toolStub: ToolStub;
    let drawingStub: DrawingService;

    beforeEach(async(() => {
        toolStub = new ToolStub({} as DrawingService);
        drawingStub = new DrawingService();

        TestBed.configureTestingModule({
            declarations: [DrawingComponent],
            providers: [
                { provide: PencilService, useValue: toolStub },
                { provide: DrawingService, useValue: drawingStub },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DrawingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(" should call the tool's mouse up when receiving a mouse up event", () => {
        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        const mouseEventSpy = spyOn(toolStub, 'onMouseUp');
        component.onMouseUp(mouseEvent);
        expect(mouseEventSpy).toHaveBeenCalledWith(mouseEvent);
    });
});
