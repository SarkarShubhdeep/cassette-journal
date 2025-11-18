import { db } from "@/db";
import { usersTable } from "@/schema";
import { auth0 } from "@/lib/auth0";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET current user profile
export async function GET() {
    try {
        const session = await auth0.getSession();
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, session.user.email!));

        if (user.length === 0) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: user[0] });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}

// PUT update user profile
export async function PUT(request: NextRequest) {
    try {
        const session = await auth0.getSession();
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name } = body;

        if (!name || name.trim() === "") {
            return NextResponse.json(
                { success: false, error: "Name is required" },
                { status: 400 }
            );
        }

        const updatedUser = await db
            .update(usersTable)
            .set({ name })
            .where(eq(usersTable.email, session.user.email!))
            .returning();

        if (updatedUser.length === 0) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: updatedUser[0] });
    } catch (error) {
        console.error("Error updating user profile:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update profile" },
            { status: 500 }
        );
    }
}
