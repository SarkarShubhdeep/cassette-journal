import { NextResponse } from "next/server";
import { createClient } from "@deepgram/sdk";

export async function POST() {
    try {
        const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;

        if (!apiKey) {
            console.error("Deepgram API key not configured");
            return NextResponse.json(
                { error: "API key not configured" },
                { status: 500 },
            );
        }

        // Create Deepgram client
        const deepgram = createClient(apiKey);

        // Generate temporary token (30 seconds TTL)
        const { result: projectId, error: projectError } =
            await deepgram.manage.getProjects();

        if (projectError) {
            console.error("Failed to get project:", projectError);
            return NextResponse.json(
                { error: "Failed to get project" },
                { status: 500 },
            );
        }

        const project = projectId?.projects?.[0];

        if (!project) {
            console.error("No project found");
            return NextResponse.json(
                { error: "No project found" },
                { status: 500 },
            );
        }

        const { result: newKey, error: keyError } =
            await deepgram.manage.createProjectKey(project.project_id, {
                comment: "Temporary key for live transcription",
                scopes: ["usage:write"],
                time_to_live_in_seconds: 30,
            });

        if (keyError) {
            console.error("Failed to create key:", keyError);
            return NextResponse.json(
                { error: "Failed to create temporary key" },
                { status: 500 },
            );
        }

        return NextResponse.json(
            {
                key: newKey?.key,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Token endpoint error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
