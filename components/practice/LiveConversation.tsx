import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, Loader2, ArrowLeft } from 'lucide-react';
import { CEFRLevel, LiveSession } from '../../types';

interface LiveConversationProps {
  userLevel: CEFRLevel;
  onBack: () => void;
}

const LiveConversation: React.FC<LiveConversationProps> = ({ userLevel, onBack }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<{ role: 'user' | 'ai', text: string }[]>([]);

  const sessionRef = useRef<Promise<LiveSession> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const nextPlayTimeRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const drawVisualizer = () => {
      if (!canvasRef.current || !audioContextRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (isPlayingRef.current) {
        // Draw a simple pulsing circle or wave
        const time = Date.now() / 1000;
        const radius = 30 + Math.sin(time * 5) * 10;
        
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(244, 63, 94, 0.5)';
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(drawVisualizer);
    };

    if (isConnected) {
      drawVisualizer();
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isConnected]);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: {
        channelCount: 1,
        sampleRate: 16000,
      } });
      mediaStreamRef.current = stream;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // Convert Float32Array to Int16Array
              const pcm16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                const s = Math.max(-1, Math.min(1, inputData[i]));
                pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
              }
              
              // Base64 encode
              const buffer = new Uint8Array(pcm16.buffer);
              let binary = '';
              for (let i = 0; i < buffer.byteLength; i++) {
                binary += String.fromCharCode(buffer[i]);
              }
              const base64Data = btoa(binary);

              sessionPromise.then((session) => {
                session.sendRealtimeInput({
                  media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts) {
              for (const part of message.serverContent.modelTurn.parts) {
                if (part.inlineData && part.inlineData.data) {
                  const base64Audio = part.inlineData.data;
                  playAudioBase64(base64Audio);
                }
                if (part.text) {
                  setTranscript(prev => [...prev, { role: 'ai', text: part.text as string }]);
                }
              }
            }
            if (message.serverContent?.interrupted) {
              audioQueueRef.current = [];
              isPlayingRef.current = false;
              nextPlayTimeRef.current = 0;
            }
          },
          onerror: (err) => {
            console.error('Live API Error:', err);
            setError('Connection error occurred.');
            disconnect();
          },
          onclose: () => {
            disconnect();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: `You are a friendly, encouraging English conversation coach. The user is at ${userLevel} level. Speak naturally, keep responses relatively short, and gently correct major mistakes if necessary.`,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
      });

      sessionRef.current = sessionPromise;

    } catch (err: unknown) {
      console.error('Failed to connect:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to microphone or API.');
      setIsConnecting(false);
      disconnect();
    }
  };

  const playAudioBase64 = (base64: string) => {
    if (!audioContextRef.current) return;
    
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Convert 16-bit PCM to Float32
    const pcm16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 32768.0;
    }

    audioQueueRef.current.push(float32);
    scheduleNextAudio();
  };

  const scheduleNextAudio = () => {
    if (!audioContextRef.current || audioQueueRef.current.length === 0) return;
    
    const ctx = audioContextRef.current;
    
    // If we are falling behind, reset the play time
    if (nextPlayTimeRef.current < ctx.currentTime) {
      nextPlayTimeRef.current = ctx.currentTime + 0.05;
    }

    while (audioQueueRef.current.length > 0) {
      const audioData = audioQueueRef.current.shift()!;
      const buffer = ctx.createBuffer(1, audioData.length, 24000); // Output sample rate is 24000
      buffer.getChannelData(0).set(audioData);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(nextPlayTimeRef.current);
      
      source.onended = () => {
        if (ctx.currentTime >= nextPlayTimeRef.current) {
          isPlayingRef.current = false;
        }
      };
      
      nextPlayTimeRef.current += buffer.duration;
      isPlayingRef.current = true;
    }
  };

  const disconnect = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (sessionRef.current) {
      sessionRef.current.then((s: LiveSession) => s.close()).catch(console.error);
      sessionRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    nextPlayTimeRef.current = 0;
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex items-center p-4 bg-white border-b border-slate-200">
        <button
          onClick={() => {
            disconnect();
            onBack();
          }}
          className="p-2 mr-4 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Live Conversation</h2>
          <p className="text-sm text-slate-500">Real-time voice practice</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center">
          <div className={`relative w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-500 ${isConnected ? 'bg-rose-100 text-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.3)]' : 'bg-slate-100 text-slate-400'}`}>
            <canvas ref={canvasRef} width={128} height={128} className="absolute top-0 left-0 w-full h-full rounded-full pointer-events-none" />
            {isConnecting ? (
              <Loader2 size={48} className="animate-spin relative z-10" />
            ) : isConnected ? (
              <Mic size={48} className="animate-pulse relative z-10" />
            ) : (
              <MicOff size={48} className="relative z-10" />
            )}
          </div>

          <h3 className="mt-8 text-2xl font-bold text-slate-800">
            {isConnecting ? 'Connecting...' : isConnected ? 'Listening...' : 'Ready to practice?'}
          </h3>
          <p className="mt-2 text-slate-500">
            {isConnected 
              ? 'Speak naturally. The AI will respond to you.' 
              : 'Start a real-time voice conversation with your AI English coach.'}
          </p>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={isConnected ? disconnect : connect}
            disabled={isConnecting}
            className={`mt-8 w-full py-4 rounded-2xl font-bold text-lg transition-all ${
              isConnected 
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                : 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/30'
            }`}
          >
            {isConnected ? 'End Conversation' : 'Start Conversation'}
          </button>
        </div>

        {transcript.length > 0 && (
          <div className="mt-8 max-w-2xl w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-6 max-h-64 overflow-y-auto">
            <h4 className="font-bold text-slate-700 mb-4">Transcript</h4>
            <div className="space-y-3">
              {transcript.map((t, i) => (
                <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${t.role === 'user' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-800'}`}>
                    {t.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveConversation;
