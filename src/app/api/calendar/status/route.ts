import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { db } from "@/db";
import { usersTable } from "@/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/calendar/status
 * Check if user has connected Google Calendar
 */
export async function GET() {
    try {
        const session = await auth0.getSession();
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 },
            );
        }

        const users = await db
            .select({
                googleRefreshToken: usersTable.googleRefreshToken,
                googleEmail: usersTable.googleEmail,
            })
            .from(usersTable)
            .where(eq(usersTable.email, session.user.email!));

        if (users.length === 0) {
            return NextResponse.json({
                success: true,
                connected: false,
                googleEmail: null,
            });
        }

        return NextResponse.json({
            success: true,
            connected: !!users[0].googleRefreshToken,
            googleEmail: users[0].googleEmail || null,
        });
    } catch (error) {
        console.error("Calendar status error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to check status" },
            { status: 500 },
        );
    }
}
