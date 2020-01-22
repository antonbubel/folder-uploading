export interface UploadEvent {
  uploadId: string;
  progress: number;
  loaded: number;
  total: number;
}

export interface HandshakeResultModel {
  uploadId: string;
}

export interface UploadChunk {
  size: number;
  files: File[];
}
