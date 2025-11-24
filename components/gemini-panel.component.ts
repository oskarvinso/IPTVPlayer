import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Channel } from '../types';
import { GeminiService } from '../services/gemini.service';

@Component({
  selector: 'app-gemini-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col bg-gray-800 p-4 overflow-y-auto">
      <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <!-- Sparkles Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-400"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M3 5h4"/><path d="M3 9h4"/></svg>
        Gemini Intelligence
      </h3>

      <div *ngIf="!currentChannel && !transcription && !isRecording" class="h-full flex flex-col items-center justify-center text-gray-500 p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-4 text-purple-500 opacity-50"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M3 5h4"/><path d="M3 9h4"/></svg>
          <p>Select a channel or use the voice tool to start exploring with Gemini.</p>
      </div>

      <!-- Channel Insights Section -->
      <div *ngIf="currentChannel" class="mb-6 bg-gray-700/50 rounded-lg p-4 border border-gray-700">
        <h4 class="text-sm font-medium text-gray-300 mb-2">Active Channel: <span class="text-white">{{currentChannel.name}}</span></h4>
        
        <button 
           *ngIf="!insight && !isLoadingInsight"
           (click)="handleGetInsight()"
           class="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded flex items-center gap-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          Analyze Channel
        </button>

        <div *ngIf="isLoadingInsight" class="flex items-center gap-2 text-sm text-purple-300 animate-pulse mt-2">
            <!-- Loader Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Analyzing content...
        </div>

        <div *ngIf="insight" class="mt-2 text-sm text-gray-200 leading-relaxed bg-gray-800 p-3 rounded">
            {{insight}}
        </div>
      </div>

      <!-- Audio Transcription Section -->
      <div class="bg-gray-700/50 rounded-lg p-4 border border-gray-700 flex-1 flex flex-col">
        <h4 class="text-sm font-medium text-gray-300 mb-3">Voice Memo & Transcription</h4>
        
        <div class="flex-1 bg-gray-900 rounded-lg mb-4 p-3 text-sm text-gray-300 overflow-y-auto min-h-[100px] border border-gray-800">
            <div *ngIf="isTranscribing" class="flex items-center gap-2 text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                Transcribing your voice...
            </div>
            
            <p *ngIf="!isTranscribing && transcription">"{{transcription}}"</p>
            
            <p *ngIf="!isTranscribing && !transcription" class="text-gray-600 italic">Record audio to see transcription here...</p>
        </div>

        <div class="flex justify-center">
            <button
                *ngIf="!isRecording"
                (click)="startRecording()"
                class="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-900/20"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                Start Recording
            </button>
            
            <button
                *ngIf="isRecording"
                (click)="stopRecording()"
                class="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-full font-medium animate-pulse"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/></svg>
                Stop Recording
            </button>
        </div>
      </div>
    </div>
  `
})
export class GeminiPanelComponent {
  @Input() currentChannel: Channel | null = null;
  
  insight: string | null = null;
  isLoadingInsight = false;
  
  isRecording = false;
  transcription: string | null = null;
  isTranscribing = false;

  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  constructor(private geminiService: GeminiService) {}

  async handleGetInsight() {
    if (!this.currentChannel) return;
    this.isLoadingInsight = true;
    this.insight = null;
    try {
      this.insight = await this.geminiService.getChannelInsights(this.currentChannel.name);
    } catch (error) {
        this.insight = "Failed to get insights.";
    } finally {
      this.isLoadingInsight = false;
    }
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        await this.handleTranscription(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.transcription = null;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Microphone access is required for transcription.");
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  async handleTranscription(audioBlob: Blob) {
    this.isTranscribing = true;
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        this.transcription = await this.geminiService.transcribeAudio(base64Audio, 'audio/webm');
        this.isTranscribing = false;
      };
    } catch (error) {
      this.transcription = "Error transcribing audio.";
      this.isTranscribing = false;
    }
  }
}
