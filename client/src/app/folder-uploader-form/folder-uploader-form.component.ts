import { Component, OnInit } from '@angular/core';
import { FolderUploaderFormService } from './folder-uploader-form.service';
import { FormGroup } from '@angular/forms';
import { FOLDER_UPLOADER_FORM_FIELDS } from './folder-uploader-form-fields';
import { StreamingService } from '../services/streaming.service';
import { finalize, filter } from 'rxjs/operators';

@Component({
  selector: 'app-folder-uploader-form',
  templateUrl: './folder-uploader-form.component.html',
  styleUrls: ['./folder-uploader-form.component.scss']
})
export class FolderUploaderFormComponent implements OnInit {

  public uploadingProgress = 0;
  public uploadingInProgress = false;
  public disableFormSubmit = false;

  public folderUploaderForm: FormGroup;
  public readonly folderUploaderFormFields = FOLDER_UPLOADER_FORM_FIELDS;

  public constructor(
    private readonly streamingService: StreamingService,
    private readonly folderUploaderFormService: FolderUploaderFormService
  ) { }

  public ngOnInit(): void {
    this.folderUploaderForm = this.folderUploaderFormService.createFolderUploaderFormGroup();
  }

  public upload() {
    const { files } = this.folderUploaderFormService.buildFolderUploaderFormModel(this.folderUploaderForm.value);

    this.uploadingInProgress = true;
    this.disableFormSubmit = true;
    this.streamingService.upload(files)
      .pipe(
        filter(uploadEvent => !!uploadEvent),
        finalize(() => {
          this.uploadingInProgress = false;
          this.disableFormSubmit = false;
        })
      )
      .subscribe(uploadEvent => {
        this.uploadingProgress = uploadEvent.progress;
      });
  }
}
