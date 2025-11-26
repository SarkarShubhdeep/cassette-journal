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
                            content: `You are a task extraction assistant. Extract actionable tasks and time-bound events from journal entries.

EXTRACTION RULES:
- Extract ONLY tasks and events that are today or in the future
- EXCLUDE any past events/tasks mentioned
- For each item, identify:
  1. Task/event description
  2. Time when the task/event starts (use ISO 8601 format: YYYY-MM-DDTHH:MM:SS or null if no specific time)
  3. If no specific time is mentioned, use null
- Ensure no duplicates - if the same task/event appears multiple times, include it only once

Return ONLY a JSON array of objects with this structure:
[
  {
    "task": "Task or event description",
    "time": "ISO 8601 timestamp (YYYY-MM-DDTHH:MM:SS) or null if no specific time",
    "startTime": null,
    "endTime": null
  }
]

Example input: "I need to fix the login bug and send the report to Sarah by 5 PM today. Tomorrow I have HCI lecture at 2 PM. Also, today is Raji's birthday. I went to the gym yesterday."
Example output: [
  {
    "task": "Fix the login bug",
    "time": null,
    "startTime": null,
    "endTime": null
  },
  {
    "task": "Send report to Sarah",
    "time": "2024-01-15T17:00:00",
    "startTime": null,
    "endTime": null
  },
  {
    "task": "HCI lecture",
    "time": "2024-01-16T14:00:00",
    "startTime": null,
    "endTime": null
  },
  {
    "task": "Raji's birthday",
    "time": null,
    "startTime": null,
    "endTime": null
  }
]`,
                        },
                        {
                            role: "user",
                            content: `Extract tasks and events from this text:\n\n${text}`,
                        },
                    ],
                    temperature: 0.5,
                    max_tokens: 500,
                }),
            },
        );

        if (!response.ok) {
            const error = await response.json();
            console.error("OpenAI API error:", error);
            return NextResponse.json(
                { error: "Failed to extract tasks" },
                { status: response.status },
            );
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Parse the JSON array from the response
        interface Task {
            task: string;
            time: string | null;
            startTime: string | null;
            endTime: string | null;
        }
        let tasks: Task[] = [];
        try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
                // Remove duplicates based on task description
                const seen = new Set<string>();
                tasks = parsed.filter((item: Task) => {
                    const key = item.task.toLowerCase().trim();
                    if (seen.has(key)) {
                        return false;
                    }
                    seen.add(key);
                    return true;
                });
            }
        } catch {
            // If parsing fails, return empty array
            tasks = [];
        }

        return NextResponse.json({ tasks });
    } catch (error) {
        console.error("Task extraction error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
