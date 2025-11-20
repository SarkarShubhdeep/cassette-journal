import { useCallback, useRef, useState } from "react";
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";

interface TranscriptionState {
    isRecording: boolean;
    transcript: string;
    isLoading: boolean;
    error: string | null;
    livePreview: string; // Current sentence being spoken
}

export function useTranscription(
    onTranscriptUpdate?: (text: string) => void,
    currentContent: string = "",
) {
    const [state, setState] = useState<TranscriptionState>({
        isRecording: false,
        transcript: "",
        isLoading: false,
        error: null,
        livePreview: "",
    });

    // Using unknown type for Deepgram connection as SDK types are complex
    const connectionRef = useRef<unknown>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const interimTranscriptRef = useRef<string>("");
    const accumulatedTranscriptRef = useRef<string>("");

    const startRecording = useCallback(async () => {
        try {
            // Initialize accumulated transcript from current content
            accumulatedTranscriptRef.current = currentContent;
            interimTranscriptRef.current = "";

            setState((prev) => ({
                ...prev,
                isLoading: true,
                error: null,
            }));

            // Step 1: Get temporary key from backend
            console.log("Fetching temporary Deepgram key...");
            const response = await fetch("/api/deepgram-token", {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Failed to get Deepgram token");
            }

            const { key } = await response.json();

            if (!key) {
                throw new Error("No key returned from backend");
            }

            console.log("✓ Temporary key received");

            // Step 2: Create Deepgram client with temporary key
            const deepgram = createClient(key);

            // Step 3: Get microphone stream
            console.log("Requesting microphone access...");
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });
            streamRef.current = stream;
            console.log("✓ Microphone access granted");

            // Step 4: Create live transcription connection
            console.log("Connecting to Deepgram...");
            const connection = deepgram.listen.live({
                model: "nova-2",
                language: "en",
                smart_format: true,
                interim_results: true,
            });

            connectionRef.current = connection;

            // Step 5: Set up event listeners
            connection.on(LiveTranscriptionEvents.Open, () => {
                console.log("✓ Connected to Deepgram");
                setState((prev) => ({
                    ...prev,
                    isRecording: true,
                    isLoading: false,
                }));

                // Start sending audio data
                const mediaRecorder = new MediaRecorder(stream, {
                    mimeType: "audio/webm",
                });

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0 && connection) {
                        connection.send(event.data);
                    }
                };

                mediaRecorder.start(250); // Send data every 250ms
                mediaRecorderRef.current = mediaRecorder;
                console.log("✓ Audio streaming started");
            });

            connection.on(LiveTranscriptionEvents.Transcript, (data) => {
                const transcript = data.channel?.alternatives?.[0]?.transcript;

                if (transcript && transcript.trim() !== "") {
                    if (data.is_final) {
                        // Final transcript - sentence complete!
                        // 1. Add to accumulated transcript
                        const newTranscript =
                            accumulatedTranscriptRef.current +
                            (accumulatedTranscriptRef.current ? " " : "") +
                            transcript;

                        accumulatedTranscriptRef.current = newTranscript;

                        // 2. Update state and clear live preview
                        setState((prev) => ({
                            ...prev,
                            transcript: newTranscript,
                            livePreview: "", // Clear the floating window
                        }));

                        // 3. Update textarea
                        onTranscriptUpdate?.(newTranscript);
                    } else {
                        // Interim result - show in floating preview window
                        setState((prev) => ({
                            ...prev,
                            livePreview: transcript, // Show current sentence
                        }));

                        // Also update textarea with preview
                        const previewText =
                            accumulatedTranscriptRef.current +
                            (accumulatedTranscriptRef.current ? " " : "") +
                            transcript;
                        onTranscriptUpdate?.(previewText);
                    }
                }
            });

            connection.on(LiveTranscriptionEvents.Error, (error) => {
                console.error("Deepgram error:", error);
                setState((prev) => ({
                    ...prev,
                    error: "Transcription error occurred",
                    isRecording: false,
                }));
            });

            connection.on(LiveTranscriptionEvents.Close, () => {
                console.log("Deepgram connection closed");
                setState((prev) => ({
                    ...prev,
                    isRecording: false,
                }));
            });
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Unknown error";
            console.error("Recording error:", message);
            setState((prev) => ({
                ...prev,
                error: message,
                isLoading: false,
                isRecording: false,
            }));
        }
    }, [onTranscriptUpdate, currentContent]);

    const stopRecording = useCallback(() => {
        console.log("Stopping recording...");

        // Stop media recorder
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current = null;
        }

        // Stop microphone stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        // Close Deepgram connection
        if (connectionRef.current) {
            // Type assertion since we know the connection has these methods
            const connection = connectionRef.current as unknown as {
                finish?: () => void;
            };
            connection.finish?.();
            connectionRef.current = null;
        }

        // Clear interim transcript
        interimTranscriptRef.current = "";

        setState((prev) => ({
            ...prev,
            isRecording: false,
        }));

        console.log("✓ Recording stopped");
    }, []);

    const resetTranscript = useCallback(() => {
        setState((prev) => ({
            ...prev,
            transcript: "",
        }));
    }, []);

    return {
        ...state,
        startRecording,
        stopRecording,
        resetTranscript,
    };
}
