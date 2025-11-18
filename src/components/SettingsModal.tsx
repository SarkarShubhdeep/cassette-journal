"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentName: string;
    onSave: (name: string) => Promise<void>;
}

export default function SettingsModal({
    isOpen,
    onClose,
    currentName,
    onSave,
}: SettingsModalProps) {
    const [name, setName] = useState(currentName);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        if (!name.trim()) {
            setError("Name cannot be empty");
            return;
        }

        try {
            setSaving(true);
            setError(null);
            await onSave(name);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Settings</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Name / Username
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name or username"
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            This will be displayed in your profile
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {saving ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
