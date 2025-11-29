"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
    MoreHorizontal,
    ArrowUpDown,
    Trash2,
    ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Tape {
    id: number;
    title: string;
    content: string;
    summary?: string | null;
    shortSummary?: string | null;
    createdAt: string;
    updatedAt: string;
}

interface TitleCellProps {
    tape: Tape;
    isEditing: boolean;
    setEditingTapeId?: (id: number | null) => void;
    onTitleUpdate?: (id: number, newTitle: string) => Promise<void>;
}

function TitleCell({
    tape,
    isEditing,
    setEditingTapeId,
    onTitleUpdate,
}: TitleCellProps) {
    const [inputValue, setInputValue] = useState(tape.title || "");

    const handleSave = async () => {
        const finalTitle = inputValue.trim() || "Untitled";
        if (onTitleUpdate) {
            await onTitleUpdate(tape.id, finalTitle);
        }
        setEditingTapeId?.(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSave();
        } else if (e.key === "Escape") {
            setEditingTapeId?.(null);
        }
    };

    if (isEditing) {
        return (
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-48 border-none bg-transparent font-medium outline-none focus:ring-0 focus:outline-none"
            />
        );
    }

    return (
        <Link
            href={`/tapes/${tape.id}`}
            className="block w-48 font-medium hover:underline"
        >
            <span className="line-clamp-3 whitespace-normal">
                {tape.title || "Untitled"}
            </span>
        </Link>
    );
}

export const createColumns = (
    onDelete: (id: number) => void,
    showSummary: boolean = false,
    editingTapeId?: number | null,
    setEditingTapeId?: (id: number | null) => void,
    onTitleUpdate?: (id: number, newTitle: string) => Promise<void>,
): ColumnDef<Tape>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
                className="rounded-none shadow-none"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="rounded-none shadow-none"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "title",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                    className="-ml-4"
                >
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const tape = row.original;
            const isEditing = editingTapeId === tape.id;
            return (
                <TitleCell
                    tape={tape}
                    isEditing={isEditing}
                    setEditingTapeId={setEditingTapeId}
                    onTitleUpdate={onTitleUpdate}
                />
            );
        },
        size: 192,
    },
    {
        id: "preview",
        accessorFn: (row) => (showSummary ? row.shortSummary : row.content),
        header: showSummary ? "Summary" : "Preview",
        cell: ({ row }) => {
            const tape = row.original;
            const text = showSummary ? tape.shortSummary : tape.content;

            // In preview mode, show only first 20 chars with ellipsis
            const displayText = showSummary
                ? text
                : text
                  ? text.slice(0, 45) + (text.length > 45 ? "..." : "")
                  : null;

            return (
                <span
                    className={`text-muted-foreground block w-64 ${
                        showSummary
                            ? "line-clamp-3 whitespace-normal"
                            : "truncate"
                    }`}
                >
                    {displayText ||
                        (showSummary
                            ? "No summary yet..."
                            : "No content yet...")}
                </span>
            );
        },
        size: 256,
    },
    {
        accessorKey: "updatedAt",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                    className="-ml-4"
                >
                    Last Updated
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const date = new Date(row.getValue("updatedAt"));
            return (
                <span className="text-muted-foreground">
                    {date.toLocaleDateString()}
                </span>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                    className="-ml-4"
                >
                    Created
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"));
            return (
                <span className="text-muted-foreground">
                    {date.toLocaleDateString()}
                </span>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const tape = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <a
                                href={`/tapes/${tape.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex cursor-pointer items-center justify-between"
                            >
                                Edit in New Tab
                                <ArrowUpRight className="h-4 w-4" />
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => setEditingTapeId?.(tape.id)}
                        >
                            Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => onDelete(tape.id)}
                            className="flex cursor-pointer items-center justify-between hover:bg-red-500/20!"
                        >
                            Delete
                            <Trash2 className="h-4 w-4" />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
