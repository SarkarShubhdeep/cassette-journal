import { db } from "@/db";
import { usersTable } from "@/schema";
import { NextRequest, NextResponse } from "next/server";

// GET all users
export async function GET() {
    try {
        const users = await db.select().from(usersTable);
        return NextResponse.json({ success: true, data: users });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}

// POST create new user
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email } = body;

        if (!name || !email) {
            return NextResponse.json(
                { success: false, error: "Name and email are required" },
                { status: 400 }
            );
        }

        const newUser = await db
            .insert(usersTable)
            .values({ name, email })
            .returning();

        return NextResponse.json(
            { success: true, data: newUser[0] },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create user" },
            { status: 500 }
        );
    }
}
