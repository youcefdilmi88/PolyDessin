import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
    imports: [
        CommonModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatDialogModule,
        MatGridListModule,
        MatIconModule,
        MatMenuModule,
        MatTabsModule,
        MatSidenavModule,
        MatSliderModule,
        MatInputModule,
        MatChipsModule,
        FormsModule,
        ReactiveFormsModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
    ],
    exports: [
        MatButtonModule,
        MatButtonToggleModule,
        MatDialogModule,
        MatGridListModule,
        MatIconModule,
        MatMenuModule,
        MatTabsModule,
        MatSidenavModule,
        MatSliderModule,
        MatInputModule,
        MatChipsModule,
        FormsModule,
        ReactiveFormsModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MaterialModule {}
