"use client";

import { useCallback, useRef, ChangeEvent, KeyboardEvent } from "react";
import { processQuickTimestamp, hasQuickTimestamp } from "@/lib/quickTimestamp";

interface UseQuickTimestampOptions {
    /**
     * Trigger mode:
     * - 'space': Replace on space after @today/@now
     * - 'enter': Replace on Enter key
     * - 'immediate': Replace as soon as pattern is complete
     */
    triggerOn?: "space" | "enter" | "immediate";
}

interface UseQuickTimestampReturn {
    /**
     * Process the value and return the transformed text with timestamps
     */
    processValue: (value: string) => string;

    /**
     * Handle change event for input/textarea - processes and calls onChange
     */
    handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        onChange?: (value: string) => void,
    ) => void;

    /**
     * Handle keydown event for space/enter triggers
     */
    handleKeyDown: (
        e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
        currentValue: string,
        onChange?: (value: string) => void,
    ) => void;

    /**
     * Check if value contains quick timestamp triggers
     */
    hasTimestamp: (value: string) => boolean;
}

/**
 * Hook for integrating quick timestamp functionality into any input
 */
export function useQuickTimestamp(
    options: UseQuickTimestampOptions = {},
): UseQuickTimestampReturn {
    const { triggerOn = "space" } = options;
    const lastValueRef = useRef<string>("");

    const processValue = useCallback((value: string): string => {
        return processQuickTimestamp(value);
    }, []);

    const hasTimestamp = useCallback((value: string): boolean => {
        return hasQuickTimestamp(value);
    }, []);

    const handleChange = useCallback(
        (
            e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            onChange?: (value: string) => void,
        ) => {
            let newValue = e.target.value;

            // For immediate mode, process on every change
            if (triggerOn === "immediate" && hasQuickTimestamp(newValue)) {
                newValue = processQuickTimestamp(newValue);
            }

            lastValueRef.current = newValue;
            onChange?.(newValue);
        },
        [triggerOn],
    );

    const handleKeyDown = useCallback(
        (
            e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
            currentValue: string,
            onChange?: (value: string) => void,
        ) => {
            const shouldProcess =
                (triggerOn === "space" && e.key === " ") ||
                (triggerOn === "enter" && e.key === "Enter");

            if (shouldProcess && hasQuickTimestamp(currentValue)) {
                const processed = processQuickTimestamp(currentValue);
                if (processed !== currentValue) {
                    // For space trigger, we need to handle cursor position
                    if (triggerOn === "space") {
                        e.preventDefault();
                        const newValue = processed + " ";
                        onChange?.(newValue);

                        // Set cursor position after the space
                        const target = e.target as
                            | HTMLInputElement
                            | HTMLTextAreaElement;
                        setTimeout(() => {
                            target.value = newValue;
                            target.setSelectionRange(
                                newValue.length,
                                newValue.length,
                            );
                        }, 0);
                    } else {
                        onChange?.(processed);
                    }
                }
            }
        },
        [triggerOn],
    );

    return {
        processValue,
        handleChange,
        handleKeyDown,
        hasTimestamp,
    };
}

export default useQuickTimestamp;
