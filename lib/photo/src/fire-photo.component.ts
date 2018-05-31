import { Component, Input, OnInit, Output, OnChanges, EventEmitter, TemplateRef, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { FileItem, FireUploaderRef, FireUploader, FileSnapshot, UploaderProgress, ResizeMethod } from '@ngx-fire-uploader/core';

import { FirePhoto } from './fire-photo';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { switchMap } from 'rxjs/operators/switchMap';
import { filter } from 'rxjs/operators/filter';
import { take } from 'rxjs/operators/take';
import { tap } from 'rxjs/operators/tap';
import { map } from 'rxjs/operators/map';

export interface FirePhotoState {
  loading?: boolean;
  photo?: string;
}

@Component({
  selector: 'fire-photo',
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./fire-photo.scss'],
  templateUrl: './fire-photo.html'
})
export class FirePhotoComponent implements OnInit, OnChanges {
  uploaderRef: FireUploaderRef;
  state$ = new BehaviorSubject<FirePhotoState>({});
  hover = false;

  @Input() id = 'root';
  @Input() loadingTemplate: TemplateRef<any>;
  @Input() disabled: boolean;
  @Input() src: string = this._manager.config.defaultImage;
  @Input() dropZone: boolean = this._manager.config.dropZone;

  @Input() paramName: string = this._manager.config.paramName;
  @Input() paramDir: string = this._manager.config.paramDir;
  @Input() uniqueName: boolean = this._manager.config.uniqueName;
  @Input() autoStart: boolean = this._manager.config.autoStart;
  @Input() thumbWidth: number = this._manager.config.thumbWidth;
  @Input() thumbHeight: number = this._manager.config.thumbHeight;
  @Input() thumbMethod: ResizeMethod = this._manager.config.thumbMethod;
  @Input() resizeMethod: ResizeMethod = this._manager.config.resizeMethod;
  @Input() resizeWidth: number = this._manager.config.resizeWidth;
  @Input() resizeHeight: number = this._manager.config.resizeHeight;
  @Input() resizeMimeType: string = this._manager.config.resizeMimeType;
  @Input() resizeQuality: number = this._manager.config.resizeQuality;

  @Output() progress = new EventEmitter<UploaderProgress>();
  @Output() file = new EventEmitter<FileItem>();
  @Output() value = new EventEmitter<string>();
  @Output() complete = new EventEmitter();
  @Output() active = new EventEmitter<boolean>();
  @Output() error = new EventEmitter<any>();

  constructor(private _uploader: FireUploader, private _manager: FirePhoto, private _el: ElementRef) {
  }

  ngOnInit() {

    // Autoset thumb width and height
    if (!this.thumbHeight && !this.thumbWidth) {
      this.thumbWidth = this._el.nativeElement.clientWidth;
      this.thumbHeight = this._el.nativeElement.clientHeight;
    }

    // Get uploader ref and set the config
    this.uploaderRef = this._uploader.ref(this.id, {
      multiple: false,
      accept: 'image/*',
      autoStart: this.autoStart,
      thumbWidth: this.thumbWidth,
      thumbHeight: this.thumbHeight,
      thumbMethod: this.thumbMethod,
      resizeHeight: this.resizeHeight,
      resizeMethod: this.resizeMethod,
      resizeWidth: this.resizeWidth,
      resizeMimeType: this.resizeMimeType,
      resizeQuality: this.resizeQuality
    });

    // Get generated thumbnail
    this.uploaderRef.files$.pipe(
      filter((files: FileItem[]) => !!files.length),
      map((files: FileItem[]) => files[0]),
      switchMap((file: FileItem) => {
        this.file.emit(file);
        return file.snapshot$.pipe(
          filter((state: FileSnapshot) => !!state.thumbnail),
          tap((snapshot: FileSnapshot) =>
            this.updateState({
              photo: snapshot.thumbnail,
              loading: false
            })
          ),
          take(1)
        );
      })
    ).subscribe();

    this.uploaderRef.value$.subscribe((downloadURLs: string[]) => {
      this.setImage(downloadURLs[0]);
      this.value.next(downloadURLs[0]);
    });

    this.uploaderRef.active$.subscribe((active: boolean) => {
      this.setLoading(active);
      this.active.next(active);
    });

    this.uploaderRef.complete$.subscribe((files: FileItem[]) => {
      this.complete.next(files[0]);
      // Reset the uploader on complete
      this.uploaderRef.reset();
    });

    if (this.file.observers.length) {
      this.uploaderRef.files$.subscribe((files: FileItem[]) =>
        this.file.next(files[0])
      );
    }

    if (this.progress.observers.length) {
      this.uploaderRef.progress$.subscribe((progress: UploaderProgress) =>
        this.progress.next(progress)
      );
    }

    if (this.error.observers.length) {
      this.uploaderRef.error$.subscribe((err: any) => this.error.next(err));
    }
  }

  ngOnChanges() {
    // Set default image
    this.updateState({photo: this.src});

    if (this.uploaderRef instanceof FireUploaderRef) {
      // Update uploader's config when inputs change
      this.uploaderRef.setConfig({
        autoStart: this.autoStart,
        thumbWidth: this.thumbWidth,
        thumbHeight: this.thumbHeight,
        thumbMethod: this.thumbMethod,
        resizeHeight: this.resizeHeight,
        resizeMethod: this.resizeMethod,
        resizeWidth: this.resizeWidth,
        resizeMimeType: this.resizeMimeType,
        resizeQuality: this.resizeQuality
      });
    }
  }

  // Open file dialog
  select() {
    if (!this.disabled) {
      this.uploaderRef.select();
    }
  }

  // Start Uploading
  start() {
    this.uploaderRef.start();
  }

  // Pause Uploading
  pause() {
    this.uploaderRef.pause();
  }

  // Resume Uploading
  resume() {
    this.uploaderRef.resume();
  }

  // Reset
  reset() {
    this.uploaderRef.reset();
    this.setImage(this.src);
  }

  setLoading(loading: boolean) {
    this.updateState({loading});
  }

  setImage(path: string) {
    this.state$.next({photo: path});
  }

  private updateState(state: FirePhotoState) {
    this.state$.next({...this.state$.value, ...state});
  }
}