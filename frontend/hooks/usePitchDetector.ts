import { useCallback, useEffect, useRef, useState } from "react";

// ── Note mapping ────────────────────────────────────────────
const NOTE_NAMES = ["Do","Do#","Re","Re#","Mi","Fa","Fa#","Sol","Sol#","La","La#","Si"];

export function freqToNote(freq: number): { note: string; octave: number; cents: number } | null {
  if (freq <= 50 || freq > 2500) return null;
  const noteNum = 12 * Math.log2(freq / 440) + 69;
  const rounded  = Math.round(noteNum);
  const cents    = Math.round((noteNum - rounded) * 100);
  const note     = NOTE_NAMES[((rounded % 12) + 12) % 12];
  const octave   = Math.floor(rounded / 12) - 1;
  return { note, octave, cents };
}

// ── Pitch via FFT magnitude peak (fast, works for voice & instruments) ──
function detectFrequency(analyser: AnalyserNode, sampleRate: number): number {
  const freqData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(freqData);

  const binHz  = (sampleRate / 2) / analyser.frequencyBinCount;
  const minBin = Math.max(1, Math.floor(70  / binHz));
  const maxBin = Math.min(freqData.length - 1, Math.ceil(1400 / binHz));

  let maxVal = 0, maxIdx = minBin;
  for (let i = minBin; i <= maxBin; i++) {
    if (freqData[i] > maxVal) { maxVal = freqData[i]; maxIdx = i; }
  }

  // Too quiet — ignore noise
  if (maxVal < 35) return -1;

  // Parabolic interpolation for sub-bin precision
  const y1 = freqData[maxIdx - 1] ?? 0;
  const y2 = freqData[maxIdx];
  const y3 = freqData[maxIdx + 1] ?? 0;
  const denom = y1 - 2 * y2 + y3;
  const delta = denom !== 0 ? (0.5 * (y1 - y3)) / denom : 0;
  return (maxIdx + delta) * binHz;
}

// ── Hook ────────────────────────────────────────────────────
export interface PitchState {
  note: string;        // e.g. "La"
  octave: number;      // e.g. 4
  cents: number;       // -50 to +50
  frequency: number;   // Hz
  volume: number;      // 0-255 (raw loudness)
  isListening: boolean;
  error: string;
  start: () => Promise<void>;
  stop: () => void;
}

export function usePitchDetector(): PitchState {
  const [note,      setNote]      = useState("");
  const [octave,    setOctave]    = useState(4);
  const [cents,     setCents]     = useState(0);
  const [frequency, setFrequency] = useState(0);
  const [volume,    setVolume]    = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [error,     setError]     = useState("");

  const ctxRef      = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode  | null>(null);
  const streamRef   = useRef<MediaStream  | null>(null);
  const rafRef      = useRef<number       | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current)    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (ctxRef.current && ctxRef.current.state !== "closed") ctxRef.current.close();
    rafRef.current = null; streamRef.current = null; ctxRef.current = null;
    setIsListening(false);
    setNote(""); setFrequency(0); setVolume(0);
  }, []);

  const start = useCallback(async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const ctx = new AudioContext();
      ctxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;        // high frequency resolution
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      ctx.createMediaStreamSource(stream).connect(analyser);
      setIsListening(true);

      // Loudness buffer for volume meter
      const timeDom = new Uint8Array(analyser.fftSize);

      const loop = () => {
        const freq = detectFrequency(analyser, ctx.sampleRate);

        // Volume
        analyser.getByteTimeDomainData(timeDom);
        let sum = 0;
        for (let i = 0; i < timeDom.length; i++) {
          const v = (timeDom[i] - 128) / 128;
          sum += v * v;
        }
        setVolume(Math.round(Math.sqrt(sum / timeDom.length) * 255));

        if (freq > 0) {
          setFrequency(Math.round(freq * 10) / 10);
          const result = freqToNote(freq);
          if (result) {
            setNote(result.note);
            setOctave(result.octave);
            setCents(result.cents);
          }
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);

    } catch (e: any) {
      const msg = e?.name === "NotAllowedError"
        ? "Permiso de micrófono denegado. Habilítalo en el navegador."
        : "No se pudo acceder al micrófono.";
      setError(msg);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stop(), [stop]);

  return { note, octave, cents, frequency, volume, isListening, error, start, stop };
}
