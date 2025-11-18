"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import SettingsModal from "./SettingsModal";
import { Button } from "./ui/button";
import { Trash2, Plus, Settings } from "lucide-react";

interface Post {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

interface User {
    sub?: string;
    email?: string;
    name?: string;
}

interface DbUser {
    id: number;
    name: string;
    email: string;
    createdAt: string;
}

export default function HomeContent({ user }: { user: User }) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [dbUser, setDbUser] = useState<DbUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);

    useEffect(() => {
        fetchUserProfile();
        fetchPosts();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch("/api/users/profile");
            const data = await response.json();
            if (data.success) {
                setDbUser(data.data);
            }
        } catch (err) {
            console.error("Error fetching user profile:", err);
        }
    };

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/posts");
            const data = await response.json();
            if (data.success) {
                setPosts(data.data);
            } else {
                setError("Failed to fetch posts");
            }
        } catch (err) {
            setError("Error fetching posts");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId: number) => {
        if (!confirm("Are you sure you want to delete this file?")) return;

        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: "DELETE",
            });
            const data = await response.json();
            if (data.success) {
                setPosts(posts.filter((p) => p.id !== postId));
            } else {
                setError("Failed to delete post");
            }
        } catch (err) {
            setError("Error deleting post");
            console.error(err);
        }
    };

    const handleCreateNew = async () => {
        try {
            const response = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: "Untitled",
                    content: "",
                }),
            });
            const data = await response.json();
            if (data.success) {
                setPosts([...posts, data.data]);
            } else {
                setError(data.error || "Failed to create post");
            }
        } catch (err) {
            setError("Error creating post");
            console.error("Error creating post:", err);
        }
    };

    const handleSaveName = async (newName: string) => {
        try {
            const response = await fetch("/api/users/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName }),
            });
            const data = await response.json();
            if (data.success) {
                setDbUser(data.data);
            } else {
                throw new Error(data.error || "Failed to update profile");
            }
        } catch (err) {
            throw err;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            Cassette Journal
                        </h1>
                        <p className="text-slate-400">
                            Welcome, {dbUser?.name || user.name || user.email}
                        </p>
                        {!dbUser?.name && (
                            <p className="text-xs text-amber-400 mt-1">
                                👤 No name set yet
                            </p>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={() => setSettingsOpen(true)}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Settings size={18} />
                            Settings
                        </Button>
                        <LogoutButton />
                    </div>
                </div>

                {/* Create New Button */}
                <div className="mb-8">
                    <Button
                        onClick={handleCreateNew}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                        <Plus size={20} />
                        New File
                    </Button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <p className="text-slate-400">Loading your files...</p>
                    </div>
                )}

                {/* Posts List */}
                {!loading && posts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-slate-400 mb-4">
                            No files yet. Create your first one!
                        </p>
                    </div>
                )}

                {!loading && posts.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/posts/${post.id}`}
                                className="group"
                            >
                                <div className="bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-lg p-6 transition-all duration-200 cursor-pointer h-full flex flex-col">
                                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-4 flex-grow line-clamp-3">
                                        {post.content || "No content yet..."}
                                    </p>
                                    <div className="flex justify-between items-center pt-4 border-t border-slate-600">
                                        <span className="text-xs text-slate-500">
                                            {new Date(
                                                post.updatedAt
                                            ).toLocaleDateString()}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleDelete(post.id);
                                            }}
                                            className="text-slate-400 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <SettingsModal
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                currentName={dbUser?.name || ""}
                onSave={handleSaveName}
            />
        </div>
    );
}
