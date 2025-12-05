import { NextRequest, NextResponse } from "next/server";
import { getTokensFromCode, getGoogleUserEmail } from "@/lib/googleCalendar";
import { db } from "@/db";
import { usersTable } from "@/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/auth/google/callback
 * Handles the OAuth callback from Google
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");

        // Handle user denial or error
        if (error) {
            console.error("Google OAuth error:", error);
            return NextResponse.redirect(
                new URL("/?google_auth=error&message=" + error, request.url),
            );
        }

        if (!code || !state) {
            return NextResponse.redirect(
                new URL(
                    "/?google_auth=error&message=missing_params",
                    request.url,
                ),
            );
        }

        // Decode state to get user email
        let userEmail: string;
        try {
            const stateData = JSON.parse(
                Buffer.from(state, "base64").toString(),
            );
            userEmail = stateData.email;
        } catch {
            return NextResponse.redirect(
                new URL(
                    "/?google_auth=error&message=invalid_state",
                    request.url,
                ),
            );
        }

        // Exchange code for tokens
        const tokens = await getTokensFromCode(code);

        if (!tokens.refresh_token) {
            console.error("No refresh token received from Google");
            return NextResponse.redirect(
                new URL(
                    "/?google_auth=error&message=no_refresh_token",
                    request.url,
                ),
            );
        }

        // Get Google user email
        const googleEmail = await getGoogleUserEmail(tokens.access_token!);

        // Store tokens in database
        await db
            .update(usersTable)
            .set({
                googleRefreshToken: tokens.refresh_token,
                googleAccessToken: tokens.access_token,
                googleTokenExpiry: tokens.expiry_date
                    ? new Date(tokens.expiry_date)
                    : null,
                googleEmail: googleEmail,
            })
            .where(eq(usersTable.email, userEmail));

        // Redirect back to app with success
        return NextResponse.redirect(
            new URL("/?google_auth=success", request.url),
        );
    } catch (error) {
        console.error("Google callback error:", error);
        return NextResponse.redirect(
            new URL("/?google_auth=error&message=callback_failed", request.url),
        );
    }
}
