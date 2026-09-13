import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';

// Point this at your deployed backend when you go live, e.g.
// 'https://your-backend.onrender.com/ws'
export const BACKEND_WS_URL = 'https://r-d-frontend-real-time-multiplayer.onrender.com/ws';

export interface CursorUpdate {
  userId: string;
  name: string;
  color: string;
  x: number; // 0-100, percentage of viewport
  y: number; // 0-100, percentage of viewport
  leaving?: boolean;
}

const PALETTE = ['#E5484D', '#3E63DD', '#12A594', '#F5A623', '#8E4EC6', '#E93D82'];

function randomName(): string {
  return `Guest-${Math.floor(1000 + Math.random() * 9000)}`;
}

function randomColor(): string {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)];
}

@Injectable({ providedIn: 'root' })
export class CursorService {
  readonly userId = crypto.randomUUID();
  readonly name = randomName();
  readonly color = randomColor();

  readonly updates$ = new Subject<CursorUpdate>();
  readonly connected$ = new Subject<boolean>();

  private client?: Client;
  private room = '';

  connect(room: string): void {
    this.room = room;
    this.client = new Client({
      webSocketFactory: () => new SockJS(BACKEND_WS_URL) as any,
      reconnectDelay: 2000,
      onConnect: () => {
        this.connected$.next(true);
        this.client!.subscribe(`/topic/cursor/${this.room}`, (message: IMessage) => {
          const update: CursorUpdate = JSON.parse(message.body);
          if (update.userId !== this.userId) {
            this.updates$.next(update);
          }
        });
      },
      onWebSocketClose: () => this.connected$.next(false),
    });
    this.client.activate();
  }

  send(x: number, y: number): void {
    this.publish({ userId: this.userId, name: this.name, color: this.color, x, y });
  }

  sendLeaving(): void {
    this.publish({ userId: this.userId, name: this.name, color: this.color, x: 0, y: 0, leaving: true });
  }

  private publish(update: CursorUpdate): void {
    if (!this.client?.connected) return;
    this.client.publish({
      destination: `/app/cursor/${this.room}`,
      body: JSON.stringify(update),
    });
  }

  disconnect(): void {
    this.sendLeaving();
    this.client?.deactivate();
  }
}
