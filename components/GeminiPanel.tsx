import React, { useState, useRef } from 'react';
import { Mic, Square, Sparkles, Loader2, Send } from 'lucide-react';
import { getChannelInsights, transcribeAudio } from '../services/geminiService';
import { Channel } from '../types';

interface GeminiPanelProps {
  currentChannel: Channel | null;
}

const GeminiPanel: React.FC<GeminiPanelProps> = ({ currentChannel }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleGetInsight = async () => {
    if (!currentChannel) return;
    setIsLoadingInsight(true);
    setInsight(null);
    try {
      const result = await getChannelInsights(currentChannel.name);
      setInsight(result);
    } catch (error) {
        setInsight("Failed to get insights.");
    } finally {
      setIsLoadingInsight(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleTranscription(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscription(null);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Microphone access is required for transcription.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        const text = await transcribeAudio(base64Audio, 'audio/webm');
        setTranscription(text);
        setIsTranscribing(false);
      };
    } catch (error) {
      setTranscription("Error transcribing audio.");
      setIsTranscribing(false);
    }
  };

  if (!currentChannel && !transcription && !isRecording) {
      return (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 p-6 text-center">
              <Sparkles className="w-12 h-12 mb-4 text-purple-500 opacity-50" />
              <p>Select a channel or use the voice tool to start exploring with Gemini.</p>
          </div>
      );
  }

  return (
    <div className="h-full flex flex-col bg-gray-800 p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Sparkles className="text-purple-400 w-5 h-5" />
        Gemini Intelligence
      </h3>

      {/* Channel Insights Section */}
      {currentChannel && (
        <div className="mb-6 bg-gray-700/50 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Active Channel: <span className="text-white">{currentChannel.name}</span></h4>
          
          {!insight && !isLoadingInsight && (
             <button 
                onClick={handleGetInsight}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded flex items-center gap-2 transition-colors"
             >
                <Sparkles className="w-3 h-3" />
                Analyze Channel
             </button>
          )}

          {isLoadingInsight && (
              <div className="flex items-center gap-2 text-sm text-purple-300 animate-pulse mt-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing content...
              </div>
          )}

          {insight && (
              <div className="mt-2 text-sm text-gray-200 leading-relaxed bg-gray-800 p-3 rounded">
                  {insight}
              </div>
          )}
        </div>
      )}

      {/* Audio Transcription Section */}
      <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-700 flex-1 flex flex-col">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Voice Memo & Transcription</h4>
        
        <div className="flex-1 bg-gray-900 rounded-lg mb-4 p-3 text-sm text-gray-300 overflow-y-auto min-h-[100px] border border-gray-800">
            {isTranscribing ? (
                <div className="flex items-center gap-2 text-blue-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Transcribing your voice...
                </div>
            ) : transcription ? (
                <p>"{transcription}"</p>
            ) : (
                <p className="text-gray-600 italic">Record audio to see transcription here...</p>
            )}
        </div>

        <div className="flex justify-center">
            {!isRecording ? (
                <button
                    onClick={startRecording}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-900/20"
                >
                    <Mic className="w-5 h-5" />
                    Start Recording
                </button>
            ) : (
                <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-full font-medium animate-pulse"
                >
                    <Square className="w-5 h-5 fill-current" />
                    Stop Recording
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default GeminiPanel;