import { Component, ViewChild, ElementRef, OnInit, OnDestroy, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'folder-uploader',
  templateUrl: './folder-uploader.component.html',
  styleUrls: ['./folder-uploader.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FolderUploaderComponent),
      multi: true
    },
  ]
})
export class FolderUploaderComponent implements OnInit, OnDestroy, ControlValueAccessor {

  @ViewChild('folderUploader', { read: ElementRef, static: true })
  public folderUploaderInput: ElementRef;

  public isDisabled: boolean;

  public folderName = '';

  public onChange = (_: any) => { };
  public onTouched = () => { };

  public constructor() {
  }

  public ngOnInit(): void {
  }

  public ngOnDestroy(): void {
  }

  public handleFolderChange() {
    const files: FileList = this.folderUploaderInput.nativeElement.files;

    this.updateFolderName(files);
    this.onChange(files);
  }

  public removeFolder() {
    this.folderName = '';
    this.onChange(null);
  }

  public writeValue(value: any): void {
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  private updateFolderName(files: FileList): void {
    if (!files || !files.length) {
      this.folderName = '';

      return;
    }

    const file = files.item(0) as any;
    const [folderName] = /^.+\//.exec(file.webkitRelativePath);

    this.folderName = folderName;
  }
}
