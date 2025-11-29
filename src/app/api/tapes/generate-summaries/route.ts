import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { db } from "@/db";
import { postsTable, usersTable } from "@/schema";
import { eq, and, isNull, or, sql } from "drizzle-orm";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function generateShortSummary(content: string): Promise<string> {
    if (!OPENAI_API_KEY) {
        throw new Error("OpenAI API key not configured");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a helpful assistant that creates very brief one-line summaries of journal entries.
Create a single sentence summary (max 15-20 words) that captures the essence of the day/entry.
Focus on mood, main activities, and outcomes.
Examples:
- "Late start of the day, still very productive and hectic, 5 tasks."
- "Work, studies, outing with friends, played game, and then bed"
- "Quiet day at home, finished reading a book, feeling relaxed"
- "Stressful meeting at work, but resolved the issue, relieved"
Do NOT use markdown, bullet points, or any formatting. Just a single plain text sentence.`,
                },
                {
                    role: "user",
                    content: `Create a one-line summary for this journal entry:\n\n${content}`,
                },
            ],
            temperature: 0.7,
            max_tokens: 60,
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to generate summary");
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
}

export async function POST() {
    try {
        const session = await auth0.getSession();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const userEmail = session.user.email;
        const users = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, userEmail!));

        if (users.length === 0) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        const userId = users[0].id;

        // Get all tapes with content but no short summary
        const tapesNeedingSummary = await db
            .select()
            .from(postsTable)
            .where(
                and(
                    eq(postsTable.userId, userId),
                    sql`${postsTable.content} IS NOT NULL AND ${postsTable.content} != ''`,
                    or(
                        isNull(postsTable.shortSummary),
                        sql`${postsTable.shortSummary} = ''`,
                    ),
                ),
            );

        const results: { id: number; shortSummary: string }[] = [];

        for (const tape of tapesNeedingSummary) {
            try {
                const shortSummary = await generateShortSummary(tape.content);

                await db
                    .update(postsTable)
                    .set({ shortSummary })
                    .where(eq(postsTable.id, tape.id));

                results.push({ id: tape.id, shortSummary });
            } catch (err) {
                console.error(
                    `Failed to generate short summary for tape ${tape.id}:`,
                    err,
                );
            }
        }

        return NextResponse.json({
            success: true,
            generated: results.length,
            results,
        });
    } catch (error) {
        console.error("Generate summaries error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
