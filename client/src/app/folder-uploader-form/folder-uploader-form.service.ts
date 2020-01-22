import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FOLDER_UPLOADER_FORM_FIELDS } from './folder-uploader-form-fields';
import { FolderUploaderFormResultModel } from './folder-uploader-form.component.types';

@Injectable({
  providedIn: 'root'
})
export class FolderUploaderFormService {

  public constructor(private readonly formBuilder: FormBuilder) {
  }

  public createFolderUploaderFormGroup(): FormGroup {
    return this.formBuilder.group({
      [FOLDER_UPLOADER_FORM_FIELDS.FILES]: [
        null,
        [Validators.required]
      ]
    });
  }

  public buildFolderUploaderFormModel(formValue: { [FOLDER_UPLOADER_FORM_FIELDS.FILES]: FileList }): FolderUploaderFormResultModel {
    return {
      files: formValue[FOLDER_UPLOADER_FORM_FIELDS.FILES]
    };
  }
}
