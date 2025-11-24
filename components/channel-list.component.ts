import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Channel } from '../types';

@Component({
  selector: 'app-channel-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-full bg-gray-900 border-r border-gray-800 w-80">
      <div class="p-4 border-b border-gray-800">
        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <!-- TV Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
          Channels
        </h2>
        <div class="relative">
          <!-- Search Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-2.5 text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            placeholder="Search channels..."
            [(ngModel)]="filter"
            (ngModelChange)="updateFilter()"
            class="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto">
        <div *ngIf="isLoading" class="p-4 text-center text-gray-400 animate-pulse">Loading channels...</div>
        
        <div *ngIf="!isLoading && filteredChannels.length === 0" class="p-4 text-center text-gray-500">No channels found</div>

        <div *ngIf="!isLoading && filteredChannels.length > 0" class="space-y-1 p-2">
          <button
            *ngFor="let channel of filteredChannels"
            (click)="selectChannel.emit(channel)"
            class="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors"
            [ngClass]="currentChannel?.id === channel.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'"
          >
            <ng-container *ngIf="channel.logo; else noLogo">
               <img [src]="channel.logo" [alt]="channel.name" class="w-8 h-8 rounded object-contain bg-black/20" (error)="handleImgError($event)" />
            </ng-container>
            <ng-template #noLogo>
              <div class="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">
                {{ channel.name.substring(0, 2).toUpperCase() }}
              </div>
            </ng-template>
            
            <div class="truncate">
                <div class="font-medium truncate">{{channel.name}}</div>
                <div class="text-xs truncate" [ngClass]="currentChannel?.id === channel.id ? 'text-blue-200' : 'text-gray-500'">
                    {{channel.group}}
                </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ChannelListComponent implements OnChanges {
  @Input() channels: Channel[] = [];
  @Input() currentChannel: Channel | null = null;
  @Input() isLoading: boolean = false;
  @Output() selectChannel = new EventEmitter<Channel>();

  filter = '';
  filteredChannels: Channel[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['channels'] || changes['isLoading']) {
      this.updateFilter();
    }
  }

  updateFilter() {
    if (!this.channels) return;
    this.filteredChannels = this.channels.filter(c => 
      c.name.toLowerCase().includes(this.filter.toLowerCase())
    );
  }

  handleImgError(event: any) {
    event.target.style.display = 'none';
  }
}
