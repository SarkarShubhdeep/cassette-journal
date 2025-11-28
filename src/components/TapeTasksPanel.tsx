"use client";

import { useEffect, useState } from "react";
import { Reorder, motion, AnimatePresence } from "framer-motion";
import TaskItem, { TaskItemData } from "./TaskItem";
import { Button } from "./ui/button";
import {
    ArrowUpDown,
    Plus,
    RotateCcw,
    Search,
    Share,
    X,
    AlertTriangle,
} from "lucide-react";
import { Badge } from "./ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";

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
    extractedTasks: ExtractedTask[];
    tasks: TaskItemData[];
    setTasks: React.Dispatch<React.SetStateAction<TaskItemData[]>>;
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
    extractedTasks,
    tasks,
    setTasks,
    isExtractingTasks,
    tasksError,
}: TapeTasksPanelProps) {
    const [sortedByTime, setSortedByTime] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [newTaskText, setNewTaskText] = useState("");
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // Convert extracted tasks when they change (from AI extraction)
    const extractedTasksJson = JSON.stringify(extractedTasks);
    useEffect(() => {
        if (extractedTasks.length > 0) {
            setTasks(convertToTaskItems(extractedTasks));
        }
    }, [extractedTasksJson, extractedTasks, setTasks]);

    // Show panel if open AND (has tasks OR is loading OR has error)
    if (!isOpen) {
        return null;
    }

    const hasContent = tasks.length > 0 || isExtractingTasks || tasksError;
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

    const deleteTask = (id: string) => {
        setTasks(tasks.filter((task) => task.id !== id));
    };

    const handleSortByTime = () => {
        if (sortedByTime) {
            // Reset to original order
            setSortedByTime(false);
        } else {
            // Sort by time (tasks with time first, then without)
            const sorted = [...tasks].sort((a, b) => {
                if (a.time && !b.time) return -1;
                if (!a.time && b.time) return 1;
                if (a.time && b.time) {
                    return (
                        new Date(a.time).getTime() - new Date(b.time).getTime()
                    );
                }
                return 0;
            });
            setTasks(sorted);
            setSortedByTime(true);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setShowSearch(false);
            setSearchQuery("");
        }
    };

    const handleAddTask = () => {
        if (newTaskText.trim()) {
            const newTask: TaskItemData = {
                id: `task-${Date.now()}`,
                text: newTaskText.trim(),
                completed: false,
                time: undefined,
            };
            setTasks([...tasks, newTask]);
            setNewTaskText("");
        }
    };

    const handleNewTaskKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddTask();
        }
    };

    const filteredTasks = searchQuery.trim()
        ? tasks.filter((task) =>
              task.text.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : tasks;

    return (
        <motion.div
            className="relative flex h-screen max-w-2xl min-w-md flex-col overflow-hidden border-x"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            layout
        >
            {/* Fixed Header */}
            <div className="bg-background flex h-24 w-full items-center justify-between border-b px-4 backdrop-blur">
                <h3 className="flex items-center gap-2 text-xl font-medium text-blue-500 dark:text-blue-300">
                    TASKS
                    <Badge className="bg-blue-500">{tasks.length}</Badge>
                </h3>
                <div className="flex flex-1 justify-end gap-2">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setShowConfirmDialog(true)}
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
            <div className="relative flex flex-1 flex-col gap-4 overflow-auto pb-24">
                <div className="bg-background sticky top-0 z-20 flex w-full items-center justify-between gap-4 border-b px-4">
                    {/* Sort by time button */}
                    <div className="flex h-10 w-fit items-center">
                        <Button
                            size="sm"
                            variant="ghost"
                            className={`cursor-pointer rounded-none ${
                                sortedByTime
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-blue-500"
                            }`}
                            onClick={handleSortByTime}
                            title={
                                sortedByTime
                                    ? "Click to reset sort order"
                                    : "Click to sort by time"
                            }
                        >
                            <ArrowUpDown />
                            Sort by Time
                        </Button>
                    </div>
                    {/* Animated Search Button/Input */}
                    <AnimatePresence mode="wait">
                        {!showSearch ? (
                            <motion.div
                                key="search-button"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.1 }}
                                className="flex h-10 w-fit items-center"
                            >
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="cursor-pointer rounded-none text-blue-500"
                                    onClick={() => setShowSearch(true)}
                                >
                                    <Search />
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.input
                                key="search-input"
                                type="text"
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                autoFocus
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.1 }}
                                className="placeholder-muted-foreground h-10 w-sm border-l bg-transparent px-3 py-2 font-mono text-sm focus:outline-none"
                            />
                        )}
                    </AnimatePresence>
                </div>
                {isExtractingTasks && (
                    <div className="flex items-center gap-2 px-4">
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
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

                {filteredTasks.length > 0 && (
                    <Reorder.Group
                        axis="y"
                        values={filteredTasks}
                        onReorder={setTasks}
                        className="space-y-2 px-4"
                    >
                        {filteredTasks.map((task) => (
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
                                onDelete={() => deleteTask(task.id)}
                            />
                        ))}
                    </Reorder.Group>
                )}
                {searchQuery.trim() && filteredTasks.length === 0 && (
                    <div className="text-muted-foreground px-4 py-4 text-center text-sm">
                        No tasks match &quot;{searchQuery}&quot;
                    </div>
                )}
            </div>

            {/* Bottom Bar - Add Task */}
            <div className="bg-background absolute bottom-0 z-20 flex h-20 w-full items-center justify-between gap-4 border-t p-4">
                <input
                    type="text"
                    placeholder="Add new task..."
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={handleNewTaskKeyDown}
                    className="placeholder-muted-foreground focus:ring-none h-full flex-1 px-2 py-2 font-mono focus:outline-none"
                />
                <Button
                    size="icon-lg"
                    onClick={handleAddTask}
                    disabled={!newTaskText.trim()}
                    className="h-12 w-12 rounded-none"
                >
                    <Plus />
                </Button>
            </div>

            {/* Confirmation Dialog */}
            <Dialog
                open={showConfirmDialog}
                onOpenChange={setShowConfirmDialog}
            >
                <DialogContent className="">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            <DialogTitle>Regenerate tasks</DialogTitle>
                        </div>
                        <DialogDescription className="mt-2 text-red-600">
                            This action will delete all current tasks and
                            regenerate new ones from your content. Any manual
                            edits or completions will be lost.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-2 gap-2">
                        <span
                            className="hover:bg-accent cursor-pointer px-3 py-2 text-sm"
                            onClick={() => setShowConfirmDialog(false)}
                        >
                            Cancel
                        </span>

                        <span
                            className="bg-foreground hover:bg-foreground/90 text-background cursor-pointer px-3 py-2 text-sm"
                            onClick={() => {
                                setShowConfirmDialog(false);
                                onExtractTasks();
                            }}
                        >
                            Yes, I&apos;m sure
                        </span>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
