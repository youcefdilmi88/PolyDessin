import { Component, Inject, InjectionToken, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-response-message',
    templateUrl: './response-message.component.html',
    styleUrls: ['./response-message.component.scss'],
})
export class ResponseMessageComponent implements OnInit {
    constructor(@Inject(MAT_DIALOG_DATA) public injection: InjectionToken<{ data: string }>) {}
    message: string = '';

    ngOnInit(): void {
        this.message = this.injection.toString();
    }
}
