import React, { useState, useEffect, useRef } from 'react';
import { useCubes } from '../context/CubesContext';
import {
  Mic,
  MicOff,
  Volume2,
  X,
  Loader2,
  Sparkles,
  Bot,
  Radio,
} from 'lucide-react';

export const VoiceConsoleModal: React.FC = () => {
  const { voiceModalCube, setVoiceModalCube, sendDirectMessage } = useCubes();

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastAgentReply, setLastAgentReply] = useState('');
  const [voiceProfile, setVoiceProfile] = useState<'Kore' | 'Zephyr' | 'Puck' | 'Fenrir'>('Zephyr');
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const cube = voiceModalCube;

  useEffect(() => {
    if (cube) {
      setVoiceProfile(cube.voiceName || 'Zephyr');
    }
  }, [cube]);

  // Audio waveform animation simulation
  useEffect(() => {
    let active = true;
    const updateWaveform = () => {
      if (isListening || isSpeaking) {
        setAudioLevel(Math.random() * 0.7 + 0.3);
      } else {
        setAudioLevel(0.05);
      }
      if (active) {
        animFrameRef.current = requestAnimationFrame(updateWaveform);
      }
    };
    animFrameRef.current = requestAnimationFrame(updateWaveform);

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isListening, isSpeaking]);

  // Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    };
  }, []);

  if (!cube) return null;

  // Start listening
  const toggleListening = () => {
    if (isSpeaking) {
      // Stop speech playback
      if (currentAudioRef.current) currentAudioRef.current.pause();
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      if (transcript.trim()) {
        processUserVoice(transcript);
      }
    } else {
      setTranscript('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition failed to start:', err);
        // Fallback prompt for browsers without mic permission
        const manualPrompt = prompt('Speak to ' + cube.name + ' (Microphone text fallback):');
        if (manualPrompt) {
          processUserVoice(manualPrompt);
        }
      }
    }
  };

  const processUserVoice = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setTranscript(text);

    try {
      // Send message to Cube
      const reply = await sendDirectMessage(cube.id, text);
      setLastAgentReply(reply);
      await playTTS(reply);
    } catch (err: any) {
      console.error('Error processing voice query:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Text-To-Speech Playback
  const playTTS = async (text: string) => {
    setIsSpeaking(true);
    try {
      // Clean up text
      const cleanText = text.replace(/[*#`_]/g, '').slice(0, 350);

      const res = await fetch('/api/cubes/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, voiceName: voiceProfile }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          currentAudioRef.current = audio;
          audio.onended = () => setIsSpeaking(false);
          audio.onerror = () => fallbackWebSpeech(cleanText);
          await audio.play();
          return;
        }
      }

      fallbackWebSpeech(cleanText);
    } catch (e) {
      fallbackWebSpeech(text);
    }
  };

  const fallbackWebSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 300));
      utterance.rate = 1.05;
      utterance.pitch = voiceProfile === 'Kore' ? 1.1 : 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0B0F17] border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl p-6 sm:p-8 flex flex-col items-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => {
            if (currentAudioRef.current) currentAudioRef.current.pause();
            window.speechSynthesis?.cancel();
            setVoiceModalCube(null);
          }}
          className="absolute right-5 top-5 p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ambient Top Glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: cube.accentColor }}
        />

        {/* Header Indicator */}
        <div className="flex items-center gap-2 mb-6">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-slate-900 border border-slate-800 text-slate-300">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Voice Frequency · {cube.name}</span>
          </span>
        </div>

        {/* Central Audio Waveform & Avatar Portal */}
        <div className="relative my-6 flex items-center justify-center">
          {/* Animated concentric pulse rings */}
          <div
            className="absolute rounded-full transition-all duration-300 pointer-events-none"
            style={{
              width: `${140 + audioLevel * 100}px`,
              height: `${140 + audioLevel * 100}px`,
              backgroundColor: `${cube.accentColor}12`,
              border: `1px solid ${cube.accentColor}30`,
            }}
          />
          <div
            className="absolute rounded-full transition-all duration-200 pointer-events-none"
            style={{
              width: `${110 + audioLevel * 60}px`,
              height: `${110 + audioLevel * 60}px`,
              backgroundColor: `${cube.accentColor}20`,
            }}
          />

          {/* Core Avatar Button */}
          <button
            onClick={toggleListening}
            className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center border-2 shadow-2xl transition-transform active:scale-95"
            style={{
              backgroundColor: '#121824',
              borderColor: isListening ? '#10B981' : isSpeaking ? cube.accentColor : '#334155',
            }}
          >
            {isListening ? (
              <Mic className="w-8 h-8 text-emerald-400 animate-bounce" />
            ) : isSpeaking ? (
              <Volume2 className="w-8 h-8 text-cyan-400 animate-pulse" />
            ) : isProcessing ? (
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            ) : (
              <MicOff className="w-8 h-8 text-slate-400" />
            )}
          </button>
        </div>

        {/* Live Audio Spectrum Bar Visualizer */}
        <div className="flex items-center gap-1 h-8 my-3">
          {[...Array(16)].map((_, i) => {
            const height = isListening || isSpeaking
              ? Math.max(4, Math.sin(i * 0.5 + audioLevel * 6) * 28 + 14)
              : 4;
            return (
              <div
                key={i}
                className="w-1 rounded-full transition-all duration-75"
                style={{
                  height: `${height}px`,
                  backgroundColor: isListening
                    ? '#10B981'
                    : isSpeaking
                    ? cube.accentColor
                    : '#334155',
                }}
              />
            );
          })}
        </div>

        {/* Status Text */}
        <p className="text-xs font-mono font-medium text-slate-400 mt-2 mb-4">
          {isListening
            ? 'Listening... Click to finish speaking'
            : isProcessing
            ? 'Analyzing instructions with SOPs...'
            : isSpeaking
            ? `${cube.name} is speaking...`
            : 'Click microphone to speak'}
        </p>

        {/* Live Transcript / Speech Bubbles */}
        <div className="w-full bg-slate-950/70 border border-slate-900 rounded-2xl p-4 min-h-[90px] max-h-40 overflow-y-auto mb-6 text-xs text-left">
          {transcript && (
            <div className="text-slate-300 mb-2">
              <span className="text-slate-500 font-mono text-[10px] block">YOU</span>
              <span>"{transcript}"</span>
            </div>
          )}
          {lastAgentReply && !transcript && (
            <div className="text-slate-300">
              <span className="text-slate-500 font-mono text-[10px] block">
                {cube.name.toUpperCase()} ({cube.role})
              </span>
              <span className="line-clamp-4">{lastAgentReply}</span>
            </div>
          )}
          {!transcript && !lastAgentReply && (
            <span className="text-slate-500 italic">
              Speak a prompt or task. {cube.name} will answer using its designated persona and SOPs.
            </span>
          )}
        </div>

        {/* Voice Profile Selector & Footer Controls */}
        <div className="w-full flex items-center justify-between pt-4 border-t border-slate-900 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-mono text-[11px]">Voice:</span>
            <select
              value={voiceProfile}
              onChange={(e) => setVoiceProfile(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none"
            >
              <option value="Zephyr">Zephyr (Deep, Authoritative)</option>
              <option value="Kore">Kore (Clear, Professional)</option>
              <option value="Puck">Puck (Energetic, Inquisitive)</option>
              <option value="Fenrir">Fenrir (Calm, Technical)</option>
            </select>
          </div>

          <button
            onClick={() => {
              const testPrompt = 'Briefly state your current role and readiness for deployment.';
              processUserVoice(testPrompt);
            }}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono"
          >
            Quick Check-in
          </button>
        </div>
      </div>
    </div>
  );
};
