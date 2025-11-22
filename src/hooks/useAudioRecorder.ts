import { useState, useRef, useCallback } from "react";

interface UseAudioRecorderReturn {
    isRecording: boolean;
    isProcessing: boolean;
    error: string | null;
    audioContext: AudioContext | null;
    analyser: AnalyserNode | null;
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<string | null>;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });

            // Create audio context for visualization
            const AudioContextClass =
                window.AudioContext ||
                (
                    window as unknown as {
                        webkitAudioContext: typeof AudioContext;
                    }
                ).webkitAudioContext;
            const audioContext =
                audioContextRef.current || new AudioContextClass();
            audioContextRef.current = audioContext;

            // Create analyser node
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;

            // Create source from stream
            const source = audioContext.createMediaStreamSource(stream);
            sourceRef.current = source;
            source.connect(analyser);

            const mediaRecorder = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                chunksRef.current.push(event.data);
            };

            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to start recording";
            setError(message);
            console.error("Recording error:", err);
        }
    }, []);

    const stopRecording = useCallback(async (): Promise<string | null> => {
        return new Promise((resolve) => {
            if (!mediaRecorderRef.current) {
                setError("No recording in progress");
                resolve(null);
                return;
            }

            const mediaRecorder = mediaRecorderRef.current;
            setIsProcessing(true);

            mediaRecorder.onstop = async () => {
                try {
                    // Stop all audio tracks
                    mediaRecorder.stream
                        .getTracks()
                        .forEach((track) => track.stop());

                    // Create audio blob
                    const audioBlob = new Blob(chunksRef.current, {
                        type: "audio/webm",
                    });

                    // Send to API
                    const formData = new FormData();
                    formData.append("audio", audioBlob, "recording.webm");

                    const response = await fetch("/api/whisper-transcribe", {
                        method: "POST",
                        body: formData,
                    });

                    if (!response.ok) {
                        throw new Error("Transcription failed");
                    }

                    const data = await response.json();
                    setIsRecording(false);
                    setIsProcessing(false);
                    resolve(data.text);
                } catch (err) {
                    const message =
                        err instanceof Error
                            ? err.message
                            : "Transcription error";
                    setError(message);
                    setIsRecording(false);
                    setIsProcessing(false);
                    console.error("Transcription error:", err);
                    resolve(null);
                }
            };

            mediaRecorder.stop();
        });
    }, []);

    return {
        isRecording,
        isProcessing,
        error,
        audioContext: audioContextRef.current,
        analyser: analyserRef.current,
        startRecording,
        stopRecording,
    };
}
