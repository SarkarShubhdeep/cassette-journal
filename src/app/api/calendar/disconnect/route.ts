import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { db } from "@/db";
import { usersTable } from "@/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/calendar/disconnect
 * Disconnects Google Calendar by clearing stored tokens
 */
export async function POST() {
    try {
        const session = await auth0.getSession();
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 },
            );
        }

        // Clear Google tokens from database
        await db
            .update(usersTable)
            .set({
                googleRefreshToken: null,
                googleAccessToken: null,
                googleTokenExpiry: null,
                googleEmail: null,
            })
            .where(eq(usersTable.email, session.user.email!));

        return NextResponse.json({
            success: true,
            message: "Google Calendar disconnected successfully",
        });
    } catch (error) {
        console.error("Calendar disconnect error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to disconnect Google Calendar" },
            { status: 500 },
        );
    }
}
