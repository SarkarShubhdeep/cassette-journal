"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

import { Mic, ChevronUp, AlertTriangle } from "lucide-react";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerClose,
} from "./ui/drawer";

interface TapeControlBarProps {
    isRecording: boolean;
    isProcessing: boolean;
    recordingError: string | null;
    isSummarizing: boolean;
    isExtractingTasks: boolean;
    transcribedText: string;
    hasSummary: boolean;
    hasTasks: boolean;
    isSummaryOpen: boolean;
    isTasksOpen: boolean;
    onStartRecording: () => void;
    onStopRecording: () => void;
    onSummarize: () => void;
    onExtractTasks: () => void;
    onToggleSummary: () => void;
    onToggleTasks: () => void;
}

export default function TapeControlBar({
    isRecording,
    isProcessing,
    recordingError,
    isSummarizing,
    isExtractingTasks,
    transcribedText,
    hasSummary,
    hasTasks,
    isSummaryOpen,
    isTasksOpen,
    onStartRecording,
    onStopRecording,
    onSummarize,
    onExtractTasks,
    onToggleSummary,
    onToggleTasks,
}: TapeControlBarProps) {
    const hasContent = transcribedText.trim().length > 0;
    return (
        <div className="z-20 flex h-20 grow items-center justify-between gap-4 border-t px-4">
            {/* left side */}
            <div className="flex space-x-3">
                <Button
                    size="icon-lg"
                    onClick={isRecording ? onStopRecording : onStartRecording}
                    className="h-12 w-12 rounded-none"
                >
                    {isRecording ? (
                        <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
                    ) : (
                        <Mic />
                    )}
                </Button>

                <Drawer direction="left">
                    <DrawerTrigger asChild>
                        <button className="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-12 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50">
                            View recordings
                            <Badge>1</Badge>
                        </button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader className="flex h-24 flex-col justify-center border-b px-4">
                            <DrawerTitle className="text-xl font-medium">
                                RECORDINGS IN THIS TAPE
                            </DrawerTitle>
                            <DrawerDescription className="">
                                Listen to your recorded parts form this journal
                                entry
                            </DrawerDescription>
                        </DrawerHeader>
                        <p className="flex h-24 items-center gap-2 p-4 text-center text-yellow-600">
                            <AlertTriangle /> Future feature
                        </p>
                        <DrawerFooter>
                            <DrawerClose>Close</DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>

                {/* Status Display */}
                <div className="flex hidden items-center justify-between">
                    <div className="flex items-center gap-2">
                        {isRecording && (
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
                                <span className="text-sm font-bold text-red-500">
                                    Recording...
                                </span>
                            </div>
                        )}

                        {isProcessing && (
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 animate-spin rounded-full" />
                                <span className="text-sm font-bold text-blue-500">
                                    Processing...
                                </span>
                            </div>
                        )}
                        {recordingError && (
                            <span className="text-sm font-bold text-red-500">
                                Error: {recordingError}
                            </span>
                        )}
                        {!isRecording && !isProcessing && !recordingError && (
                            <span className="text-muted-foreground text-sm">
                                Ready
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Summarize and Extract Tasks Buttons */}
            <AnimatePresence>
                {hasContent && (
                    <motion.div
                        className="flex items-center gap-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 40, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="h-12"
                        >
                            <Button
                                onClick={
                                    hasSummary ? onToggleSummary : onSummarize
                                }
                                disabled={isSummarizing || isRecording}
                                variant={
                                    isSummaryOpen ? "default" : "secondary"
                                }
                                className="h-12 rounded-full border-[0.5px]"
                            >
                                <div className="flex items-center gap-2">
                                    <span>
                                        {isSummarizing
                                            ? "Summarizing..."
                                            : "Summarize"}
                                    </span>
                                    {hasSummary && (
                                        <motion.div
                                            animate={{
                                                rotate: isSummaryOpen ? 180 : 0,
                                            }}
                                            transition={{
                                                duration: 0.2,
                                            }}
                                        >
                                            <ChevronUp size={16} />
                                        </motion.div>
                                    )}
                                </div>
                            </Button>
                        </motion.div>
                        <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 40, opacity: 0 }}
                            transition={{
                                duration: 0.2,
                                ease: "easeOut",
                                delay: 0.1,
                            }}
                            className="h-12"
                        >
                            <Button
                                onClick={
                                    hasTasks ? onToggleTasks : onExtractTasks
                                }
                                disabled={isExtractingTasks || isRecording}
                                variant={isTasksOpen ? "default" : "secondary"}
                                className="h-12 rounded-full border-[0.5px]"
                            >
                                <div className="flex items-center gap-2">
                                    <span>
                                        {isExtractingTasks
                                            ? "Extracting..."
                                            : "Extract Tasks"}
                                    </span>
                                    {hasTasks && (
                                        <motion.div
                                            animate={{
                                                rotate: isTasksOpen ? 180 : 0,
                                            }}
                                            transition={{
                                                duration: 0.2,
                                            }}
                                        >
                                            <ChevronUp size={16} />
                                        </motion.div>
                                    )}
                                </div>
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
