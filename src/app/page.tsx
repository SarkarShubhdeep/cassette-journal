import { auth0 } from "@/lib/auth0";
import LoginButton from "@/components/LoginButton";
import HomeContent from "@/components/HomeContent";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { DevelopmentRoadmap } from "@/components/DevelopmentRoadmap";
import { ArrowUpRight } from "lucide-react";

export default async function Home() {
    const session = await auth0.getSession();
    const user = session?.user;

    return (
        <div>
            {user ? (
                <HomeContent user={user} />
            ) : (
                <div className="relative z-10 flex h-screen w-full flex-col items-center px-4 md:px-2">
                    {/* Top fixed bg image */}
                    <div className="pointer-events-none absolute inset-0 top-0 z-0 mx-auto max-w-6xl">
                        <Image
                            src="/assets/cassette-bg-light.png"
                            alt="Background"
                            className="h-full w-full object-contain dark:invert"
                            fill
                        />
                    </div>
                    {/* Top right fixed buttons */}
                    <div className="fixed top-20 right-0 left-0 z-10 mx-auto flex max-w-6xl items-start justify-end gap-3">
                        {/* <ThemeToggle /> */}
                        <div className="items-end space-y-2">
                            <Button disabled>Try it out</Button>
                            <p className="text-muted-foreground text-right text-sm">
                                Coming soon
                            </p>
                        </div>
                        <LoginButton />
                    </div>

                    {/* Centered content */}
                    <div className="flex w-full max-w-6xl flex-col items-start justify-start">
                        <section className="flex h-screen w-full flex-col justify-between py-20">
                            <div className="flex w-full max-w-sm flex-col gap-2 pt-24 sm:pt-0 md:max-w-2xl">
                                <h3 className="text-muted-foreground font-semibold">
                                    What is it?
                                </h3>
                                <p className="text-lg">
                                    A voice-first journal that uses AI to
                                    summarize your thoughts and extract key
                                    details like pending tasks and upcoming
                                    events. Turn your ramblings into a roadmap.
                                    Because{" "}
                                    <span className="bg-yellow-300 px-1 dark:bg-yellow-500 dark:text-black">
                                        sometimes you don&apos;t need a diary;
                                        you need a debrief.
                                    </span>
                                </p>
                            </div>

                            {/* Big Title */}
                            <div className="flex w-full max-w-6xl flex-col gap-4">
                                <Badge variant="outline" className="uppercase">
                                    In Development
                                </Badge>
                                <h1 className="font-mono text-6xl md:text-8xl">
                                    Cassette <br /> Journal
                                </h1>

                                <div className="mt-10 flex w-full items-center justify-between text-sm">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
                                        <Link
                                            href="#features"
                                            className="cursor-pointer hover:underline"
                                        >
                                            Features
                                        </Link>
                                        <Link
                                            href="#roadmap"
                                            className="hover:underline"
                                        >
                                            Development Roadmap
                                        </Link>
                                        <Link
                                            href="#techstack"
                                            className="cursor-pointer hover:underline"
                                        >
                                            Tech Stack
                                        </Link>
                                        <Link
                                            href="#why"
                                            className="cursor-pointer hover:underline"
                                        >
                                            Why Cassette Journal?
                                        </Link>
                                    </div>

                                    <Link
                                        href="https://github.com/sarkarshubhdeep"
                                        className="hover:bg-accent flex items-center gap-2"
                                    >
                                        <span>
                                            Shubh
                                            <span className="text-muted-foreground">
                                                deep <br />
                                                Sarkar
                                            </span>
                                        </span>
                                        <Image
                                            src="https://github.com/sarkarshubhdeep.png"
                                            alt="Shubhdeep Sarkar"
                                            width={40}
                                            height={40}
                                        />
                                    </Link>
                                </div>
                            </div>
                        </section>

                        {/* potential features */}
                        <section className="space-y-2 pt-20" id="features">
                            <h3 className="font-semibold">
                                Potential Features
                            </h3>
                            <ul className="text-muted-foreground list-inside">
                                <li>
                                    - cassette player UI, analog sound effects{" "}
                                    <span className="text-muted-foreground"></span>
                                </li>
                                <li>- speech to text </li>
                                <li>- transcribed speech will be editable </li>
                                <li>- summarize recording</li>
                                <li>- extract upcoming events </li>
                                <li>- recognize any tasks</li>
                                <li>- auto event scheduling/calendar sync</li>
                            </ul>
                        </section>

                        {/* development roadmap */}
                        <DevelopmentRoadmap />

                        <section className="space-y-2 pt-20" id="techstack">
                            <h3 className="font-semibold">Tech Stack</h3>
                            <ul className="text-muted-foreground list-inside">
                                <li>- Next.js, Tailwind</li>
                                <li>- Auth0</li>
                                <li>- NeonDB</li>
                                <li>- Drizzle ORM</li>
                                <li>- OpenAI Whisper</li>
                                <li>
                                    - Windsurf, Claude Sonnet and Haiku, Gemini
                                    3
                                </li>
                                <li>- Figma</li>
                            </ul>
                        </section>

                        <section className="space-y-2 py-20" id="why">
                            <h3 className="font-semibold">
                                Why Cassette Journal?
                            </h3>
                            <p className="text-muted-foreground">
                                Short answer... analog hits different. Ofcourse
                                this is not a physical thing, but I wanted to
                                create a native application with sounds, and all
                                the haptic feedbacks we used to get on those old
                                school cassette players. Not many recorded their
                                thoughts on a cassette but a countless number of
                                people, possibly we all at least at some point
                                of out lives pick a pen and start writing in a
                                diary.
                            </p>
                            <p className="text-muted-foreground">
                                I personally don&apos;t do dear diary every
                                night but I many times when I have to just dump
                                my thoughts somewhere and there&apos;s still
                                nothing better than a journal notebook. There
                                are tons of note taking apps out there and
                                integrating AI capabilities in this application
                                is I suppose the need of time.
                            </p>
                            <p className="text-muted-foreground">
                                Check the TLDR; “A journal that talks back”.
                                <Link
                                    href="https://www.tldraw.com/f/5D3oN4oyewkQIyUxtYw91?d=v-6622.-4686.15956.11165.page"
                                    target="_blank"
                                    className="hover:underline"
                                >
                                    <Badge
                                        variant="default"
                                        className="ml-2 bg-blue-400 text-white dark:bg-blue-500"
                                    >
                                        <ArrowUpRight />
                                    </Badge>
                                </Link>
                            </p>
                            <p className="text-muted-foreground">
                                Hence, Cassette Journal. I&apos;m not sure about
                                the name though.
                            </p>
                        </section>
                    </div>

                    {/* Footer */}
                    <footer className="border-border text-muted-foreground w-full border-t py-8 text-center text-sm">
                        <p>
                            © {new Date().getFullYear()} Cassette Journal.
                            Developed by Shubhdeep Sarkar.
                        </p>
                    </footer>
                </div>
            )}
        </div>
    );
}
