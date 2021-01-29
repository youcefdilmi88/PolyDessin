import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { DrawingComponent } from '@components/drawing/drawing.component';
import { SidebarToolStateComponent } from '@components/sidebar-tool-state/sidebar-tool-state.component';
import { SidebarComponent } from '@components/sidebar/sidebar.component';
import { EditorComponent } from './editor.component';
import SpyObj = jasmine.SpyObj;

describe('EditorComponent', () => {
    let component: EditorComponent;
    let fixture: ComponentFixture<EditorComponent>;
    let matDialogSpy: SpyObj<MatDialog>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EditorComponent, DrawingComponent, SidebarComponent, SidebarToolStateComponent],
            providers: [{ provide: MatDialog, useValue: matDialogSpy }],
            imports: [MatMenuModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
