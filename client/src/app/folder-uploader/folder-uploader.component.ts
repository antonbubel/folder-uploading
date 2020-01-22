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

  public onChange = (_: any) => { };
  public onTouched = () => { };

  public constructor() {
  }

  public ngOnInit(): void {
  }

  public ngOnDestroy(): void {
  }

  public handleFolderChange() {
    // files can be acessed from this.folderUploaderInput.nativeElement.files;
    const files: FileList = this.folderUploaderInput.nativeElement.files;

    this.onChange(files);
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
}
