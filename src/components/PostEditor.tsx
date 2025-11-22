"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ArrowLeft, AudioWaveform, Smile } from "lucide-react";
import { ProgressiveBlur } from "./ui/progressive-blur";

interface Post {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export default function PostEditor({ postId }: { postId: number }) {
    const router = useRouter();
    const [post, setPost] = useState<Post | null>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/posts/${postId}`);
                const data = await response.json();
                if (data.success) {
                    setPost(data.data);
                    setTitle(data.data.title);
                    setContent(data.data.content);
                } else {
                    setError("Failed to load post");
                }
            } catch (err) {
                setError("Error loading post");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [postId]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        setHasChanges(true);
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        setHasChanges(true);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await fetch(`/api/posts/${postId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content }),
            });
            const data = await response.json();
            if (data.success) {
                setPost(data.data);
                setHasChanges(false);
            } else {
                setError("Failed to save post");
            }
        } catch (err) {
            setError("Error saving post");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this file?")) return;

        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: "DELETE",
            });
            const data = await response.json();
            if (data.success) {
                router.push("/");
            } else {
                setError("Failed to delete post");
            }
        } catch (err) {
            setError("Error deleting post");
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-slate-400">Loading...</p>
            </div>
        );
    }

    if (error && !post) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 to-slate-800">
                <div className="text-center">
                    <p className="mb-4 text-red-400">{error}</p>
                    <Button onClick={() => router.push("/")} variant="outline">
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="relative mx-auto flex h-full max-w-4xl flex-col items-center justify-center">
                {/* Fixed Header */}
                <div className="from-background to-background/0 fixed top-0 z-20 flex w-full max-w-4xl items-center justify-between bg-linear-to-b px-4 pt-8">
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
                            onChange={handleTitleChange}
                            placeholder="File title..."
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
                            {post
                                ? new Date(post.updatedAt).toLocaleString()
                                : "N/A"}
                        </p>
                    </div>

                    <div className="flex flex-1 justify-end gap-3">
                        {error && (
                            <div className="text-sm text-red-400">{error}</div>
                        )}
                        <Button
                            onClick={handleDelete}
                            variant="destructive"
                            className="flex items-center gap-2"
                        >
                            Delete
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!hasChanges || saving}
                            className="flex items-center gap-2"
                        >
                            {saving ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </div>

                {/* Fixed Bottom Bar */}
                <div className="fixed bottom-0 z-20 flex w-full max-w-4xl items-center justify-center gap-2 px-4 py-8">
                    <Button
                        onClick={() => router.push("/")}
                        className="h-[60px] w-[60px] bg-linear-to-br from-lime-500 to-blue-500"
                    >
                        <Smile
                            // size={60}
                            className="h-[24px]! w-[24px]! text-white"
                        />
                    </Button>
                    <Button
                        onClick={() => router.push("/")}
                        className="h-[60px] w-[60px]"
                    >
                        <AudioWaveform className="h-[24px]! w-[24px]!" />
                    </Button>
                </div>

                {/* Content Editor */}
                <div className="flex h-screen w-full flex-col items-center justify-center">
                    <div className="relative h-full w-full overflow-hidden py-[120px]">
                        <ProgressiveBlur
                            position="top"
                            // z-index="5"
                            height="200px"
                            className="fixed"
                        />
                        <textarea
                            value={content}
                            onChange={handleContentChange}
                            placeholder="Start typing your content..."
                            className="h-full w-full resize-none border-red-500 bg-transparent px-6 py-20 font-mono focus:outline-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
