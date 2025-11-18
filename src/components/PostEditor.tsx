"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ArrowLeft, Trash2, Save } from "lucide-react";

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
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                <p className="text-slate-400">Loading...</p>
            </div>
        );
    }

    if (error && !post) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <Button onClick={() => router.push("/")} variant="outline">
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between mb-8">
                    <Button
                        onClick={() => router.push("/")}
                        variant="ghost"
                        className="text-slate-400 hover:text-white flex items-center gap-2"
                    >
                        <ArrowLeft size={20} />
                        Back to Files
                    </Button>

                    <div className="flex gap-3">
                        {error && (
                            <div className="text-red-400 text-sm">{error}</div>
                        )}
                        <Button
                            onClick={handleDelete}
                            variant="destructive"
                            className="flex items-center gap-2"
                        >
                            <Trash2 size={18} />
                            Delete
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!hasChanges || saving}
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                        >
                            <Save size={18} />
                            {saving ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </div>

                {/* Title Input */}
                <div className="mb-6">
                    <input
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="File title..."
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-2xl font-bold"
                    />
                </div>

                {/* Content Editor */}
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg overflow-hidden">
                    <textarea
                        value={content}
                        onChange={handleContentChange}
                        placeholder="Start typing your content..."
                        className="w-full bg-slate-700/50 text-white placeholder-slate-500 p-6 focus:outline-none resize-none"
                        style={{ minHeight: "500px" }}
                    />
                </div>

                {/* Save Status */}
                {hasChanges && (
                    <div className="mt-4 text-amber-400 text-sm">
                        You have unsaved changes
                    </div>
                )}

                {/* Metadata */}
                <div className="mt-8 text-slate-500 text-sm space-y-1">
                    <p>
                        Created:{" "}
                        {post
                            ? new Date(post.createdAt).toLocaleString()
                            : "N/A"}
                    </p>
                    <p>
                        Last updated:{" "}
                        {post
                            ? new Date(post.updatedAt).toLocaleString()
                            : "N/A"}
                    </p>
                </div>
            </div>
        </div>
    );
}
