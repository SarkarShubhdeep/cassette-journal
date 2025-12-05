import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
);

// Scopes required for calendar access and user info
const SCOPES = [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/userinfo.email",
];

/**
 * Generate the Google OAuth URL for user authorization
 */
export function getAuthUrl(state?: string): string {
    return oauth2Client.generateAuthUrl({
        access_type: "offline", // Required to get refresh token
        scope: SCOPES,
        prompt: "consent", // Force consent to always get refresh token
        state: state, // Pass user ID or other state
    });
}

/**
 * Exchange authorization code for tokens and get user email
 */
export async function getTokensFromCode(code: string) {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
}

/**
 * Get Google user email from access token
 */
export async function getGoogleUserEmail(
    accessToken: string,
): Promise<string | null> {
    try {
        const auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI,
        );
        auth.setCredentials({ access_token: accessToken });

        const oauth2 = google.oauth2({ version: "v2", auth });
        const userInfo = await oauth2.userinfo.get();
        return userInfo.data.email || null;
    } catch (error) {
        console.error("Failed to get Google user email:", error);
        return null;
    }
}

/**
 * Create an authenticated Google Calendar client
 */
export function getCalendarClient(accessToken: string, refreshToken?: string) {
    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI,
    );

    auth.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
    });

    return google.calendar({ version: "v3", auth });
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string) {
    oauth2Client.setCredentials({
        refresh_token: refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
}

interface TaskEvent {
    id: number;
    text: string;
    time: string;
    googleEventId?: string | null;
}

/**
 * Create a calendar event for a task
 */
export async function createCalendarEvent(
    calendar: ReturnType<typeof google.calendar>,
    task: TaskEvent,
) {
    const startTime = new Date(task.time);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 min duration

    const event = {
        summary: task.text,
        start: {
            dateTime: startTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
            dateTime: endTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        description: "Created from Cassette Journal",
    };

    const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
    });

    return response.data;
}

/**
 * Sync multiple tasks to Google Calendar
 */
export async function syncTasksToCalendar(
    accessToken: string,
    refreshToken: string,
    tasks: TaskEvent[],
): Promise<{ taskId: number; googleEventId: string }[]> {
    const calendar = getCalendarClient(accessToken, refreshToken);
    const results: { taskId: number; googleEventId: string }[] = [];

    for (const task of tasks) {
        // Only sync tasks that have a time set
        if (!task.time) continue;

        try {
            const event = await createCalendarEvent(calendar, task);
            if (event.id) {
                results.push({
                    taskId: task.id,
                    googleEventId: event.id,
                });
            }
        } catch (error) {
            console.error(`Failed to create event for task ${task.id}:`, error);
            // Continue with other tasks even if one fails
        }
    }

    return results;
}
