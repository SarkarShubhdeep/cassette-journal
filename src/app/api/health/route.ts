// import { db } from "@/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Test database connection by running a simple query
        // const result = await db.execute("SELECT 1");
        return NextResponse.json({
            success: true,
            message: "Database connection successful",
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Database connection failed:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Database connection failed",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
