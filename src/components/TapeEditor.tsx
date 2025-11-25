"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ArrowLeft, Mic, Square } from "lucide-react";
import { ProgressiveBlur } from "./ui/progressive-blur";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

interface Tape {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

interface Task {
    task: string;
    time: string | null;
    startTime: string | null;
    endTime: string | null;
}

export default function TapeEditor({ tapeId }: { tapeId: number }) {
    const router = useRouter();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Tape data
    const [tape, setTape] = useState<Tape | null>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Recording
    const {
        isRecording,
        isProcessing,
        error: recordingError,
        startRecording,
        stopRecording,
    } = useAudioRecorder();
    const [transcribedText, setTranscribedText] = useState("");

    // Summarizing
    const [summary, setSummary] = useState("");
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    // Task Extraction
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isExtractingTasks, setIsExtractingTasks] = useState(false);
    const [tasksError, setTasksError] = useState<string | null>(null);
    const [completedTasks, setCompletedTasks] = useState<Set<number>>(
        new Set(),
    );

    // UI state
    const [showSummary, setShowSummary] = useState(false);
    const [showTasks, setShowTasks] = useState(false);

    useEffect(() => {
        const fetchTape = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/tapes/${tapeId}`);
                const data = await response.json();
                if (data.success) {
                    setTape(data.data);
                    setTitle(data.data.title);
                    setContent(data.data.content);
                } else {
                    setError("Failed to load tape");
                }
            } catch (err) {
                setError("Error loading tape");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTape();
    }, [tapeId]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        setHasChanges(true);
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        setHasChanges(true);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await fetch(`/api/tapes/${tapeId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content }),
            });
            const data = await response.json();
            if (data.success) {
                setTape(data.data);
                setHasChanges(false);
            } else {
                setError("Failed to save tape");
            }
        } catch (err) {
            setError("Error saving tape");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this tape?")) return;

        try {
            const response = await fetch(`/api/tapes/${tapeId}`, {
                method: "DELETE",
            });
            const data = await response.json();
            if (data.success) {
                router.push("/");
            } else {
                setError("Failed to delete tape");
            }
        } catch (err) {
            setError("Error deleting tape");
            console.error(err);
        }
    };

    const handleStartRecording = async () => {
        await startRecording();
    };

    const handleStopRecording = async () => {
        const text = await stopRecording();
        if (text && textareaRef.current) {
            const cursorPos = textareaRef.current.selectionStart;
            const currentText = textareaRef.current.value;

            const newText =
                currentText.slice(0, cursorPos) +
                text +
                currentText.slice(cursorPos);

            textareaRef.current.value = newText;
            setContent(newText);

            const newCursorPos = cursorPos + text.length;
            textareaRef.current.selectionStart = newCursorPos;
            textareaRef.current.selectionEnd = newCursorPos;

            const event = new Event("input", { bubbles: true });
            textareaRef.current.dispatchEvent(event);

            setTranscribedText(text);
            setHasChanges(true);
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
        setShowSummary(true);

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
        setShowTasks(true);

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

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-slate-400">Loading...</p>
            </div>
        );
    }

    if (error && !tape) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 to-slate-800">
                <div className="text-center">
                    <p className="mb-4 text-red-400">{error}</p>
                    <Button onClick={() => router.push("/")} variant="outline">
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="relative mx-auto flex h-full max-w-6xl flex-col items-center justify-center">
                {/* Fixed Header */}
                <div className="from-background to-background/0 fixed top-0 z-20 flex w-full max-w-6xl items-center justify-between bg-linear-to-b px-4 pt-8">
                    <div className="flex flex-1">
                        <Button
                            onClick={() => router.push("/")}
                            variant="ghost"
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft size={20} />
                            Home
                        </Button>
                    </div>

                    {/* Title Input */}
                    <div className="flex flex-1 flex-col items-center text-center">
                        <input
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            placeholder="Tape title..."
                            className="w-full text-center text-xl font-semibold focus:outline-none"
                        />
                        {/* Save Status */}
                        {hasChanges && (
                            <div className="text-sm text-amber-400">
                                You have unsaved changes
                            </div>
                        )}
                        {/* Last modified */}
                        <p className="text-muted-foreground text-sm">
                            Last updated:{" "}
                            {tape
                                ? new Date(tape.updatedAt).toLocaleString()
                                : "N/A"}
                        </p>
                    </div>

                    <div className="flex flex-1 justify-end gap-3">
                        {error && (
                            <div className="text-sm text-red-400">{error}</div>
                        )}
                        <Button
                            onClick={handleDelete}
                            variant="destructive"
                            className="flex items-center gap-2"
                        >
                            Delete
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!hasChanges || saving}
                            className="flex items-center gap-2"
                        >
                            {saving ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex h-screen w-full flex-col items-center justify-center pt-20 pb-32">
                    <div className="flex w-full flex-1 gap-6 overflow-hidden px-4">
                        {/* Textarea Container */}
                        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
                            <div className="relative h-full w-full overflow-hidden">
                                <ProgressiveBlur
                                    position="top"
                                    height="200px"
                                    className="fixed"
                                />
                                <textarea
                                    ref={textareaRef}
                                    value={content}
                                    onChange={handleContentChange}
                                    placeholder="Start recording or typing your tape content..."
                                    className="h-full w-full resize-none border-red-500 bg-transparent px-6 py-20 font-mono focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Summary Panel */}
                        {showSummary &&
                            (summary || isSummarizing || summaryError) && (
                                <div className="border-border bg-muted flex w-80 flex-col gap-4 overflow-hidden rounded-lg border p-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-foreground font-semibold">
                                            Summary
                                        </h3>
                                        <button
                                            onClick={() =>
                                                setShowSummary(false)
                                            }
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            ✕
                                        </button>
                                    </div>

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
                        {showTasks &&
                            (tasks.length > 0 ||
                                isExtractingTasks ||
                                tasksError) && (
                                <div className="border-border bg-muted flex w-80 flex-col gap-4 overflow-hidden rounded-lg border p-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-foreground font-semibold">
                                            Tasks
                                        </h3>
                                        <button
                                            onClick={() => setShowTasks(false)}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            ✕
                                        </button>
                                    </div>

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
                                                        toggleTaskCompletion(
                                                            index,
                                                        )
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
                                                                    {
                                                                        task.startTime
                                                                    }
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
                </div>

                {/* Fixed Bottom Control Bar */}
                <div className="border-border bg-background/95 fixed bottom-0 z-20 flex w-full max-w-6xl flex-col gap-4 border-t px-4 py-6">
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
                            {recordingError && (
                                <span className="text-sm font-medium text-red-500">
                                    Error: {recordingError}
                                </span>
                            )}
                            {!isRecording &&
                                !isProcessing &&
                                !recordingError && (
                                    <span className="text-muted-foreground text-sm">
                                        Ready
                                    </span>
                                )}
                        </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex gap-3">
                        <Button
                            onClick={
                                isRecording
                                    ? handleStopRecording
                                    : handleStartRecording
                            }
                            className="flex items-center gap-2"
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
