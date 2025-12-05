import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { db } from "@/db";
import { usersTable, tasksTable } from "@/schema";
import { eq, inArray } from "drizzle-orm";
import { syncTasksToCalendar, refreshAccessToken } from "@/lib/googleCalendar";

/**
 * POST /api/calendar/sync
 * Syncs tasks with timestamps to Google Calendar
 * If tapeId is provided, syncs all tasks from that tape
 * Otherwise syncs specific tasks by ID
 */
export async function POST(request: NextRequest) {
    try {
        // Get current user session
        const session = await auth0.getSession();
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 },
            );
        }

        // Get request body with either tapeId or taskIds
        const body = await request.json();
        const { tapeId, taskIds } = body as {
            tapeId?: number;
            taskIds?: number[];
        };

        if (!tapeId && (!taskIds || taskIds.length === 0)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Either tapeId or taskIds must be provided",
                },
                { status: 400 },
            );
        }

        // Get user with Google tokens
        const users = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, session.user.email!));

        if (users.length === 0) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 },
            );
        }

        const user = users[0];

        // Check if user has connected Google Calendar
        if (!user.googleRefreshToken) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Google Calendar not connected",
                    needsAuth: true,
                },
                { status: 401 },
            );
        }

        // Refresh access token if needed
        let accessToken = user.googleAccessToken;
        const tokenExpiry = user.googleTokenExpiry;

        if (!accessToken || !tokenExpiry || new Date() >= tokenExpiry) {
            try {
                const newCredentials = await refreshAccessToken(
                    user.googleRefreshToken,
                );
                accessToken = newCredentials.access_token!;

                // Update stored tokens
                await db
                    .update(usersTable)
                    .set({
                        googleAccessToken: newCredentials.access_token,
                        googleTokenExpiry: newCredentials.expiry_date
                            ? new Date(newCredentials.expiry_date)
                            : null,
                    })
                    .where(eq(usersTable.id, user.id));
            } catch (error) {
                console.error("Failed to refresh token:", error);
                return NextResponse.json(
                    {
                        success: false,
                        error: "Failed to refresh Google token. Please reconnect.",
                        needsAuth: true,
                    },
                    { status: 401 },
                );
            }
        }

        // Get tasks to sync
        let tasks: (typeof tasksTable.$inferSelect)[] = [];
        if (tapeId) {
            // Sync all tasks from a specific tape
            tasks = await db
                .select()
                .from(tasksTable)
                .where(eq(tasksTable.postId, tapeId));
        } else if (taskIds && taskIds.length > 0) {
            // Sync specific tasks by ID
            tasks = await db
                .select()
                .from(tasksTable)
                .where(inArray(tasksTable.id, taskIds));
        }

        // Filter tasks with time and not already synced
        const tasksToSync = tasks
            .filter((t) => t.time && !t.googleEventId)
            .map((t) => ({
                id: t.id,
                text: t.text,
                time: t.time!,
                googleEventId: t.googleEventId,
            }));

        if (tasksToSync.length === 0) {
            return NextResponse.json({
                success: true,
                message:
                    "No tasks to sync (all tasks either have no time or are already synced)",
                synced: 0,
            });
        }

        // Sync to Google Calendar
        const results = await syncTasksToCalendar(
            accessToken!,
            user.googleRefreshToken,
            tasksToSync,
        );

        // Update tasks with Google Event IDs
        for (const result of results) {
            await db
                .update(tasksTable)
                .set({ googleEventId: result.googleEventId })
                .where(eq(tasksTable.id, result.taskId));
        }

        return NextResponse.json({
            success: true,
            message: `Synced ${results.length} tasks to Google Calendar`,
            synced: results.length,
            results,
        });
    } catch (error) {
        console.error("Calendar sync error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to sync to calendar" },
            { status: 500 },
        );
    }
}
