import { TestBed } from '@angular/core/testing';
import { CanvasResizerService } from './canvas-resizer.service';

describe('CanvasResizerService', () => {
    let service: CanvasResizerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CanvasResizerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(" should call the tool's mouse move when receiving a mouse move event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(service, 'onGrabberUp').and.callThrough();
        service.onGrabberUp(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's mouse move when receiving a mouse up event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(service, 'onGrabberMove').and.callThrough();
        service.onGrabberMove(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's mouse move when receiving ", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(service, 'computeOffset').and.callThrough();
        service.computeOffset(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(' onGrabberClick should be called', () => {
        const event = {} as MouseEvent;
        const onGrabberclickSpy = spyOn(service, 'onGrabberClick');
        service.onGrabberClick(event);
        expect(onGrabberclickSpy).toHaveBeenCalled();
        expect(onGrabberclickSpy).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's mouse move", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(service, 'getPositionFromMouse').and.callThrough();
        service.getPositionFromMouse(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });
});
