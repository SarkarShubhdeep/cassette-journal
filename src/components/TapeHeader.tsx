"use client";

import { Button } from "./ui/button";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface TapeHeaderProps {
    title: string;
    onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    hasChanges: boolean;
    tape: { updatedAt: string } | null;
    error: string | null;
    saving: boolean;
    onSave: () => void;
    onDelete: () => void;
    onShare: () => void;
}

export default function TapeHeader({
    title,
    onTitleChange,
    hasChanges,
    tape,
    error,
    saving,
    onSave,
    onDelete,
    onShare,
}: TapeHeaderProps) {
    const router = useRouter();

    return (
        <div className="bg-background flex h-24 w-full flex-1 items-center justify-between border-b px-4 backdrop-blur">
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
                    onChange={onTitleChange}
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
                    {tape ? new Date(tape.updatedAt).toLocaleString() : "N/A"}
                </p>
            </div>

            <div className="flex flex-1 justify-end gap-3">
                {error && <div className="text-sm text-red-400">{error}</div>}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2"
                            size="icon"
                        >
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onShare}>
                            Share
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onDelete}>
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button
                    onClick={onSave}
                    disabled={!hasChanges || saving}
                    className="flex items-center gap-2"
                >
                    {saving ? "Saving..." : "Save"}
                </Button>
            </div>
        </div>
    );
}
