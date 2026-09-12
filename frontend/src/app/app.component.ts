import { Component, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CursorService, CursorUpdate } from './cursor.service';

const STALE_AFTER_MS = 4000; // remove a cursor if we haven't heard from it in this long
const SEND_INTERVAL_MS = 40; // ~25 updates/sec max, keeps network chatter low

interface LiveCursor extends CursorUpdate {
  lastSeen: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnDestroy {
  roomInput = 'demo';
  joined = false;
  connected = false;

    readonly cursors = new Map<string, LiveCursor>();
  myPos = { x: 50, y: 50 };
  hasMoved = false;
  private lastSentAt = 0;
  private cleanupHandle?: ReturnType<typeof setInterval>;

  constructor(public cursorService: CursorService) {}

  join(): void {
    const room = this.roomInput.trim() || 'demo';
    this.cursorService.connect(room);
    this.cursorService.connected$.subscribe((status) => (this.connected = status));
    this.cursorService.updates$.subscribe((update) => this.applyUpdate(update));
    this.cleanupHandle = setInterval(() => this.pruneStale(), 1000);
    this.joined = true;
  }

  onPointerMove(event: MouseEvent): void {
    const xPct = (event.clientX / window.innerWidth) * 100;
    const yPct = (event.clientY / window.innerHeight) * 100;

    // Update our own on-screen cursor immediately, every event - this is
    // free (no network involved), so it should feel perfectly responsive.
    this.myPos = { x: xPct, y: yPct };
    this.hasMoved = true;

    // Only the network broadcast is throttled, to keep bandwidth sane.
    const now = performance.now();
    if (now - this.lastSentAt < SEND_INTERVAL_MS) return;
    this.lastSentAt = now;
    this.cursorService.send(xPct, yPct);
  }

  private applyUpdate(update: CursorUpdate): void {
    if (update.leaving) {
      this.cursors.delete(update.userId);
      return;
    }
    this.cursors.set(update.userId, { ...update, lastSeen: Date.now() });
  }

  private pruneStale(): void {
    const cutoff = Date.now() - STALE_AFTER_MS;
    for (const [id, cursor] of this.cursors) {
      if (cursor.lastSeen < cutoff) this.cursors.delete(id);
    }
  }

  get cursorList(): LiveCursor[] {
    return Array.from(this.cursors.values());
  }

  @HostListener('window:beforeunload')
  ngOnDestroy(): void {
    if (this.cleanupHandle) clearInterval(this.cleanupHandle);
    if (this.joined) this.cursorService.disconnect();
  }
}
