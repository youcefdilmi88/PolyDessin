import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DatabaseService } from '@services/database/database.service';
import { PopupNewDrawingComponent } from './popup-new-drawing.component';

describe('PopupNewDrawingComponent', () => {
    let component: PopupNewDrawingComponent;
    let fixture: ComponentFixture<PopupNewDrawingComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PopupNewDrawingComponent],
            imports: [HttpClientModule],
            providers: [HttpClientModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [DatabaseService],
        });
        fixture = TestBed.createComponent(PopupNewDrawingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
