import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DeleteResponse } from '@common/communication/delete-response';
import { DrawingData } from '@common/communication/drawing-data';
import { DrawingEmailData } from '@common/communication/drawing-email-data';
import { ExportResponse } from '@common/communication/export-response';
import { InsertResponse } from '@common/communication/insert-response';
import { SendResponse } from '@common/communication/send-response';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DatabaseService {
    constructor(private http: HttpClient) {}

    private readonly BASE_URL: string = 'http://localhost:3000';

    basicGet(): Observable<DrawingData[]> {
        return this.http.get<DrawingData[]>(this.BASE_URL + '/all');
    }

    basicPost(drawing: DrawingData): Observable<InsertResponse> {
        return this.http.post<InsertResponse>(this.BASE_URL + '/save', drawing);
    }

    basicExport(drawing: DrawingData): Observable<ExportResponse> {
        return this.http.post<ExportResponse>(this.BASE_URL + '/export', drawing);
    }

    basicSendByEmail(drawing: DrawingEmailData): Observable<SendResponse> {
        return this.http.post<SendResponse>(this.BASE_URL + '/send', drawing);
    }

    basicDelete(id: string): Observable<DeleteResponse> {
        const params = new HttpParams().set('drawing', id);
        return this.http.delete<DeleteResponse>(this.BASE_URL + '/delete', { params });
    }

    basicSearch(tags: string[]): Observable<DrawingData[]> {
        let params = new HttpParams();
        for (const tag of tags) {
            params = params.append('tags', tag);
        }
        return this.http.get<DrawingData[]>(this.BASE_URL + '/search', { params });
    }
}
