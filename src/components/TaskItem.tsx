"use client";

import { useState } from "react";
import { Reorder } from "framer-motion";
import { GripVertical } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import DateTimePicker from "./DateTimePicker";

export interface TaskItemData {
    id: string;
    text: string;
    completed: boolean;
    time?: string;
}

interface TaskItemProps {
    task: TaskItemData;
    onToggleComplete: () => void;
    onUpdateText: (newText: string) => void;
    onUpdateTime: (newTime: string) => void;
    onDelete: () => void;
}

export default function TaskItem({
    task,
    onToggleComplete,
    onUpdateText,
    onUpdateTime,
    onDelete,
}: TaskItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(task.text);

    const startEditing = () => {
        setIsEditing(true);
        setEditValue(task.text);
    };

    const saveEdit = () => {
        if (editValue.trim()) {
            onUpdateText(editValue.trim());
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            saveEdit();
        } else if (e.key === "Escape") {
            e.preventDefault();
            setIsEditing(false);
            setEditValue(task.text);
        }
    };

    return (
        <Reorder.Item
            value={task}
            className="group flex cursor-grab items-center justify-between border border-blue-300/20 bg-blue-300/20 p-2 transition-all duration-200 active:cursor-grabbing"
            style={{ position: "relative" }}
        >
            <div className="flex grow items-start gap-3">
                <Checkbox
                    checked={task.completed}
                    className="border-foreground/50 mt-1 ml-1 shrink-0 rounded-none shadow-none"
                    onCheckedChange={onToggleComplete}
                />

                <p
                    className={`flex flex-1 flex-col px-1 ${
                        task.completed ? "text-muted-foreground" : ""
                    }`}
                >
                    {isEditing ? (
                        <input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={saveEdit}
                            autoFocus
                            className="mb-1 w-full min-w-full p-0 font-mono focus:ring-0 focus:outline-none"
                        />
                    ) : (
                        <span
                            onClick={startEditing}
                            className={`hover:bg-accent/30 mb-1 block cursor-text rounded font-mono ${
                                task.completed ? "line-through" : ""
                            }`}
                        >
                            {task.text}
                        </span>
                    )}
                    <div className="flex items-center gap-3">
                        <DateTimePicker
                            value={task.time || null}
                            onChange={onUpdateTime}
                        />
                        <button
                            onClick={onDelete}
                            className="ml-2 hidden cursor-pointer rounded text-xs font-bold text-red-400 transition-all duration-200 group-hover:block hover:text-red-500"
                        >
                            Delete
                        </button>
                    </div>
                </p>
            </div>
            <GripVertical size={16} className="text-muted-foreground" />
        </Reorder.Item>
    );
}
