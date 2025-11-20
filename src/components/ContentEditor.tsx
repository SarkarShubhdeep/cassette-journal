"use client";

import { useEffect, useRef, useState } from "react";
import { TranscriptionButton } from "./TranscriptionButton";

interface ContentEditorProps {
    initialContent?: string;
    placeholder?: string;
    onContentChange?: (content: string) => void;
    className?: string;
}

export function ContentEditor({
    initialContent = "",
    placeholder = "Start typing or use voice...",
    onContentChange,
    className = "",
}: ContentEditorProps) {
    const [content, setContent] = useState(initialContent);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isInitialMount = useRef(true);
    const cursorPositionRef = useRef<number>(0);
    const recordingStartCursorRef = useRef<number>(0);
    const lastTranscriptionLengthRef = useRef<number>(0);

    // Only sync initialContent on first mount (when post loads)
    useEffect(() => {
        if (isInitialMount.current) {
            setContent(initialContent);
            isInitialMount.current = false;
        }
    }, [initialContent]);

    // Auto-resize textarea as content grows
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [content]);

    // Track cursor position on every change
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        const cursorPos = e.target.selectionStart;

        setContent(newContent);
        onContentChange?.(newContent);
        cursorPositionRef.current = cursorPos;
    };

    // Handle when user clicks/focuses in textarea
    const handleCursorChange = () => {
        if (textareaRef.current) {
            cursorPositionRef.current = textareaRef.current.selectionStart;
        }
    };

    // Handle voice transcription updates - insert at cursor position
    const handleTranscriptionUpdate = (transcribedText: string) => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const insertPosition = recordingStartCursorRef.current;

        // Remove previous transcription if exists
        let workingContent = content;
        if (lastTranscriptionLengthRef.current > 0) {
            const before = content.substring(0, insertPosition);
            const after = content.substring(
                insertPosition + lastTranscriptionLengthRef.current,
            );
            workingContent = before + after;
        }

        // Insert new transcription at cursor position
        const before = workingContent.substring(0, insertPosition);
        const after = workingContent.substring(insertPosition);
        const newContent = before + transcribedText + after;

        setContent(newContent);
        onContentChange?.(newContent);

        // Track transcription length for next update
        lastTranscriptionLengthRef.current = transcribedText.length;

        // Update cursor to end of transcription
        const newCursorPos = insertPosition + transcribedText.length;
        cursorPositionRef.current = newCursorPos;

        // Set cursor and scroll to it
        setTimeout(() => {
            textarea.selectionStart = newCursorPos;
            textarea.selectionEnd = newCursorPos;
            textarea.focus();

            // Calculate scroll position to keep cursor visible
            const textBeforeCursor = newContent.substring(0, newCursorPos);
            const lines = textBeforeCursor.split("\n");
            const lineHeight = 24;
            const cursorY = lines.length * lineHeight;

            // Keep cursor in middle of viewport
            const scrollTarget = cursorY - textarea.clientHeight / 2;
            textarea.scrollTop = Math.max(0, scrollTarget);
        }, 10);
    };

    // Track when recording starts
    const handleRecordingStart = () => {
        if (textareaRef.current) {
            recordingStartCursorRef.current =
                textareaRef.current.selectionStart;
            lastTranscriptionLengthRef.current = 0;
        }
    };

    return (
        <div className={`relative flex h-full w-full flex-col ${className}`}>
            {/* Text Editor Area */}
            <div className="relative flex-1 overflow-y-scroll px-6 py-20">
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleTextChange}
                    onClick={handleCursorChange}
                    onKeyUp={handleCursorChange}
                    placeholder={placeholder}
                    className="text-foreground placeholder:text-muted-foreground h-full w-full resize-none bg-transparent px-6 py-4 text-base leading-relaxed focus:outline-none"
                    style={{
                        minHeight: "200px",
                    }}
                />
            </div>

            {/* Voice Input Controls - Fixed at Bottom */}
            <div className="border-border bg-background/50 flex items-center justify-center border-t py-6 backdrop-blur-sm">
                <TranscriptionButton
                    onTranscriptUpdate={handleTranscriptionUpdate}
                    currentContent={content}
                    onRecordingStart={handleRecordingStart}
                />
            </div>

            {/* Character Count */}
            {content.length > 0 && (
                <div className="text-muted-foreground bg-background absolute top-4 right-4 z-50 rounded-full border px-2 py-1 text-xs">
                    {content.length} characters
                </div>
            )}
        </div>
    );
}
