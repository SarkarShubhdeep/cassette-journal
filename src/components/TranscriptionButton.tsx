"use client";

import { useEffect, useState } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "./ui/button";
import { useTranscription } from "@/hooks/useTranscription";

interface TranscriptionButtonProps {
    onTranscriptUpdate?: (text: string) => void;
    currentContent?: string;
    onRecordingStart?: () => void;
}

export function TranscriptionButton({
    onTranscriptUpdate,
    currentContent = "",
    onRecordingStart,
}: TranscriptionButtonProps) {
    const {
        isRecording,
        isLoading,
        error,
        livePreview,
        startRecording,
        stopRecording,
    } = useTranscription(onTranscriptUpdate, currentContent);

    const [blinking, setBlinking] = useState(false);

    // Blinking effect when recording
    useEffect(() => {
        if (!isRecording) {
            setBlinking(false);
            return;
        }

        const interval = setInterval(() => {
            setBlinking((prev) => !prev);
        }, 500);

        return () => clearInterval(interval);
    }, [isRecording]);

    const handleClick = async () => {
        if (isRecording) {
            stopRecording();
        } else {
            onRecordingStart?.(); // Call before starting recording
            await startRecording();
        }
    };

    return (
        <div className="relative flex flex-col items-center gap-2">
            {/* Floating Live Preview Window */}
            {isRecording && livePreview && (
                <div className="animate-in fade-in slide-in-from-bottom-2 absolute bottom-[80px] left-1/2 z-50 w-[300px] -translate-x-1/2">
                    <div className="border-border bg-background/95 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm">
                        <p className="text-muted-foreground mb-1 text-xs font-medium">
                            Listening...
                        </p>
                        <p className="text-foreground text-sm leading-relaxed">
                            {livePreview}
                        </p>
                    </div>
                    {/* Arrow pointing to mic button */}
                    <div className="border-t-border absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 border-t-8 border-r-8 border-l-8 border-r-transparent border-l-transparent"></div>
                </div>
            )}

            <Button
                onClick={handleClick}
                disabled={isLoading}
                className={`h-[60px] w-[60px] rounded-full transition-all ${
                    isRecording
                        ? blinking
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-red-500 hover:bg-red-600"
                        : "bg-linear-to-br from-lime-500 to-blue-500"
                }`}
            >
                {isRecording ? (
                    <Square className="h-6 w-6 fill-white text-white" />
                ) : (
                    <Mic className="h-6 w-6 text-white" />
                )}
            </Button>
            {error && <p className="text-xs text-red-500">{error}</p>}
            {isLoading && (
                <p className="text-muted-foreground text-xs">Initializing...</p>
            )}
        </div>
    );
}
