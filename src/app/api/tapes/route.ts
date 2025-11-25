import { db } from "@/db";
import { postsTable, usersTable } from "@/schema";
import { auth0 } from "@/lib/auth0";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET all tapes for current user
export async function GET() {
    try {
        const session = await auth0.getSession();
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 },
            );
        }

        // Find user by Auth0 email
        const user = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, session.user.email!));

        if (user.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        const tapes = await db
            .select()
            .from(postsTable)
            .where(eq(postsTable.userId, user[0].id));

        return NextResponse.json({ success: true, data: tapes });
    } catch (error) {
        console.error("Error fetching tapes:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch tapes" },
            { status: 500 },
        );
    }
}

// POST create new tape
export async function POST(request: NextRequest) {
    try {
        const session = await auth0.getSession();
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 },
            );
        }

        const body = await request.json();
        const { title, content } = body;

        if (!title || content === undefined) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Title and content are required",
                },
                { status: 400 },
            );
        }

        // Get or create user
        const existingUser = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, session.user.email!));

        let userId: number;

        if (existingUser.length === 0) {
            // Create new user if doesn't exist
            const newUser = await db
                .insert(usersTable)
                .values({
                    email: session.user.email!,
                    name: session.user.name || session.user.email!,
                })
                .returning();
            userId = newUser[0].id;
        } else {
            userId = existingUser[0].id;
        }

        const newTape = await db
            .insert(postsTable)
            .values({ title, content, userId })
            .returning();

        return NextResponse.json(
            { success: true, data: newTape[0] },
            { status: 201 },
        );
    } catch (error) {
        console.error("Error creating tape:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create tape" },
            { status: 500 },
        );
    }
}
