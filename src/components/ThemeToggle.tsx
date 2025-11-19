"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Switch } from "./ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Settings } from "lucide-react";
import { Button } from "./ui/button";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const isDark = theme === "dark";

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <Settings size={18} />
                    Settings
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Customize your preferences
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-between py-4">
                    <label
                        htmlFor="theme-toggle"
                        className="text-sm font-medium"
                    >
                        Dark Mode
                    </label>
                    <Switch
                        id="theme-toggle"
                        checked={isDark}
                        onCheckedChange={(checked) => {
                            setTheme(checked ? "dark" : "light");
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
