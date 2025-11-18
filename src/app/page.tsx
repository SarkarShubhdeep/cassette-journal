import { auth0 } from "@/lib/auth0";
import LoginButton from "@/components/LoginButton";
// import LogoutButton from "@/components/LogoutButton";
import HomeContent from "@/components/HomeContent";

import BGImage from "../../public/assets/bg-temp.png";
import Image from "next/image";

export default async function Home() {
    const session = await auth0.getSession();
    const user = session?.user;

    return (
        <div>
            {user ? (
                <HomeContent user={user} />
            ) : (
                <div className="relative z-10 flex flex-col items-center justify-center h-screen">
                    <div className="fixed inset-0 bg-foreground z-0">
                        <Image
                            src={BGImage}
                            alt="Background"
                            className="w-full h-full object-cover opacity-50"
                            fill
                            priority
                        />
                    </div>
                    <div className="z-10 flex flex-col items-center">
                        <h1 className="text-white text-2xl z-10">
                            Cassette Journal
                        </h1>

                        <p className="text-white/80 text-center mt-4 z-10">
                            An experimental project. Journaling + voice to text
                            + AI scheduling.
                        </p>
                        <p className="text-white/60 text-center mt-4 mb-8 font-mono">
                            Tech stack: Next.js, Auth0, DrizzleORM, NeonDB
                        </p>

                        <LoginButton />
                    </div>
                </div>
            )}
        </div>
    );
}
