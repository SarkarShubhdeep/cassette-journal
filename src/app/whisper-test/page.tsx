"use client";

import { useRef, useState } from "react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WhisperTestPage() {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { isRecording, isProcessing, error, startRecording, stopRecording } =
        useAudioRecorder();
    const [transcribedText, setTranscribedText] = useState("");

    const handleStartRecording = async () => {
        await startRecording();
    };

    const handleStopRecording = async () => {
        const text = await stopRecording();
        if (text && textareaRef.current) {
            // Get cursor position
            const cursorPos = textareaRef.current.selectionStart;
            const currentText = textareaRef.current.value;

            // Insert text at cursor position
            const newText =
                currentText.slice(0, cursorPos) +
                text +
                currentText.slice(cursorPos);

            // Update textarea
            textareaRef.current.value = newText;

            // Restore cursor position after the inserted text
            const newCursorPos = cursorPos + text.length;
            textareaRef.current.selectionStart = newCursorPos;
            textareaRef.current.selectionEnd = newCursorPos;

            // Trigger change event for any listeners
            const event = new Event("input", { bubbles: true });
            textareaRef.current.dispatchEvent(event);

            setTranscribedText(text);
        }
    };

    return (
        <div className="bg-background flex h-screen w-full flex-col">
            {/* Header */}
            <div className="border-border bg-card border-b p-6">
                <h1 className="text-foreground text-3xl font-bold">
                    Whisper Transcription Test
                </h1>
                <p className="text-muted-foreground mt-2 text-sm">
                    Click the mic button to record, then click stop to
                    transcribe. Text will be inserted at your cursor position.
                </p>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex flex-1 flex-col overflow-hidden p-6">
                {/* Textarea Container */}
                <div className="flex flex-1 flex-col gap-4 overflow-hidden">
                    <label className="text-foreground text-sm font-medium">
                        Text Editor
                    </label>
                    <textarea
                        ref={textareaRef}
                        className="border-border bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary/20 flex-1 resize-none rounded-lg border p-4 font-mono text-sm focus:ring-2 focus:outline-none"
                        placeholder="Click in here and then press the mic button to record. Your transcription will be inserted at the cursor position."
                    />
                </div>

                {/* Control Bar - Fixed at Bottom */}
                <div className="border-border mt-6 flex flex-col gap-4 border-t pt-6">
                    {/* Status Display */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {isRecording && (
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
                                    <span className="text-sm font-medium text-red-500">
                                        Recording...
                                    </span>
                                </div>
                            )}

                            {isProcessing && (
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                                    <span className="text-sm font-medium text-blue-500">
                                        Processing...
                                    </span>
                                </div>
                            )}
                            {error && (
                                <span className="text-sm font-medium text-red-500">
                                    Error: {error}
                                </span>
                            )}
                            {!isRecording && !isProcessing && !error && (
                                <span className="text-muted-foreground text-sm">
                                    Ready
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <Button
                            onClick={
                                isRecording
                                    ? handleStopRecording
                                    : handleStartRecording
                            }
                            // disabled={isRecording || isProcessing}
                            className=""
                        >
                            {isRecording ? (
                                <Square size={20} />
                            ) : (
                                <Mic size={20} />
                            )}
                            {isRecording
                                ? "Stop and Transcribe"
                                : "Start Recording"}
                        </Button>
                    </div>

                    {/* Last Transcription */}
                    {transcribedText && (
                        <div className="border-border bg-muted rounded-lg border p-3">
                            <p className="text-muted-foreground text-xs font-medium">
                                Last Transcription:
                            </p>
                            <p className="text-foreground mt-1 text-sm">
                                {transcribedText}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
