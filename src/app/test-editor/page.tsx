"use client";

import { useState } from "react";
import { ContentEditor } from "@/components/ContentEditor";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TestEditorPage() {
    const router = useRouter();
    const [savedContent, setSavedContent] = useState("");
    const [currentContent, setCurrentContent] = useState("");

    const handleSave = () => {
        setSavedContent(currentContent);
        alert("Content saved!");
    };

    const handleClear = () => {
        setCurrentContent("");
        setSavedContent("");
    };

    return (
        <div className="bg-background flex min-h-screen w-full flex-col">
            {/* Header */}
            <div className="border-border bg-background/80 fixed top-0 z-30 flex w-full items-center justify-between border-b px-6 py-4 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/")}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-semibold">
                            Content Editor Test
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Test keyboard and voice input
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleClear}>
                        Clear
                    </Button>
                    <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col pt-[80px]">
                <div className="mx-auto flex h-full w-full max-w-4xl flex-col">
                    <ContentEditor
                        initialContent={currentContent}
                        placeholder="Type something or click the mic button to start voice input..."
                        onContentChange={setCurrentContent}
                        className="flex-1"
                    />
                </div>
            </div>

            {/* Debug Panel */}
            {savedContent && (
                <div className="border-border bg-background fixed right-4 bottom-4 max-w-md rounded-lg border p-4 shadow-lg">
                    <h3 className="mb-2 text-sm font-semibold">
                        Last Saved Content:
                    </h3>
                    <div className="bg-muted max-h-32 overflow-auto rounded p-2 text-xs">
                        {savedContent}
                    </div>
                </div>
            )}
        </div>
    );
}
