import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { ResponseMessageComponent } from './response-message.component';

describe('ResponseMessageComponent', () => {
    const dialogRefStub = {
        afterClosed(): Observable<string> {
            return of('result'); // this can be whatever, esp handy if you actually care about the value returned
        },
    };

    const dialogStub = { open: () => dialogRefStub };

    let component: ResponseMessageComponent;
    let fixture: ComponentFixture<ResponseMessageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ResponseMessageComponent],
            providers: [
                MatDialogModule,
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: {} },
                { provide: MatDialog, useValue: dialogStub },
            ],
            imports: [MatDialogModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ResponseMessageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
