import { db } from "@/db";
import { postsTable, usersTable, tasksTable } from "@/schema";
import { auth0 } from "@/lib/auth0";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Helper function to verify user owns the tape
async function verifyTapeOwnership(tapeId: number, userEmail: string) {
    const tape = await db
        .select()
        .from(postsTable)
        .where(eq(postsTable.id, tapeId));

    if (tape.length === 0) {
        return null;
    }

    const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, tape[0].userId));

    if (user.length === 0 || user[0].email !== userEmail) {
        return null;
    }

    return tape[0];
}

// GET single tape
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth0.getSession();
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id } = await params;
        const tapeId = parseInt(id);
        const tape = await verifyTapeOwnership(tapeId, session.user.email!);

        if (!tape) {
            return NextResponse.json(
                { success: false, error: "Tape not found or unauthorized" },
                { status: 404 },
            );
        }

        const tasks = await db
            .select()
            .from(tasksTable)
            .where(eq(tasksTable.postId, tapeId))
            .orderBy(tasksTable.sortOrder);

        return NextResponse.json({ success: true, data: { ...tape, tasks } });
    } catch (error) {
        console.error("Error fetching tape:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch tape" },
            { status: 500 },
        );
    }
}

// PUT update tape
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth0.getSession();
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id } = await params;
        const tapeId = parseInt(id);
        const body = await request.json();
        const { title, content, summary, tasks } = body;

        if (!title || content === undefined) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Title and content are required",
                },
                { status: 400 },
            );
        }

        // Verify ownership before updating
        const existingTape = await verifyTapeOwnership(
            tapeId,
            session.user.email!,
        );
        if (!existingTape) {
            return NextResponse.json(
                { success: false, error: "Tape not found or unauthorized" },
                { status: 404 },
            );
        }

        const updatedTape = await db
            .update(postsTable)
            .set({ title, content, summary: summary ?? null })
            .where(eq(postsTable.id, tapeId))
            .returning();

        // Handle tasks if provided
        if (tasks && Array.isArray(tasks)) {
            // Delete existing tasks for this tape
            await db.delete(tasksTable).where(eq(tasksTable.postId, tapeId));

            // Insert new tasks with sort order
            if (tasks.length > 0) {
                await db.insert(tasksTable).values(
                    tasks.map(
                        (
                            task: {
                                text: string;
                                completed: boolean;
                                time?: string;
                            },
                            index: number,
                        ) => ({
                            postId: tapeId,
                            text: task.text,
                            completed: task.completed,
                            time: task.time || null,
                            sortOrder: index,
                        }),
                    ),
                );
            }
        }

        // Fetch updated tasks to return
        const updatedTasks = await db
            .select()
            .from(tasksTable)
            .where(eq(tasksTable.postId, tapeId))
            .orderBy(tasksTable.sortOrder);

        return NextResponse.json({
            success: true,
            data: { ...updatedTape[0], tasks: updatedTasks },
        });
    } catch (error) {
        console.error("Error updating tape:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update tape" },
            { status: 500 },
        );
    }
}

// PATCH update partial tape (e.g., just title)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth0.getSession();
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id } = await params;
        const tapeId = parseInt(id);
        const body = await request.json();
        const { title } = body;

        if (!title) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Title is required",
                },
                { status: 400 },
            );
        }

        // Verify ownership before updating
        const existingTape = await verifyTapeOwnership(
            tapeId,
            session.user.email!,
        );
        if (!existingTape) {
            return NextResponse.json(
                { success: false, error: "Tape not found or unauthorized" },
                { status: 404 },
            );
        }

        const updatedTape = await db
            .update(postsTable)
            .set({ title })
            .where(eq(postsTable.id, tapeId))
            .returning();

        return NextResponse.json({
            success: true,
            data: updatedTape[0],
        });
    } catch (error) {
        console.error("Error updating tape:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update tape" },
            { status: 500 },
        );
    }
}

// DELETE tape
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth0.getSession();
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id } = await params;
        const tapeId = parseInt(id);

        // Verify ownership before deleting
        const existingTape = await verifyTapeOwnership(
            tapeId,
            session.user.email!,
        );
        if (!existingTape) {
            return NextResponse.json(
                { success: false, error: "Tape not found or unauthorized" },
                { status: 404 },
            );
        }

        const deletedTape = await db
            .delete(postsTable)
            .where(eq(postsTable.id, tapeId))
            .returning();

        return NextResponse.json({ success: true, data: deletedTape[0] });
    } catch (error) {
        console.error("Error deleting tape:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete tape" },
            { status: 500 },
        );
    }
}
