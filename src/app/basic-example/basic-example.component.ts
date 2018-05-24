import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NotificationsService } from 'angular2-notifications';
import { FileItem, UploaderProgress } from '../core';

@Component({
  selector: 'app-basic-example',
  templateUrl: './basic-example.component.html',
  styleUrls: ['./basic-example.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicExampleComponent {

  files = [];
  links = [];
  progress: UploaderProgress;
  active = false;

  notifOptions = {
    timeOut: 5000,
    showProgressBar: true,
    pauseOnHover: false,
    clickToClose: false,
    maxLength: 10
  };

  uniqueName = true;
  dropZone = true;
  multiple = true;
  maxFilesCount = 20;
  maxFileSize = 5;
  paramName;
  paramDir;
  placeholder = 'Drop files here or click to select';
  accept = null;
  parallelUpload = 1;
  thumbs = true;
  thumbWidth = 150;
  thumbHeight = 150;
  resizeWidth;
  resizeHeight;
  resizeMethod;

  constructor(private notifications: NotificationsService) {
  }

  onFiles(e) {
    this.files = e;
  }

  onSuccess(e: FileItem) {
    this.notifications.success('File uploaded successfully!', e.snapshot.name, this.notifOptions);
    console.log('success', e);
  }

  onComplete(e) {
    this.links = e.map(file => file.downloadURL);
    console.log('complete', e);
    this.notifications.info('Operation finished!', `${this.links.length} files has been uploaded`, this.notifOptions);
  }

  onProgress(e) {
    this.progress = e;
  }

  onRemove(e: FileItem) {
    this.notifications.info('File removed!', e.snapshot.name, this.notifOptions);
  }

  onCancel(e: FileItem) {
    this.notifications.info('Upload cancelled!', e.snapshot.name, this.notifOptions);
  }

  onError(e) {
    this.notifications.error('Error!', e.message, this.notifOptions);
  }

  onReset() {
    this.notifications.alert('Cleared!', 'All items has been removed', this.notifOptions);
  }

  onValue(e) {
    console.log('value', e);
  }

  onActiveChange(e) {
    this.active = e;
  }

}
