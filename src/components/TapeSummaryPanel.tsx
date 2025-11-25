"use client";

interface TapeSummaryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    summary: string;
    isSummarizing: boolean;
    summaryError: string | null;
}

export default function TapeSummaryPanel({
    isOpen,
    onClose,
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
                <div className="flex flex-1"></div>

                <div className="flex flex-1 flex-col items-center text-center">
                    <h3 className="text-xl font-semibold">
                        Summary of the day
                    </h3>
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
                        <p className="text-sm text-red-500">{summaryError}</p>
                    </div>
                )}

                {summary && (
                    <div className="flex-1">
                        <p className="text-foreground whitespace-pre-wrap">
                            {summary}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
