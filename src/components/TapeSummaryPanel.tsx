"use client";
import { Button } from "./ui/button";
import { RotateCcw, X } from "lucide-react";

interface TapeSummaryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onSummarize: () => void;
    summary: string;
    isSummarizing: boolean;
    summaryError: string | null;
}

export default function TapeSummaryPanel({
    isOpen,
    onClose,
    onSummarize,
    summary,
    isSummarizing,
    summaryError,
}: TapeSummaryPanelProps) {
    if (!isOpen || (!summary && !isSummarizing && !summaryError)) {
        return null;
    }

    return (
        <div className="relative flex h-screen max-w-2xl min-w-lg flex-col overflow-hidden border-x">
            {/* Fixed Header */}
            <div className="bg-background flex h-24 w-full items-center justify-between border-b px-4 backdrop-blur">
                <h3 className="text-xl font-medium text-green-400 dark:text-green-300">
                    SUMMARY OF YOUR DAY
                </h3>
                <div className="flex flex-1 justify-end gap-2">
                    <Button size="icon" variant="ghost" onClick={onSummarize}>
                        <RotateCcw />
                    </Button>
                    <Button size="icon" variant="outline" onClick={onClose}>
                        <X />
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-1 flex-col gap-4 overflow-auto p-4">
                {isSummarizing && (
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                        <span className="text-sm text-green-500">
                            Generating summary...
                        </span>
                    </div>
                )}

                {summaryError && (
                    <div className="rounded-lg bg-red-500/20 p-3">
                        <p className="text-sm text-red-500">{summaryError}</p>
                    </div>
                )}

                {summary && (
                    <div className="flex flex-col gap-2">
                        {summary
                            .split(/^-\s*/m)
                            .filter((point) => point.trim())
                            .map((point, index) => (
                                <div
                                    key={index}
                                    className="text-foreground w-fit rounded-4xl border border-green-300/20 bg-green-300/20 p-4 px-6 font-mono"
                                >
                                    {point.trim()}
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
