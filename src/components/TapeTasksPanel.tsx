"use client";

interface Task {
    task: string;
    time: string | null;
    startTime: string | null;
    endTime: string | null;
}

interface TapeTasksPanelProps {
    isOpen: boolean;
    onClose: () => void;
    tasks: Task[];
    isExtractingTasks: boolean;
    tasksError: string | null;
    completedTasks: Set<number>;
    onToggleTask: (index: number) => void;
}

export default function TapeTasksPanel({
    isOpen,
    onClose,
    tasks,
    isExtractingTasks,
    tasksError,
    completedTasks,
    onToggleTask,
}: TapeTasksPanelProps) {
    if (!isOpen || (!tasks.length && !isExtractingTasks && !tasksError)) {
        return null;
    }

    return (
        <div className="relative flex h-screen max-w-2xl min-w-lg flex-col overflow-hidden border-x">
            {/* Fixed Header */}
            <div className="bg-background flex h-24 w-full items-center justify-between border-b px-4 backdrop-blur">
                <div className="flex flex-1"></div>

                <div className="flex flex-1 flex-col items-center text-center">
                    <h3 className="text-xl font-semibold">Tasks</h3>
                </div>

                <div className="flex flex-1 justify-end">
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground text-2xl"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-1 flex-col gap-4 overflow-auto p-4">
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
                        <p className="text-sm text-red-500">{tasksError}</p>
                    </div>
                )}

                {tasks.length > 0 && (
                    <div className="flex-1 space-y-2">
                        {tasks.map((task, index) => (
                            <div
                                key={index}
                                className="bg-background hover:bg-accent/50 flex cursor-pointer flex-col gap-1 rounded-lg border p-2 transition-colors"
                                onClick={() => onToggleTask(index)}
                            >
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={completedTasks.has(index)}
                                        onChange={() => onToggleTask(index)}
                                        className="mt-1"
                                    />
                                    <span
                                        className={`flex-1 text-sm ${
                                            completedTasks.has(index)
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
        </div>
    );
}
