"use client";

import { useRef, useState } from "react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WhisperTestPage() {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Recording
    const { isRecording, isProcessing, error, startRecording, stopRecording } =
        useAudioRecorder();
    const [transcribedText, setTranscribedText] = useState("");

    // Summarizing
    const [summary, setSummary] = useState("");
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    // Task Extraction
    interface Task {
        task: string;
        time: string | null;
        startTime: string | null;
        endTime: string | null;
    }
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isExtractingTasks, setIsExtractingTasks] = useState(false);
    const [tasksError, setTasksError] = useState<string | null>(null);
    const [completedTasks, setCompletedTasks] = useState<Set<number>>(
        new Set(),
    );

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

    const handleSummarize = async () => {
        const currentText = textareaRef.current?.value;

        if (!currentText || currentText.trim().length === 0) {
            setSummaryError("Please enter some text to summarize");
            return;
        }

        setIsSummarizing(true);
        setSummaryError(null);
        setSummary("");

        try {
            const response = await fetch("/api/summarize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: currentText }),
            });

            if (!response.ok) {
                const error = await response.json();
                setSummaryError(error.error || "Failed to generate summary");
                return;
            }

            const data = await response.json();
            setSummary(data.summary);
        } catch (error) {
            console.error("Summarization error:", error);
            setSummaryError("An error occurred while summarizing");
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleExtractTasks = async () => {
        const currentText = textareaRef.current?.value;

        if (!currentText || currentText.trim().length === 0) {
            setTasksError("Please enter some text to extract tasks");
            return;
        }

        setIsExtractingTasks(true);
        setTasksError(null);
        setTasks([]);
        setCompletedTasks(new Set());

        try {
            const response = await fetch("/api/extract-tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: currentText }),
            });

            if (!response.ok) {
                const error = await response.json();
                setTasksError(error.error || "Failed to extract tasks");
                return;
            }

            const data = await response.json();
            setTasks(data.tasks);
        } catch (error) {
            console.error("Task extraction error:", error);
            setTasksError("An error occurred while extracting tasks");
        } finally {
            setIsExtractingTasks(false);
        }
    };

    const toggleTaskCompletion = (index: number) => {
        const newCompleted = new Set(completedTasks);
        if (newCompleted.has(index)) {
            newCompleted.delete(index);
        } else {
            newCompleted.add(index);
        }
        setCompletedTasks(newCompleted);
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
                <div className="flex flex-1 gap-6 overflow-hidden">
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

                    {/* Summary Panel */}
                    {(summary || isSummarizing || summaryError) && (
                        <div className="border-border bg-muted flex w-80 flex-col gap-4 overflow-hidden rounded-lg border p-4">
                            <h3 className="text-foreground font-semibold">
                                Summary
                            </h3>

                            {isSummarizing && (
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                                    <span className="text-sm text-blue-500">
                                        Generating summary...
                                    </span>
                                </div>
                            )}

                            {summaryError && (
                                <div className="rounded-lg bg-red-500/20 p-3">
                                    <p className="text-sm text-red-500">
                                        {summaryError}
                                    </p>
                                </div>
                            )}

                            {summary && (
                                <div className="flex-1 overflow-auto">
                                    <p className="text-foreground text-sm whitespace-pre-wrap">
                                        {summary}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tasks Panel */}
                    {(tasks.length > 0 || isExtractingTasks || tasksError) && (
                        <div className="border-border bg-muted flex w-80 flex-col gap-4 overflow-hidden rounded-lg border p-4">
                            <h3 className="text-foreground font-semibold">
                                Tasks
                            </h3>

                            {isExtractingTasks && (
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                                    <span className="text-sm text-green-500">
                                        Extracting tasks...
                                    </span>
                                </div>
                            )}

                            {tasksError && (
                                <div className="rounded-lg bg-red-500/20 p-3">
                                    <p className="text-sm text-red-500">
                                        {tasksError}
                                    </p>
                                </div>
                            )}

                            {tasks.length > 0 && (
                                <div className="flex-1 space-y-2 overflow-auto">
                                    {tasks.map((task, index) => (
                                        <div
                                            key={index}
                                            className="bg-background hover:bg-accent/50 flex cursor-pointer flex-col gap-1 rounded-lg p-2 transition-colors"
                                            onClick={() =>
                                                toggleTaskCompletion(index)
                                            }
                                        >
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={completedTasks.has(
                                                        index,
                                                    )}
                                                    onChange={() =>
                                                        toggleTaskCompletion(
                                                            index,
                                                        )
                                                    }
                                                    className="mt-1"
                                                />
                                                <span
                                                    className={`flex-1 text-sm ${
                                                        completedTasks.has(
                                                            index,
                                                        )
                                                            ? "text-muted-foreground line-through"
                                                            : "text-foreground"
                                                    }`}
                                                >
                                                    {task.task}
                                                </span>
                                            </div>
                                            {(task.time ||
                                                task.startTime ||
                                                task.endTime) && (
                                                <div className="ml-7 flex items-center gap-2">
                                                    {task.time && (
                                                        <span className="text-xs font-semibold text-blue-500">
                                                            {task.time}
                                                        </span>
                                                    )}
                                                    {task.startTime && (
                                                        <span className="text-xs text-blue-500">
                                                            {task.startTime}
                                                            {task.endTime &&
                                                                ` - ${task.endTime}`}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
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
                        <Button
                            onClick={handleSummarize}
                            disabled={isSummarizing || isRecording}
                            variant="outline"
                        >
                            {isSummarizing ? "Summarizing..." : "Summarize"}
                        </Button>
                        <Button
                            onClick={handleExtractTasks}
                            disabled={isExtractingTasks || isRecording}
                            variant="outline"
                        >
                            {isExtractingTasks
                                ? "Extracting..."
                                : "Extract Tasks"}
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
