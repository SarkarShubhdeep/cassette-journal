"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { Trash2, Plus, ArrowUpRight } from "lucide-react";

interface Tape {
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
    const [tapes, setTapes] = useState<Tape[]>([]);
    const [dbUser, setDbUser] = useState<DbUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUserProfile();
        fetchTapes();
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

    const fetchTapes = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/tapes");
            const data = await response.json();
            if (data.success) {
                setTapes(data.data);
            } else {
                setError("Failed to fetch tapes");
            }
        } catch (err) {
            setError("Error fetching tapes");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (tapeId: number) => {
        if (!confirm("Are you sure you want to delete this tape?")) return;

        try {
            const response = await fetch(`/api/tapes/${tapeId}`, {
                method: "DELETE",
            });
            const data = await response.json();
            if (data.success) {
                setTapes(tapes.filter((t) => t.id !== tapeId));
            } else {
                setError("Failed to delete tape");
            }
        } catch (err) {
            setError("Error deleting tape");
            console.error(err);
        }
    };

    const handleCreateNew = async () => {
        try {
            const response = await fetch("/api/tapes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: "Untitled",
                    content: "",
                }),
            });
            const data = await response.json();
            if (data.success) {
                setTapes([...tapes, data.data]);
            } else {
                setError(data.error || "Failed to create tape");
            }
        } catch (err) {
            setError("Error creating tape");
            console.error("Error creating tape:", err);
        }
    };

    return (
        <div className="min-h-screen p-8">
            {/* fixed header */}
            <div className="fixed top-0 right-0 left-0 z-50 mx-auto flex max-w-6xl flex-col items-center justify-between bg-slate-100/20 px-8 py-8 backdrop-blur-sm md:flex-row">
                <div>
                    <h1 className="mb-2 text-4xl font-bold">
                        Cassette Journal
                    </h1>
                    <p className="text-slate-400">
                        Welcome, {dbUser?.name || user.name || user.email}
                    </p>
                    {!dbUser?.name && (
                        <p className="mt-1 text-xs text-amber-400">
                            👤 No name set yet
                        </p>
                    )}
                </div>
                <div className="flex gap-3">
                    <Button className="rounded-full">
                        <ArrowUpRight size={20} />
                        <Link href="/whisper-test" target="_blank">
                            Test Ground
                        </Link>
                    </Button>

                    {/* Create New Button */}
                    <Button
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                    >
                        <Plus size={20} />
                        New Tape
                    </Button>
                    <ThemeToggle />
                    <LogoutButton />
                </div>
            </div>
            {/* </div> */}
            <div className="mx-auto mt-30 max-w-6xl">
                {/* Error Message */}
                {error && (
                    <div className="mb-6 rounded-lg border border-red-500 bg-red-500/20 p-4 text-red-200">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="py-12 text-center">
                        <p className="text-slate-400">Loading your tapes...</p>
                    </div>
                )}

                {/* Tapes List */}
                {!loading && tapes.length === 0 && (
                    <div className="py-12 text-center">
                        <p className="mb-4">
                            No tapes yet. Create your first one!
                        </p>
                    </div>
                )}

                {!loading && tapes.length > 0 && (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {tapes.map((tape) => (
                            <Link key={tape.id} href={`/tapes/${tape.id}`}>
                                <div className="ark:hover:bg-slate-700 dark:bg-card flex h-full cursor-pointer flex-col bg-gray-100 p-6 transition-all duration-200 hover:bg-slate-300 dark:hover:bg-slate-800">
                                    <h3 className="mb-2 line-clamp-2 text-lg font-semibold transition-colors">
                                        {tape.title}
                                    </h3>
                                    <p className="text-muted-foreground mb-4 line-clamp-2 grow text-sm">
                                        {tape.content || "No content yet..."}
                                    </p>
                                    <div className="flex items-center justify-between border-t border-slate-600 pt-4">
                                        <span className="text-xs">
                                            {new Date(
                                                tape.updatedAt,
                                            ).toLocaleDateString()}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleDelete(tape.id);
                                            }}
                                            className="transition-colors hover:text-red-400"
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
        </div>
    );
}
