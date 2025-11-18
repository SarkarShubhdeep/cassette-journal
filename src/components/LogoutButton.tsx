"use client";

import { Button } from "./ui/button";
import Link from "next/link";

export default function LogoutButton() {
    return (
        <Button asChild>
            <Link href="/auth/logout">Log Out</Link>
        </Button>
    );
}
