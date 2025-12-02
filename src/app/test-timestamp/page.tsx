"use client";

import { useState, ChangeEvent, KeyboardEvent } from "react";
import { useQuickTimestamp } from "@/hooks/useQuickTimestamp";
import {
    formatToday,
    formatNow,
    processQuickTimestamp,
} from "@/lib/quickTimestamp";

export default function TestTimestampPage() {
    // State for different input types
    const [searchValue, setSearchValue] = useState("");
    const [titleValue, setTitleValue] = useState("");
    const [textareaValue, setTextareaValue] = useState("");
    const [immediateValue, setImmediateValue] = useState("");
    const [enterValue, setEnterValue] = useState("");

    // Hooks with different trigger modes
    const spaceHook = useQuickTimestamp({ triggerOn: "space" });
    const immediateHook = useQuickTimestamp({ triggerOn: "immediate" });
    const enterHook = useQuickTimestamp({ triggerOn: "enter" });

    // Handler for space-triggered inputs
    const handleSpaceInput = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        setValue: (value: string) => void,
    ) => {
        setValue(e.target.value);
    };

    const handleSpaceKeyDown = (
        e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
        value: string,
        setValue: (value: string) => void,
    ) => {
        spaceHook.handleKeyDown(e, value, setValue);
    };

    // Handler for immediate-triggered inputs
    const handleImmediateInput = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        setValue: (value: string) => void,
    ) => {
        immediateHook.handleChange(e, setValue);
    };

    // Handler for enter-triggered inputs
    const handleEnterKeyDown = (
        e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
        value: string,
        setValue: (value: string) => void,
    ) => {
        enterHook.handleKeyDown(e, value, setValue);
    };

    return (
        <div className="bg-background min-h-screen p-8">
            <div className="mx-auto max-w-3xl">
                <h1 className="mb-2 text-3xl font-bold">
                    Quick Timestamp Test Grounds
                </h1>
                <p className="text-muted-foreground mb-8">
                    Type{" "}
                    <code className="bg-muted rounded px-2 py-1">@today</code>{" "}
                    or <code className="bg-muted rounded px-2 py-1">@now</code>{" "}
                    to insert timestamps
                </p>

                {/* Current timestamp preview */}
                <div className="bg-card mb-8 rounded-lg border p-6">
                    <h2 className="mb-4 text-xl font-semibold">
                        Current Timestamps
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="bg-muted rounded-lg p-4">
                            <p className="text-muted-foreground mb-1 text-sm">
                                @today
                            </p>
                            <p className="text-lg font-medium">
                                {formatToday()}
                            </p>
                        </div>
                        <div className="bg-muted rounded-lg p-4">
                            <p className="text-muted-foreground mb-1 text-sm">
                                @now
                            </p>
                            <p className="text-lg font-medium">{formatNow()}</p>
                        </div>
                    </div>
                </div>

                {/* Space trigger mode */}
                <div className="bg-card mb-6 rounded-lg border p-6">
                    <h2 className="mb-2 text-xl font-semibold">
                        Space Trigger Mode
                    </h2>
                    <p className="text-muted-foreground mb-4 text-sm">
                        Type @today or @now and press{" "}
                        <kbd className="bg-muted rounded px-2 py-0.5">
                            Space
                        </kbd>{" "}
                        to convert
                    </p>

                    <div className="space-y-4">
                        {/* Search bar style input */}
                        <div>
                            <label className="text-muted-foreground mb-1 block text-sm">
                                Search Bar
                            </label>
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) =>
                                    handleSpaceInput(e, setSearchValue)
                                }
                                onKeyDown={(e) =>
                                    handleSpaceKeyDown(
                                        e,
                                        searchValue,
                                        setSearchValue,
                                    )
                                }
                                placeholder="Search... try @today or @now"
                                className="bg-background w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        {/* Title style input */}
                        <div>
                            <label className="text-muted-foreground mb-1 block text-sm">
                                Title Input
                            </label>
                            <input
                                type="text"
                                value={titleValue}
                                onChange={(e) =>
                                    handleSpaceInput(e, setTitleValue)
                                }
                                onKeyDown={(e) =>
                                    handleSpaceKeyDown(
                                        e,
                                        titleValue,
                                        setTitleValue,
                                    )
                                }
                                placeholder="Enter title... try @today or @now"
                                className="bg-background w-full rounded-lg border px-4 py-3 text-xl font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        {/* Textarea */}
                        <div>
                            <label className="text-muted-foreground mb-1 block text-sm">
                                Text Area
                            </label>
                            <textarea
                                value={textareaValue}
                                onChange={(e) =>
                                    handleSpaceInput(e, setTextareaValue)
                                }
                                onKeyDown={(e) =>
                                    handleSpaceKeyDown(
                                        e,
                                        textareaValue,
                                        setTextareaValue,
                                    )
                                }
                                placeholder="Write something... try @today or @now"
                                rows={4}
                                className="bg-background w-full resize-none rounded-lg border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Immediate trigger mode */}
                <div className="bg-card mb-6 rounded-lg border p-6">
                    <h2 className="mb-2 text-xl font-semibold">
                        Immediate Trigger Mode
                    </h2>
                    <p className="text-muted-foreground mb-4 text-sm">
                        Converts automatically as soon as @today or @now is
                        typed
                    </p>
                    <input
                        type="text"
                        value={immediateValue}
                        onChange={(e) =>
                            handleImmediateInput(e, setImmediateValue)
                        }
                        placeholder="Type @today or @now..."
                        className="bg-background w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                </div>

                {/* Enter trigger mode */}
                <div className="bg-card mb-6 rounded-lg border p-6">
                    <h2 className="mb-2 text-xl font-semibold">
                        Enter Trigger Mode
                    </h2>
                    <p className="text-muted-foreground mb-4 text-sm">
                        Type @today or @now and press{" "}
                        <kbd className="bg-muted rounded px-2 py-0.5">
                            Enter
                        </kbd>{" "}
                        to convert
                    </p>
                    <input
                        type="text"
                        value={enterValue}
                        onChange={(e) => setEnterValue(e.target.value)}
                        onKeyDown={(e) =>
                            handleEnterKeyDown(e, enterValue, setEnterValue)
                        }
                        placeholder="Type @today or @now, then press Enter..."
                        className="bg-background w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                </div>

                {/* Direct function usage */}
                <div className="bg-card rounded-lg border p-6">
                    <h2 className="mb-4 text-xl font-semibold">
                        Direct Function Usage
                    </h2>
                    <p className="text-muted-foreground mb-4 text-sm">
                        You can also use{" "}
                        <code className="bg-muted rounded px-2 py-0.5">
                            processQuickTimestamp()
                        </code>{" "}
                        directly
                    </p>
                    <div className="bg-muted space-y-2 rounded-lg p-4 font-mono text-sm">
                        <p>
                            <span className="text-muted-foreground">
                                Input:
                            </span>{" "}
                            &quot;Meeting @today at 3pm&quot;
                        </p>
                        <p>
                            <span className="text-muted-foreground">
                                Output:
                            </span>{" "}
                            &quot;
                            {processQuickTimestamp("Meeting @today at 3pm")}
                            &quot;
                        </p>
                        <hr className="border-border my-2" />
                        <p>
                            <span className="text-muted-foreground">
                                Input:
                            </span>{" "}
                            &quot;Created @now&quot;
                        </p>
                        <p>
                            <span className="text-muted-foreground">
                                Output:
                            </span>{" "}
                            &quot;{processQuickTimestamp("Created @now")}&quot;
                        </p>
                    </div>
                </div>

                {/* Usage instructions */}
                <div className="bg-muted mt-8 rounded-lg border p-6">
                    <h3 className="mb-4 font-semibold">
                        How to Use in Your Components
                    </h3>
                    <pre className="bg-background overflow-x-auto rounded-lg p-4 text-sm">
                        {`import { useQuickTimestamp } from '@/hooks/useQuickTimestamp';

// In your component:
const { handleChange, handleKeyDown } = useQuickTimestamp({ 
  triggerOn: 'space' // or 'immediate' or 'enter'
});

// For inputs:
<input
  value={value}
  onChange={(e) => handleChange(e, setValue)}
  onKeyDown={(e) => handleKeyDown(e, value, setValue)}
/>`}
                    </pre>
                </div>
            </div>
        </div>
    );
}
