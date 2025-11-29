"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Switch } from "./ui/switch";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const isDark = theme === "dark";

    return (
        <div className="flex items-center justify-between py-4">
            <label htmlFor="theme-toggle" className="text-sm font-medium">
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
    );
}
