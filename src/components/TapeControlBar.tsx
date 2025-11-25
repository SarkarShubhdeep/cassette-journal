"use client";

import { Button } from "./ui/button";
import { Mic, Square } from "lucide-react";

interface TapeControlBarProps {
    isRecording: boolean;
    isProcessing: boolean;
    recordingError: string | null;
    isSummarizing: boolean;
    isExtractingTasks: boolean;
    transcribedText: string;
    onStartRecording: () => void;
    onStopRecording: () => void;
    onSummarize: () => void;
    onExtractTasks: () => void;
}

export default function TapeControlBar({
    isRecording,
    isProcessing,
    recordingError,
    isSummarizing,
    isExtractingTasks,
    onStartRecording,
    onStopRecording,
    onSummarize,
    onExtractTasks,
}: TapeControlBarProps) {
    return (
        <div className="z-20 flex h-20 grow items-center justify-between gap-4 border-t px-4">
            {/* left side */}
            <div className="flex space-x-3">
                <Button
                    onClick={isRecording ? onStopRecording : onStartRecording}
                    className="flex items-center gap-2"
                >
                    {isRecording ? <Square size={20} /> : <Mic size={20} />}
                    {isRecording ? "Stop and Transcribe" : "Start Recording"}
                </Button>
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
                                <div className="h-3 w-3 animate-spin rounded-full" />
                                <span className="text-sm font-medium text-blue-500">
                                    Processing...
                                </span>
                            </div>
                        )}
                        {recordingError && (
                            <span className="text-sm font-medium text-red-500">
                                Error: {recordingError}
                            </span>
                        )}
                        {!isRecording && !isProcessing && !recordingError && (
                            <span className="text-muted-foreground text-sm">
                                Ready
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <p className="text-muted-foreground font-mono text-sm">
                Word Cound: 000
            </p>

            {/* right side */}
            <div className="flex items-center gap-3">
                <Button
                    onClick={onSummarize}
                    disabled={isSummarizing || isRecording}
                    variant="outline"
                >
                    {isSummarizing ? "Summarizing..." : "Summarize"}
                </Button>
                <Button
                    onClick={onExtractTasks}
                    disabled={isExtractingTasks || isRecording}
                    variant="outline"
                >
                    {isExtractingTasks ? "Extracting..." : "Extract Tasks"}
                </Button>
            </div>
        </div>
    );
}
