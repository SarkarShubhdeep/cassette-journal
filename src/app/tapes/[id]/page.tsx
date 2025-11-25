import TapeEditor from "@/components/TapeEditor";

export default function TapePage({ params }: { params: { id: string } }) {
    return <TapeEditor tapeId={parseInt(params.id)} />;
}
