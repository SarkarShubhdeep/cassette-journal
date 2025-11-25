"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import TapeHeader from "./TapeHeader";
import TapeControlBar from "./TapeControlBar";
import TapeSummaryPanel from "./TapeSummaryPanel";
import TapeTasksPanel from "./TapeTasksPanel";

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

    const handleShare = async () => {
        if (!confirm("Are you sure you want to share this tape?")) return;
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
            <div className="flex h-full w-full justify-center gap-3 overflow-hidden">
                {/* Main Tape Area */}
                <div className="relative flex h-screen max-w-6xl min-w-lg grow flex-col border-x">
                    {/* Tape Header */}
                    <div className="w-full">
                        <TapeHeader
                            title={title}
                            onTitleChange={handleTitleChange}
                            hasChanges={hasChanges}
                            tape={tape}
                            error={error}
                            saving={saving}
                            onSave={handleSave}
                            onDelete={handleDelete}
                            onShare={handleShare}
                        />
                    </div>

                    {/* Content Area */}
                    <div className="flex w-full flex-1 grow gap-6 overflow-hidden pb-20">
                        {/* Textarea Container */}
                        <div className="flex w-full flex-1 flex-col gap-4 overflow-hidden">
                            <div className="relative h-full w-full">
                                <textarea
                                    ref={textareaRef}
                                    value={content}
                                    onChange={handleContentChange}
                                    placeholder="Start recording or typing your tape content..."
                                    className="h-full w-full resize-none bg-transparent px-4 py-16 font-mono focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tape Control Bar - Fixed at bottom */}
                    <div className="absolute bottom-0 w-full">
                        <TapeControlBar
                            isRecording={isRecording}
                            isProcessing={isProcessing}
                            recordingError={recordingError}
                            isSummarizing={isSummarizing}
                            isExtractingTasks={isExtractingTasks}
                            transcribedText={transcribedText}
                            onStartRecording={handleStartRecording}
                            onStopRecording={handleStopRecording}
                            onSummarize={handleSummarize}
                            onExtractTasks={handleExtractTasks}
                        />
                    </div>
                </div>

                {/* Summary Panel */}
                <TapeSummaryPanel
                    isOpen={showSummary}
                    onClose={() => setShowSummary(false)}
                    summary={summary}
                    isSummarizing={isSummarizing}
                    summaryError={summaryError}
                />

                {/* Tasks Panel */}
                <TapeTasksPanel
                    isOpen={showTasks}
                    onClose={() => setShowTasks(false)}
                    tasks={tasks}
                    isExtractingTasks={isExtractingTasks}
                    tasksError={tasksError}
                    completedTasks={completedTasks}
                    onToggleTask={toggleTaskCompletion}
                />
            </div>
        </div>
    );
}
