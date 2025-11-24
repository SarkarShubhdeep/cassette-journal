import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();

        if (!text || text.trim().length === 0) {
            return NextResponse.json(
                { error: "Text is required" },
                { status: 400 },
            );
        }

        if (!OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "OpenAI API key not configured" },
                { status: 500 },
            );
        }

        const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
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
                            content: `You are a helpful assistant that summarizes voice journal entries. 
                        Create a concise summary with 3-5 key bullet points.
                        Focus on main ideas, decisions, and action items.
                        Keep it brief and actionable. 
                        In the end write a one line comment for the day. You can be 50% sarcastic. `,
                        },
                        {
                            role: "user",
                            content: `Please summarize this journal entry:\n\n${text}`,
                        },
                    ],
                    temperature: 0.7,
                    max_tokens: 500,
                }),
            },
        );

        if (!response.ok) {
            const error = await response.json();
            console.error("OpenAI API error:", error);
            return NextResponse.json(
                { error: "Failed to generate summary" },
                { status: response.status },
            );
        }

        const data = await response.json();
        const summary = data.choices[0].message.content;

        return NextResponse.json({ summary });
    } catch (error) {
        console.error("Summarization error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
