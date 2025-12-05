import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/googleCalendar";
import { auth0 } from "@/lib/auth0";

/**
 * GET /api/auth/google
 * Initiates Google OAuth flow for Calendar access
 */
export async function GET() {
    try {
        // Get current user session
        const session = await auth0.getSession();
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "Not authenticated" },
                { status: 401 },
            );
        }

        // Pass user email as state to identify user in callback
        const state = Buffer.from(
            JSON.stringify({
                email: session.user.email,
            }),
        ).toString("base64");

        const authUrl = getAuthUrl(state);

        return NextResponse.json({
            success: true,
            authUrl,
        });
    } catch (error) {
        console.error("Google auth error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to generate auth URL" },
            { status: 500 },
        );
    }
}
