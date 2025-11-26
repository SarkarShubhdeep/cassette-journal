"use client";

import { use } from "react";
import TapeEditor from "@/components/TapeEditor";

export default function TapePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    return <TapeEditor tapeId={parseInt(id)} />;
}
