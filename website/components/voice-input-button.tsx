"use client";

import { useEffect, useRef, useState } from "react";
import {
  MicrophoneStage,
  Stop,
  Waveform,
} from "@phosphor-icons/react";

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInputButton({ onTranscript, disabled }: VoiceInputButtonProps) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [pulse, setPulse] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSupported(!!SpeechRecognition);
  }, []);

  function startListening() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
      setPulse(true);
    };

    recognition.onresult = (e: any) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      if (transcript) onTranscript(transcript);
    };

    recognition.onerror = () => {
      setListening(false);
      setPulse(false);
    };

    recognition.onend = () => {
      setListening(false);
      setPulse(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
    setPulse(false);
  }

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={listening ? stopListening : startListening}
      disabled={disabled}
      title={listening ? "Stop recording" : "Speak your travel goal"}
      className={`relative flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-poppins text-[11px] font-semibold transition-all ${
        listening
          ? "border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20"
          : "border-[var(--color-border)] bg-white/[0.02] text-[var(--color-muted)] hover:border-[var(--color-cta)]/40 hover:text-[var(--color-headline)]"
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {listening ? (
        <>
          {/* Pulsing ring */}
          <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
          <Stop size={12} weight="fill" />
          <span>Listening...</span>
          <Waveform size={14} className="animate-pulse" />
        </>
      ) : (
        <>
          <MicrophoneStage size={13} weight="fill" />
          <span>Voice Input</span>
        </>
      )}
    </button>
  );
}
