import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpEvent, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { HandshakeResultModel } from './streaming.service.types';

@Injectable({
  providedIn: 'root'
})
export class StreamingDataSercice {

  private readonly apiEndpoint = `${environment.apiEndpoint}/streaming`;

  public constructor(private readonly httpClient: HttpClient) {
  }

  public getHandshake(): Observable<HandshakeResultModel> {
    const url = `${this.apiEndpoint}/handshake`;

    return this.httpClient.get<HandshakeResultModel>(url);
  }

  public upload(uploadId: string, formData: FormData): Observable<HttpEvent<Object>> {
    const url = `${this.apiEndpoint}/upload`;

    return this.httpClient.post(url, formData, { reportProgress: true, observe: 'events', params: { uploadId } });
  }
}
