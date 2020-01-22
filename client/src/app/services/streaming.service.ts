import { HttpEventType } from '@angular/common/http';
import { UploadEvent, UploadChunk } from './streaming.service.types';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { tap, filter, switchMap } from 'rxjs/operators';
import { fileFormDataKey, uploadChunkSize } from './streaming.service.constants';
import { Injectable } from '@angular/core';
import { StreamingDataSercice } from './streaming.data.service';

@Injectable({
  providedIn: 'root'
})
export class StreamingService {

  public constructor(private readonly streamingDataService: StreamingDataSercice) {
  }

  public upload(files: FileList): Observable<UploadEvent> {
    const progress$ = new BehaviorSubject<UploadEvent>(null);

    this.startUpload(files, progress$);

    return progress$.asObservable();
  }

  private async startUpload(files: FileList, progress$: BehaviorSubject<UploadEvent>): Promise<void> {
    const { uploadId } = await this.streamingDataService.getHandshake()
      .toPromise();

    // tslint:disable-next-line: no-console
    console.time(`upload ${uploadId}`);

    await this.processUpload(uploadId, files, progress$);

    // tslint:disable-next-line: no-console
    console.timeEnd(`upload ${uploadId}`);

    progress$.complete();
  }

  private async processUpload(uploadId: string, files: FileList, progress$: BehaviorSubject<UploadEvent>) {
    const chunks = this.prepareChunks(files);
    const totalBytes = chunks.map(chunk => chunk.size)
      .reduce((firstChunkSize, secondChunkSize) => firstChunkSize + secondChunkSize);

    let loaded = 0;
    this.reportProgress(uploadId, loaded, totalBytes, progress$);

    for (const chunk of chunks) {
      const formData = this.buildFormData(chunk.files);

      await this.streamingDataService.upload(uploadId, formData)
        .pipe(
          tap(httpEvent => {
            if (httpEvent.type === HttpEventType.UploadProgress) {
              this.reportProgress(uploadId, loaded + httpEvent.loaded, totalBytes, progress$);
            }
          }),
          filter(httpEvent => httpEvent.type === HttpEventType.Response),
          switchMap(() => of(null))
        )
        .toPromise();

      loaded += chunk.size;
      this.reportProgress(uploadId, loaded, totalBytes, progress$);
    }
  }

  private prepareChunks(files: FileList): UploadChunk[] {
    const chunks: UploadChunk[] = [];

    let queueSize = 0;
    let queue: File[] = [];

    for (let fileIndex = 0; fileIndex < files.length;) {
      const file = files.item(fileIndex);

      if (!queue.length || queueSize + file.size <= uploadChunkSize) {
        queueSize += file.size;
        queue.push(file);
        fileIndex++;

        continue;
      }

      chunks.push({ size: queueSize, files: queue });

      queueSize = 0;
      queue = [];
    }

    if (queue.length) {
      chunks.push({ size: queueSize, files: queue });
    }

    return chunks;
  }

  private buildFormData(files: File[]): FormData {
    const formData = new FormData();

    files.forEach(file => formData.append(fileFormDataKey, file));

    return formData;
  }

  private reportProgress(uploadId: string, loaded: number, total: number, progress$: BehaviorSubject<UploadEvent>) {
    const uploadEvent: UploadEvent = {
      uploadId,
      progress: loaded / total * 100,
      loaded,
      total
    };

    progress$.next(uploadEvent);
  }
}
