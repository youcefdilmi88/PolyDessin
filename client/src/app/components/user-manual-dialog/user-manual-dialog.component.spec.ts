import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { UserManualDialogComponent } from './user-manual-dialog.component';

describe('UserManualDialogComponent', () => {
    let component: UserManualDialogComponent;
    let fixture: ComponentFixture<UserManualDialogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [UserManualDialogComponent],
            providers: [{ provide: MatDialogRef, useValue: {} }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UserManualDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
