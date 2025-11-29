"use client";

import * as React from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    RowSelectionState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    ChevronLeft,
    ChevronRight,
    Trash2,
    Archive,
    Download,
    Search,
} from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Tape } from "./columns";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    onBatchDelete?: (ids: number[]) => Promise<void>;
    onTitleUpdate?: (id: number, newTitle: string) => Promise<void>;
    editingTapeId?: number | null;
    setEditingTapeId?: (id: number | null) => void;
}

export function TapesDataTable<TData, TValue>({
    columns,
    data,
    onBatchDelete,
    onTitleUpdate,
    editingTapeId,
    setEditingTapeId,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([
        { id: "updatedAt", desc: true },
    ]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
        {},
    );
    const [isDeleting, setIsDeleting] = React.useState(false);
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    // Keyboard shortcut for search (Cmd+K / Ctrl+K)
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            rowSelection,
        },
    });

    const pageCount = table.getPageCount();
    const currentPage = table.getState().pagination.pageIndex;
    const selectedCount = table.getFilteredSelectedRowModel().rows.length;

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | "ellipsis")[] = [];
        const maxVisible = 5;

        if (pageCount <= maxVisible) {
            for (let i = 0; i < pageCount; i++) pages.push(i);
        } else {
            pages.push(0);
            if (currentPage > 2) pages.push("ellipsis");

            const start = Math.max(1, currentPage - 1);
            const end = Math.min(pageCount - 2, currentPage + 1);

            for (let i = start; i <= end; i++) pages.push(i);

            if (currentPage < pageCount - 3) pages.push("ellipsis");
            pages.push(pageCount - 1);
        }

        return pages;
    };

    const handleBatchDelete = async () => {
        if (!onBatchDelete) return;

        const selectedRows = table.getFilteredSelectedRowModel().rows;
        const ids = selectedRows.map((row) => (row.original as Tape).id);

        if (
            !confirm(`Are you sure you want to delete ${ids.length} tape(s)?`)
        ) {
            return;
        }

        setIsDeleting(true);
        try {
            await onBatchDelete(ids);
            setRowSelection({});
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between gap-4 py-4">
                <div className="relative max-w-sm">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                        ref={searchInputRef}
                        placeholder="Search tapes..."
                        value={
                            (table
                                .getColumn("title")
                                ?.getFilterValue() as string) ?? ""
                        }
                        onChange={(event) =>
                            table
                                .getColumn("title")
                                ?.setFilterValue(event.target.value)
                        }
                        className="rounded-none pr-16 pl-9 shadow-none focus-visible:ring-0 focus-visible:outline-none"
                    />
                    <kbd className="bg-muted text-muted-foreground pointer-events-none absolute top-1/2 right-2 hidden h-5 -translate-y-1/2 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium select-none sm:flex">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </div>
                {selectedCount > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">
                            {selectedCount} selected
                        </span>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBatchDelete}
                            disabled={isDeleting}
                            className="rounded-none"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-none"
                                >
                                    <Archive className="mr-2 h-4 w-4" />
                                    Archive
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-3">
                                <p className="text-muted-foreground text-sm">
                                    🚧 Archive feature coming soon!
                                </p>
                            </PopoverContent>
                        </Popover>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-none"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-3">
                                <p className="text-muted-foreground text-sm">
                                    🚧 Export feature coming soon!
                                </p>
                            </PopoverContent>
                        </Popover>
                    </div>
                )}
            </div>
            <div className="min-h-[520px] overflow-hidden border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="align-top"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No tapes found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between py-4">
                <div className="text-muted-foreground text-sm">
                    {table.getFilteredRowModel().rows.length}{" "}
                    {table.getFilteredRowModel().rows.length === 1
                        ? "tape"
                        : "tapes"}
                </div>
                {pageCount > 1 && (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {getPageNumbers().map((page, idx) =>
                            page === "ellipsis" ? (
                                <span
                                    key={`ellipsis-${idx}`}
                                    className="text-muted-foreground px-2"
                                >
                                    ...
                                </span>
                            ) : (
                                <Button
                                    key={page}
                                    variant={
                                        currentPage === page
                                            ? "default"
                                            : "outline"
                                    }
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => table.setPageIndex(page)}
                                >
                                    {page + 1}
                                </Button>
                            ),
                        )}
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
