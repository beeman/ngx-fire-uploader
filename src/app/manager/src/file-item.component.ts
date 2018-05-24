import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { FileSnapshot } from '../../core';

@Component({
  selector: 'file-item',
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './file-item.component.html'
})
export class FileItemComponent {
  @Input() snapshot: FileSnapshot;

  // Show fire-uploader progress bar
  @Input() showProgress: boolean;

  // Shows file name and size
  @Input() showDetails: boolean;

  // Shows remove button
  @Input() showRemove: boolean;

  // To set background based on file extension
  @Input() extensions: any;

  @Output() remove = new EventEmitter();

  removeClicked(e: Event) {
    e.stopPropagation();
    this.remove.emit();
  }
}