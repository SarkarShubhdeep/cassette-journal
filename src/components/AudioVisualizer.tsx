"use client";

import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
    isActive: boolean;
    audioContext: AudioContext | null;
    analyser: AnalyserNode | null;
}

export function AudioVisualizer({
    isActive,
    audioContext,
    analyser,
}: AudioVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const dataArrayRef = useRef<Uint8Array | null>(null);

    useEffect(() => {
        if (!canvasRef.current || !analyser) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size
        canvas.width = 200;
        canvas.height = 40;

        // Create frequency data array
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        dataArrayRef.current = dataArray;

        const barCount = 20;
        const barWidth = canvas.width / barCount;
        let breathePhase = 0;

        const draw = () => {
            // Get frequency data
            analyser.getByteFrequencyData(dataArray);

            // Clear canvas
            ctx.fillStyle = "rgba(0, 0, 0, 0)";
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Calculate average frequency (speech detection)
            const average =
                dataArray.reduce((a, b) => a + b) / dataArray.length;
            const isSpeaking = average > 30;

            // Draw bars
            for (let i = 0; i < barCount; i++) {
                const dataIndex = Math.floor((i / barCount) * bufferLength);
                let barHeight = (dataArray[dataIndex] / 255) * canvas.height;

                // Breathing effect when silent
                if (!isSpeaking) {
                    breathePhase += 0.02;
                    const breatheAmount = Math.sin(breathePhase) * 5 + 8;
                    barHeight = breatheAmount;
                } else {
                    // Amplify speech visualization
                    barHeight = Math.max(barHeight, 15);
                }

                // Draw bar with gradient
                const gradient = ctx.createLinearGradient(
                    0,
                    0,
                    0,
                    canvas.height,
                );
                gradient.addColorStop(0, "rgba(34, 197, 94, 0.3)");
                gradient.addColorStop(0.5, "rgba(34, 197, 94, 0.8)");
                gradient.addColorStop(1, "rgba(34, 197, 94, 0.3)");

                ctx.fillStyle = gradient;
                ctx.fillRect(
                    i * barWidth + 2,
                    canvas.height - barHeight,
                    barWidth - 4,
                    barHeight,
                );
            }

            animationRef.current = requestAnimationFrame(draw);
        };

        if (isActive) {
            draw();
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isActive, analyser]);

    if (!isActive) {
        return null;
    }

    return (
        <canvas
            ref={canvasRef}
            className="h-10 w-52 rounded-lg bg-slate-900/50 backdrop-blur-sm"
        />
    );
}
