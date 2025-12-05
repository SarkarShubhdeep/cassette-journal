"use client";

import { Badge } from "@/components/ui/badge";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, MoveRight } from "lucide-react";

export function DevelopmentRoadmap() {
    return (
        <section className="w-full space-y-2 pt-20" id="roadmap">
            <h3 className="font-semibold">Development Roadmap</h3>

            {/* Phase 0 */}
            <Collapsible>
                <CollapsibleTrigger asChild>
                    <div className="bg-accent flex grow items-center justify-between p-6">
                        <div className="flex items-center gap-5">
                            <h3 className="font-semibold">
                                Phase 0: Initial Setup
                            </h3>
                            <Badge
                                variant="default"
                                className="bg-green-400 text-green-900 dark:bg-green-700 dark:text-green-100"
                            >
                                DONE
                            </Badge>
                        </div>
                        <ChevronDown />
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-accent space-y-4 p-6 text-sm">
                    <div className="flex grow flex-col items-start justify-start space-y-2 sm:flex-row">
                        <div className="w-sm">
                            Project Setup
                            <span className="ml-4 font-semibold text-green-600">
                                DONE
                            </span>
                        </div>
                        <div className="flex-1">
                            <p className="text-muted-foreground">
                                Next.js, NeonDB, DrizzleORM, shadcn/ui
                            </p>
                        </div>
                    </div>
                    <div className="flex grow flex-col items-start justify-start space-y-2 sm:flex-row">
                        <div className="w-sm">
                            User Authentication
                            <span className="ml-4 font-semibold text-green-600">
                                DONE
                            </span>
                        </div>
                        <div className="flex-1">
                            <p className="text-muted-foreground">
                                Auth0 configured. Users can signin/signup using
                                Google account.
                            </p>
                        </div>
                    </div>
                    <div className="flex grow flex-col items-start justify-start space-y-2 sm:flex-row">
                        <div className="w-sm">
                            Basic UI
                            <span className="ml-4 font-semibold text-green-600">
                                DONE
                            </span>
                        </div>
                        <div className="flex-1">
                            <p className="text-muted-foreground">
                                Entry listing and individual note page layout.
                            </p>
                        </div>
                    </div>
                    <div className="flex grow flex-col items-start justify-start space-y-2 sm:flex-row">
                        <div className="w-sm">
                            Transcription
                            <span className="ml-4 font-semibold text-green-600">
                                DONE
                            </span>
                        </div>
                        <div className="flex-1">
                            <p className="text-muted-foreground">
                                Tested Deepgram - didn&apos;t work smoothly was
                                having live transcription issue Moved to OpenAI
                                Whisper - records and then transcribes. Stable.
                            </p>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>

            {/* Phase 1 */}
            <Collapsible>
                <CollapsibleTrigger asChild>
                    <div className="bg-accent flex grow items-center justify-between p-6">
                        <div className="flex items-center gap-5">
                            <h3 className="font-semibold">
                                Phase 1: AI Features
                            </h3>
                            <Badge
                                variant="default"
                                className="bg-green-400 text-green-900 dark:bg-green-700 dark:text-green-100"
                            >
                                DONE
                            </Badge>
                        </div>
                        <ChevronDown />
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-accent space-y-4 p-6 text-sm">
                    <div className="flex grow flex-col items-start justify-start space-y-2 sm:flex-row">
                        <div className="w-sm">
                            LLM Research & Testing
                            <span className="ml-4 font-semibold text-green-600">
                                DONE
                            </span>
                        </div>
                        <div className="flex-1">
                            <p className="text-muted-foreground">
                                Searching for the right LLM for core AI
                                features.
                            </p>
                        </div>
                    </div>
                    <div className="flex grow flex-col items-start justify-start space-y-2 sm:flex-row">
                        <div className="w-sm">
                            Summarization and Extraction
                            <span className="ml-4 font-semibold text-green-600">
                                DONE
                            </span>
                        </div>
                        <div className="flex-1">
                            <p className="text-muted-foreground">
                                - Finalize prompt engineering for the Debrief
                                (3-5 bullet points). <br />- Code the logic to
                                identify and extract Events and Action Items
                                strictly from the transcription text.
                            </p>
                        </div>
                    </div>
                    <div className="flex grow flex-col items-start justify-start space-y-2 sm:flex-row">
                        <div className="w-sm">
                            Output
                            <span className="ml-4 font-semibold text-green-600">
                                DONE
                            </span>
                        </div>
                        <div className="flex-1">
                            <p className="text-muted-foreground">
                                Display the structured AI output (Summary,
                                Tasks, Events) and transcript on the individual
                                note page.
                            </p>
                        </div>
                    </div>
                    <div className="flex grow flex-col items-start justify-start space-y-2 sm:flex-row">
                        <div className="w-sm">
                            UI/UX and CRUD
                            <span className="ml-4 font-semibold text-green-600">
                                DONE
                            </span>
                        </div>
                        <div className="flex-1">
                            <p className="text-muted-foreground">
                                - Implement the complete flow: Start Recording
                                <MoveRight className="mx-2 inline aspect-auto h-4 w-4" />
                                Stop
                                <MoveRight className="mx-2 inline aspect-auto h-4 w-4" />
                                Processing Loader
                                <MoveRight className="mx-2 inline aspect-auto h-4 w-4" />
                                View Result.
                                <br />- Implement the CRUD operations tasks.
                            </p>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>

            {/* Phase 2 */}
            <Collapsible defaultOpen>
                <CollapsibleTrigger asChild>
                    <div className="bg-accent flex grow items-center justify-between p-6">
                        <div className="flex items-center gap-5">
                            <h3 className="font-semibold">
                                Phase 2: Improve UI and Performance
                            </h3>
                            <Badge
                                variant="default"
                                className="bg-yellow-400 text-yellow-900 dark:bg-yellow-700 dark:text-yellow-100"
                            >
                                IN PROGRESS
                            </Badge>
                        </div>
                        <ChevronDown />
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-accent space-y-4 p-6 text-sm">
                    <div className="flex grow flex-col items-start justify-start space-y-2 sm:flex-row">
                        <div className="w-sm">
                            UI/UX
                            <span className="ml-4 font-semibold text-yellow-600">
                                IN PROGRESS
                            </span>
                        </div>
                        <div className="flex-1">
                            <p className="text-muted-foreground">
                                Implement the final UI designs. Focus on making
                                the UI feel fast and reactive.
                            </p>
                        </div>
                    </div>
                    <div className="flex grow flex-col items-start justify-start space-y-2 sm:flex-row">
                        <div className="w-sm">
                            Scheduling/Reminders Display
                            <span className="ml-4 font-semibold text-yellow-600">
                                IN PROGRESS
                            </span>
                        </div>
                        <div className="flex-1">
                            <p className="text-muted-foreground">
                                Implement a consolidated view (e.g., a sidebar)
                                that pulls all extracted Events/Tasks from all
                                Tapes, serving as a basic Reminder dashboard.
                                (No external calendar syncing yet).
                            </p>
                        </div>
                    </div>
                    <div className="flex grow flex-col items-start justify-start space-y-2 sm:flex-row">
                        <div className="w-sm">Performance</div>
                        <div className="flex-1">
                            <p className="text-muted-foreground">
                                Focus on optimizing database queries (Drizzle)
                                and minimizing the latency between Recording
                                Stop and Summary Display.
                            </p>
                        </div>
                    </div>

                    <div className="flex grow flex-col items-start justify-start space-y-2 sm:flex-row">
                        <div className="w-sm">
                            Basic Keyword Search
                            <span className="ml-4 hidden font-semibold text-green-600">
                                DONE
                            </span>
                        </div>
                        <div className="flex-1">
                            <p className="text-muted-foreground">
                                Implement text search across all transcripts to
                                make finding past Tapes fast and simple.
                            </p>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </section>
    );
}
