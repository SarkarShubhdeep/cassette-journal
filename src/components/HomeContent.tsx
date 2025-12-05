"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LogoutButton from "./LogoutButton";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { Plus, Settings2, Calendar, Loader2, Check, X } from "lucide-react";
import { TapesDataTable } from "./tapes-table/data-table";
import { createColumns, Tape } from "./tapes-table/columns";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

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
    const [showSummary, setShowSummary] = useState(false);
    const [isGeneratingSummaries, setIsGeneratingSummaries] = useState(false);
    const [editingTapeId, setEditingTapeId] = useState<number | null>(null);

    // Google Calendar state
    const [isGoogleConnected, setIsGoogleConnected] = useState<boolean | null>(
        null,
    );
    const [googleEmail, setGoogleEmail] = useState<string | null>(null);
    const [isCheckingGoogle, setIsCheckingGoogle] = useState(false);
    const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);

    // Load showSummary preference from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("showSummaryInPreview");
        if (saved !== null) {
            setShowSummary(JSON.parse(saved));
        }
    }, []);

    // Save showSummary preference to localStorage
    const handleShowSummaryChange = (checked: boolean) => {
        setShowSummary(checked);
        localStorage.setItem("showSummaryInPreview", JSON.stringify(checked));
    };

    const handleDelete = useCallback(async (tapeId: number) => {
        if (!confirm("Are you sure you want to delete this tape?")) return;

        try {
            const response = await fetch(`/api/tapes/${tapeId}`, {
                method: "DELETE",
            });
            const data = await response.json();
            if (data.success) {
                setTapes((prev) => prev.filter((t) => t.id !== tapeId));
            } else {
                setError("Failed to delete tape");
            }
        } catch (err) {
            setError("Error deleting tape");
            console.error(err);
        }
    }, []);

    const handleTitleUpdate = useCallback(
        async (tapeId: number, newTitle: string) => {
            try {
                const response = await fetch(`/api/tapes/${tapeId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title: newTitle }),
                });
                const data = await response.json();
                if (data.success) {
                    setTapes((prev) =>
                        prev.map((t) =>
                            t.id === tapeId ? { ...t, title: newTitle } : t,
                        ),
                    );
                } else {
                    setError("Failed to update title");
                }
            } catch (err) {
                setError("Error updating title");
                console.error(err);
            }
        },
        [],
    );

    const columns = useMemo(
        () =>
            createColumns(
                handleDelete,
                showSummary,
                editingTapeId,
                setEditingTapeId,
                handleTitleUpdate,
            ),
        [handleDelete, showSummary, editingTapeId, handleTitleUpdate],
    );

    const handleBatchDelete = useCallback(async (ids: number[]) => {
        try {
            const results = await Promise.all(
                ids.map((id) =>
                    fetch(`/api/tapes/${id}`, { method: "DELETE" }).then((r) =>
                        r.json(),
                    ),
                ),
            );

            const successCount = results.filter((r) => r.success).length;
            if (successCount > 0) {
                setTapes((prev) => prev.filter((t) => !ids.includes(t.id)));
            }

            if (successCount < ids.length) {
                setError(
                    `Failed to delete ${ids.length - successCount} tape(s)`,
                );
            }
        } catch (err) {
            setError("Error deleting tapes");
            console.error(err);
        }
    }, []);

    // Check Google Calendar connection status
    useEffect(() => {
        const checkGoogleStatus = async () => {
            setIsCheckingGoogle(true);
            try {
                const response = await fetch("/api/calendar/status");
                const data = await response.json();
                if (data.success) {
                    setIsGoogleConnected(data.connected);
                    setGoogleEmail(data.googleEmail);
                }
            } catch (error) {
                console.error("Failed to check Google status:", error);
            } finally {
                setIsCheckingGoogle(false);
            }
        };
        checkGoogleStatus();
    }, []);

    // Handle Google Calendar connection
    const handleConnectGoogle = async () => {
        setIsConnectingGoogle(true);
        try {
            const response = await fetch("/api/auth/google");
            const data = await response.json();
            if (data.success && data.authUrl) {
                window.location.href = data.authUrl;
            }
        } catch (error) {
            console.error("Failed to initiate Google auth:", error);
            setError("Failed to connect Google Calendar");
        } finally {
            setIsConnectingGoogle(false);
        }
    };

    // Handle Google Calendar disconnection
    const handleDisconnectGoogle = async () => {
        if (!confirm("Are you sure you want to disconnect Google Calendar?"))
            return;

        setIsConnectingGoogle(true);
        try {
            const response = await fetch("/api/calendar/disconnect", {
                method: "POST",
            });
            const data = await response.json();

            if (data.success) {
                setIsGoogleConnected(false);
                setGoogleEmail(null);
                setError(null);
            } else {
                setError(data.error || "Failed to disconnect Google Calendar");
            }
        } catch (error) {
            console.error("Failed to disconnect:", error);
            setError("Failed to disconnect Google Calendar");
        } finally {
            setIsConnectingGoogle(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
        fetchTapes();
    }, []);

    // Generate summaries for tapes that don't have them
    const generateMissingSummaries = useCallback(async () => {
        setIsGeneratingSummaries(true);
        try {
            const response = await fetch("/api/tapes/generate-summaries", {
                method: "POST",
            });
            const data = await response.json();
            if (data.success && data.generated > 0) {
                // Refresh tapes to get the new summaries
                await fetchTapes();
            }
        } catch (err) {
            console.error("Error generating summaries:", err);
        } finally {
            setIsGeneratingSummaries(false);
        }
    }, []);

    // Auto-generate short summaries when switching to summary view
    useEffect(() => {
        if (showSummary && tapes.some((t) => t.content && !t.shortSummary)) {
            generateMissingSummaries();
        }
    }, [showSummary, tapes, generateMissingSummaries]);

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
                // Automatically enter edit mode for the new tape
                setEditingTapeId(data.data.id);
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
            <div className="fixed top-0 right-0 left-0 z-50 mx-auto flex max-w-6xl flex-col items-center justify-between bg-slate-100/20 px-8 py-8 backdrop-blur-sm md:flex-row dark:bg-slate-900/20">
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
                    {/* Create New Button */}
                    <Button
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                    >
                        <Plus size={20} />
                        New Tape
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="secondary">
                                <Settings2 size={20} />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md space-y-0">
                            <DialogHeader>
                                <DialogTitle>Settings</DialogTitle>
                            </DialogHeader>

                            {/* Theme Toggle */}
                            <div className="border-b py-3">
                                <ThemeToggle />
                            </div>

                            {/* Summary Preview Toggle */}
                            <div className="border-b py-3">
                                <div className="flex items-center justify-between gap-2">
                                    <Label htmlFor="summary-toggle">
                                        View summary instead of tape preview
                                    </Label>
                                    <Switch
                                        id="summary-toggle"
                                        checked={showSummary}
                                        onCheckedChange={
                                            handleShowSummaryChange
                                        }
                                        disabled={isGeneratingSummaries}
                                    />
                                </div>
                                {isGeneratingSummaries && (
                                    <p className="text-muted-foreground mt-2 text-sm">
                                        Generating summaries...
                                    </p>
                                )}
                            </div>

                            {/* Google Calendar Connection */}
                            <div className="space-y-3 py-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Label className="font-semibold">
                                            Google Calendar
                                        </Label>
                                    </div>
                                    {isCheckingGoogle ? (
                                        <Loader2
                                            size={18}
                                            className="animate-spin text-slate-400"
                                        />
                                    ) : isGoogleConnected ? (
                                        <div className="flex items-center gap-1 text-green-500">
                                            <Check size={18} />
                                            <span className="text-sm">
                                                Connected
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-slate-400">
                                            <X size={18} />
                                            <span className="text-sm">
                                                Not connected
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-muted-foreground text-sm">
                                    {isGoogleConnected
                                        ? `Connected to: ${googleEmail}`
                                        : "Connect your Google Calendar to sync tasks as calendar events."}
                                </p>
                                <div className="flex gap-2">
                                    {isGoogleConnected ? (
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={handleDisconnectGoogle}
                                            disabled={isConnectingGoogle}
                                            className="rounded-none"
                                        >
                                            Disconnect
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={handleConnectGoogle}
                                            disabled={isConnectingGoogle}
                                            className="rounded-none bg-blue-600 hover:bg-blue-700"
                                        >
                                            {isConnectingGoogle ? (
                                                <>
                                                    <Loader2
                                                        size={16}
                                                        className="mr-2 animate-spin"
                                                    />
                                                    Connecting...
                                                </>
                                            ) : (
                                                <>
                                                    <Calendar
                                                        size={16}
                                                        className="mr-2"
                                                    />
                                                    Connect
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

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

                {/* Tapes Table */}
                {!loading && (
                    <TapesDataTable
                        columns={columns}
                        data={tapes}
                        onBatchDelete={handleBatchDelete}
                        editingTapeId={editingTapeId}
                        setEditingTapeId={setEditingTapeId}
                        onTitleUpdate={handleTitleUpdate}
                    />
                )}
            </div>
        </div>
    );
}
