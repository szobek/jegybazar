import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import 'rxjs/add/operator/skip';
import { Observable } from 'rxjs/Observable';
import { ChatMessageModel } from '../model/chat.model';
import { ChatService } from '../chat.service';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/delay';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ChatService]
})
export class ChatWindowComponent implements OnInit, AfterViewChecked {
  @Input() roomId; // = environment.production ? null : MockedChatDatas.mockedRoomId;
  resetForm = false;
  chatMessage$: Observable<ChatMessageModel[]>;
  @ViewChild('cardBody') cardBody: ElementRef;
  @HostBinding('style.height') height = '100%';
  collapseBody: boolean;
  private shouldScrolling = false;

  constructor(
    private chatService: ChatService
  ) {
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrolling) {
      this.cardBody.nativeElement.scrollTo(0, this.cardBody.nativeElement.scrollHeight);
      this.shouldScrolling = false;
    }
  }

  ngOnInit() {
    this.chatMessage$ = this.chatService.getRoomMessages(this.roomId);
    this.chatMessage$.first().delay(300).subscribe(
      () => {
        this.shouldScrolling = true;
        this.ngAfterViewChecked();
      }
    );
  }

  onNewMessage(newMessage: string) {
    this.chatService.addMessage(this.roomId, newMessage)
      .subscribe(
        resp => {
          if (resp) {
            this.shouldScrolling = true;
            this.resetForm = true;
          } else {
            alert('Hiba a chat üzenet küldése közben');
          }
        }
      );
  }

  trackByMessages(index: number, model: ChatMessageModel) {
    return model.$id;
  }

  collapseChat() {
    this.collapseBody = !this.collapseBody;
    if (this.collapseBody) {
      this.height = null;
    } else {
      this.height = '100%';
    }
  }
}
