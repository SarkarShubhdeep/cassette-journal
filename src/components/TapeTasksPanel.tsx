"use client";

import { useState, useEffect } from "react";
import { Reorder } from "framer-motion";
import TaskItem, { TaskItemData } from "./TaskItem";
import { Button } from "./ui/button";
import { RotateCcw, Share, X } from "lucide-react";

interface ExtractedTask {
    task: string;
    time: string | null;
    startTime: string | null;
    endTime: string | null;
}

interface TapeTasksPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onExtractTasks: () => void;
    tasks: ExtractedTask[];
    isExtractingTasks: boolean;
    tasksError: string | null;
}

// Convert extracted tasks to TaskItemData format
function convertToTaskItems(extractedTasks: ExtractedTask[]): TaskItemData[] {
    return extractedTasks.map((task, index) => ({
        id: `task-${index}-${task.task.slice(0, 20)}`,
        text: task.task,
        completed: false,
        time: task.time || undefined,
    }));
}

export default function TapeTasksPanel({
    isOpen,
    onClose,
    onExtractTasks,
    tasks: extractedTasks,
    isExtractingTasks,
    tasksError,
}: TapeTasksPanelProps) {
    const [tasks, setTasks] = useState<TaskItemData[]>([]);

    // Convert extracted tasks when they change
    const extractedTasksJson = JSON.stringify(extractedTasks);
    useEffect(() => {
        if (extractedTasks.length > 0) {
            setTasks(convertToTaskItems(extractedTasks));
        } else {
            setTasks([]);
        }
    }, [extractedTasksJson, extractedTasks]);

    // Show panel if open AND (has tasks OR is loading OR has error)
    if (!isOpen) {
        return null;
    }

    const hasContent =
        tasks.length > 0 ||
        extractedTasks.length > 0 ||
        isExtractingTasks ||
        tasksError;
    if (!hasContent) {
        return null;
    }

    const toggleTask = (id: string) => {
        setTasks(
            tasks.map((task) =>
                task.id === id ? { ...task, completed: !task.completed } : task,
            ),
        );
    };

    const updateText = (id: string, newText: string) => {
        setTasks(
            tasks.map((task) =>
                task.id === id ? { ...task, text: newText } : task,
            ),
        );
    };

    const updateTime = (id: string, newTime: string) => {
        setTasks(
            tasks.map((task) =>
                task.id === id ? { ...task, time: newTime } : task,
            ),
        );
    };

    return (
        <div className="relative flex h-screen max-w-2xl min-w-lg flex-col overflow-hidden border-x">
            {/* Fixed Header */}
            <div className="bg-background flex h-24 w-full items-center justify-between border-b px-4 backdrop-blur">
                <h3 className="text-xl font-medium text-blue-400 dark:text-blue-300">
                    TASKS
                </h3>
                <div className="flex flex-1 justify-end gap-2">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={onExtractTasks}
                    >
                        <RotateCcw />
                    </Button>
                    <Button size="icon" variant="ghost" disabled>
                        <Share />
                    </Button>
                    <Button size="icon" variant="outline" onClick={onClose}>
                        <X />
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-1 flex-col gap-4 overflow-auto p-4">
                {isExtractingTasks && (
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                        <span className="text-sm text-blue-500">
                            Extracting tasks...
                        </span>
                    </div>
                )}

                {tasksError && (
                    <div className="rounded-lg bg-red-500/20 p-3">
                        <p className="text-sm text-red-500">{tasksError}</p>
                    </div>
                )}

                {tasks.length > 0 && (
                    <Reorder.Group
                        axis="y"
                        values={tasks}
                        onReorder={setTasks}
                        className="space-y-2"
                    >
                        {tasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onToggleComplete={() => toggleTask(task.id)}
                                onUpdateText={(newText) =>
                                    updateText(task.id, newText)
                                }
                                onUpdateTime={(newTime) =>
                                    updateTime(task.id, newTime)
                                }
                            />
                        ))}
                    </Reorder.Group>
                )}
            </div>
        </div>
    );
}
