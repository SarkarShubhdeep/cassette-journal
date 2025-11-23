import { auth0 } from "@/lib/auth0";
import LoginButton from "@/components/LoginButton";
// import LogoutButton from "@/components/LogoutButton";
import HomeContent from "@/components/HomeContent";

import BGImage from "../../public/assets/bg-temp.png";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function Home() {
    const session = await auth0.getSession();
    const user = session?.user;

    return (
        <div>
            {user ? (
                <HomeContent user={user} />
            ) : (
                <div className="relative z-10 flex h-screen w-full flex-col items-center px-4 sm:px-0">
                    {/* Top fixed bg image */}
                    {/* <div className="bg-background fixed inset-0 z-0">
                        <Image
                            src={BGImage}
                            alt="Background"
                            className="h-full w-full object-cover"
                            fill
                            priority
                        />
                    </div> */}
                    {/* Top right fixed buttons */}
                    <div className="fixed top-20 right-0 left-0 z-10 mx-auto flex max-w-6xl items-start justify-end gap-3">
                        <ThemeToggle />
                        <div className="items-end gap-2">
                            <Button disabled>Try it out</Button>
                            <p className="text-muted-foreground text-sm">
                                Coming soon
                            </p>
                        </div>
                        <LoginButton />
                    </div>

                    {/* Centered content */}
                    <div className="flex w-full max-w-6xl flex-col items-start justify-start">
                        <section className="flex h-screen w-full flex-col justify-between py-20">
                            <div className="flex w-full max-w-2xl flex-col gap-2">
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
                                    <div className="space-x-6">
                                        <Link
                                            href="/login"
                                            className="hover:underline"
                                        >
                                            Features
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="hover:underline"
                                        >
                                            Development Roadmap
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="hover:underline"
                                        >
                                            Tech Stack
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="hover:underline"
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
                    </div>
                </div>
            )}
        </div>
    );
}
