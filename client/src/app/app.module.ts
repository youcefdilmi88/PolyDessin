import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '@app/app-routing.module';
import { MaterialModule } from '@app/material.module';
import { AppComponent } from '@components/app/app.component';
import { CarrouselComponent } from '@components/carrousel/carrousel.component';
import { ColorPaletteComponent } from '@components/color-picker/color-palette/color-palette.component';
import { ColorPickerComponent } from '@components/color-picker/color-picker.component';
import { ColorSliderComponent } from '@components/color-picker/color-slider/color-slider.component';
import { DrawingComponent } from '@components/drawing/drawing.component';
import { EditorComponent } from '@components/editor/editor.component';
import { MainPageComponent } from '@components/main-page/main-page.component';
import { PopupExportDrawingComponent } from '@components/popup-export-drawing/popup-export-drawing.component';
import { PopupNewDrawingComponent } from '@components/popup-new-drawing/popup-new-drawing.component';
import { PopupSaveDrawingComponent } from '@components/popup-save-drawing/popup-save-drawing.component';
import { ResponseMessageComponent } from '@components/response-message/response-message.component';
import { SidebarToolStateComponent } from '@components/sidebar-tool-state/sidebar-tool-state.component';
import { SidebarComponent } from '@components/sidebar/sidebar.component';
import { UserManualDialogComponent } from '@components/user-manual-dialog/user-manual-dialog.component';
import { GridComponent } from './components/grid/grid.component';
import { SendEmailComponent } from './components/send-email/send-email.component';

@NgModule({
    declarations: [
        AppComponent,
        ColorPaletteComponent,
        ColorPickerComponent,
        ColorSliderComponent,
        DrawingComponent,
        EditorComponent,
        MainPageComponent,
        PopupNewDrawingComponent,
        SidebarComponent,
        SidebarToolStateComponent,
        UserManualDialogComponent,
        PopupSaveDrawingComponent,
        PopupExportDrawingComponent,
        CarrouselComponent,
        ResponseMessageComponent,
        GridComponent,
        SendEmailComponent,
    ],
    imports: [BrowserModule, HttpClientModule, AppRoutingModule, BrowserAnimationsModule, FormsModule, MaterialModule],
    entryComponents: [MainPageComponent, UserManualDialogComponent],
    providers: [HttpClientModule],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
