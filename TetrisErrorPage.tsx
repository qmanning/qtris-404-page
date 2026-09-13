"use client";

/**
 * /Users/qmanning/Local Sites/qmanning-next/src/components/tetris/TetrisErrorPage.tsx
 * Last Change: Created shared Tetris error page component for all error types
 * v1
 */

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import TetrisGame from "./TetrisGame";
import TetrisLeaderboard from "./TetrisLeaderboard";
import TopNavigation from "@/components/nav/TopNavigation";
import { Button } from "@/components/ui/button";
import { Home, RotateCcw } from "lucide-react";

interface TetrisErrorPageProps {
    title: string;
    subtitle: string;
    description: string;
    instruction: string;
    onRetry?: () => void;
    showRetryButton?: boolean;
    includeNavigation?: boolean;
    logoUrl?: string;
    logoWidth?: number;
    logoHeight?: number;
}

export default function TetrisErrorPage({
    title,
    subtitle,
    description,
    instruction,
    onRetry,
    showRetryButton = false,
    includeNavigation = true,
    logoUrl,
    logoWidth,
    logoHeight,
}: TetrisErrorPageProps) {
    const router = useRouter();
    const minScoreForLeaderboard = 50;
    const [achievement, setAchievement] = useState<string | null>(null);
    const [scoreSubmitted, setScoreSubmitted] = useState<{
        rank: number;
        initials: string;
    } | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);

    // Debug leaderboard state changes
    useEffect(() => {
        console.log("🔍 showLeaderboard changed to:", showLeaderboard);
    }, [showLeaderboard]);
    const leaderboardRef = useRef<{ refresh: () => void } | null>(null);

    const handleAchievement = (achievementText: string) => {
        setAchievement(achievementText);

        // Clear achievement after 3 seconds
        setTimeout(() => {
            setAchievement(null);
        }, 3000);
    };

    const handleLogoClick = () => {
        router.push("/");
    };

    const handleGoHome = () => {
        router.push("/");
    };

    const handleScoreSubmitted = (rank: number, initials: string) => {
        setScoreSubmitted({ rank, initials });
        setAchievement(
            rank <= 10
                ? `🏆 Rank #${rank}! You made the leaderboard as ${initials}!`
                : `⭐ Score submitted as ${initials}! Great job!`
        );

        // Refresh the leaderboard to show the new score immediately
        if (leaderboardRef.current?.refresh) {
            // Small delay to ensure the score has been saved to the database
            setTimeout(() => {
                leaderboardRef.current?.refresh();
            }, 500);
        }
    };

    const handleGameOver = (score: number, level: number, lines: number) => {
        console.log("🔍 handleGameOver called:", {
            score,
            level,
            lines,
            showLeaderboard,
            hasUserInteracted,
        });

        // Only trigger game over if user has actually interacted with the game
        // This prevents false triggers from hot reload/compilation
        if (
            (score > 0 || lines > 0) &&
            score >= minScoreForLeaderboard &&
            !showLeaderboard &&
            hasUserInteracted
        ) {
            console.log("✅ Setting game over and showing leaderboard");
            setGameOver(true);
            // Show leaderboard after a short delay for better UX
            setTimeout(() => {
                console.log("⏰ Timeout triggered - showing leaderboard");
                setShowLeaderboard(true);
            }, 1000);
        } else {
            console.log("❌ handleGameOver conditions not met:", {
                hasScore: score > 0 || lines > 0,
                meetsMinScore: score >= minScoreForLeaderboard,
                notAlreadyShowing: !showLeaderboard,
                userInteracted: hasUserInteracted,
            });
        }
    };

    const handleGameRestart = () => {
        setGameOver(false);
        setShowLeaderboard(false);
        setScoreSubmitted(null);
    };

    const handleGameStart = () => {
        setHasUserInteracted(true);
    };

    // Handle ESC key to close leaderboard
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && showLeaderboard) {
                setShowLeaderboard(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [showLeaderboard]);

    return (
        <div className="min-h-screen bg-background">
            {includeNavigation && (
                <TopNavigation onLogoClick={handleLogoClick} />
            )}

            <main
                className={`${
                    includeNavigation
                        ? "pt-4 sm:pt-[106px]"
                        : "pt-4 sm:pt-[106px]"
                } pb-8 min-h-screen`}
            >
                <div className="container mx-auto px-4">
                    {/* Mobile Layout: Stack vertically */}
                    <div className="block lg:hidden">
                        <div className="max-w-md mx-auto text-center">
                            {/* Error Text */}
                            <div className="space-y-2 mb-2">
                                {logoUrl ? (
                                    <div className="flex justify-center mb-2">
                                        <img
                                            src={logoUrl}
                                            alt={title}
                                            width={logoWidth}
                                            height={logoHeight}
                                            className="max-w-full h-auto"
                                        />
                                    </div>
                                ) : (
                                    <h1 className="text-6xl font-bold text-secondary">
                                        {title}
                                    </h1>
                                )}
                                <h2 className="text-xl font-semibold text-foreground">
                                    {subtitle}
                                </h2>
                                <p className="hidden">{description}</p>
                                {/* hide play tetris line on mobile */}
                                <p className="hidden">{instruction}</p>
                            </div>

                            {/* Achievement Banner */}
                            {achievement && (
                                <div className="p-3 bg-chart-2 text-black rounded-lg font-medium animate-bounce mb-2 relative animate-in slide-in-from-top-2 duration-300">
                                    {achievement}
                                    <button
                                        onClick={() => setAchievement(null)}
                                        className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center text-black hover:text-black/80 transition-colors text-sm font-bold bg-white/20 hover:bg-white/40 rounded-full"
                                        aria-label="Close achievement"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}

                            {/* Tetris Game */}
                            <div className="relative w-full max-w-md mx-auto scale-[0.95] origin-top">
                                <TetrisGame
                                    onAchievement={handleAchievement}
                                    onScoreSubmitted={handleScoreSubmitted}
                                    onGameOver={handleGameOver}
                                    onGameRestart={handleGameRestart}
                                    onGameStart={handleGameStart}
                                    autoScale={true}
                                    className="w-full"
                                    enableLeaderboard={true}
                                    minScoreForSubmission={
                                        minScoreForLeaderboard
                                    }
                                />

                                {/* Game Over Leaderboard Overlay - Only covers the canvas area */}
                                {showLeaderboard && (
                                    <div className="absolute top-0 left-0 right-0 bottom-12 bg-black/50 flex items-center justify-center backdrop-blur-sm z-10 animate-in fade-in-0 slide-in-from-top-4 duration-500 rounded-2xl">
                                        <div className="bg-chart-2 border-2 border-border rounded-lg overflow-hidden p-4 m-4 max-w-sm w-full max-h-[95%] overflow-y-auto relative">
                                            {/* Close Button */}
                                            <button
                                                onClick={() =>
                                                    setShowLeaderboard(false)
                                                }
                                                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-black hover:text-black/80 transition-colors z-20"
                                                aria-label="Close leaderboard"
                                            >
                                                ✕
                                            </button>
                                            {/* ESC hint */}
                                            <div className="absolute top-10 right-12 text-xs text-black/60">
                                                ESC to close
                                            </div>
                                            <TetrisLeaderboard
                                                ref={leaderboardRef}
                                                limit={10}
                                                showRefresh={false}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Button - centered */}
                            <motion.div
                                className="pt-2 flex justify-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{
                                    opacity: 1,
                                    y: achievement ? 20 : 0,
                                }}
                                transition={{
                                    duration: 0.8,
                                    ease: [0.68, -0.55, 0.265, 1.55],
                                }}
                            >
                                <Button
                                    onClick={handleGoHome}
                                    size="lg"
                                    className="rounded-lg"
                                >
                                    <Home className="w-4 h-4 mr-2" />
                                    Go Home
                                </Button>
                            </motion.div>
                        </div>
                    </div>

                    {/* Desktop Layout: Two columns */}
                    <div className="hidden lg:block">
                        <div className="grid grid-cols-[auto_324px] gap-8 items-start min-h-[calc(100vh-200px)] max-w-[800px] mx-auto w-full">
                            {/* Left Side: Error Text */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    {logoUrl ? (
                                        <div className="flex justify-start mb-2">
                                            <img
                                                src={logoUrl}
                                                alt={title}
                                                width={logoWidth}
                                                height={logoHeight}
                                                className="max-w-full h-auto"
                                            />
                                        </div>
                                    ) : (
                                        <h1 className="text-6xl font-bold text-secondary leading-none">
                                            {title}
                                        </h1>
                                    )}
                                    <h2 className="text-xl font-semibold text-foreground">
                                        {subtitle}
                                    </h2>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {description}
                                    </p>
                                    <p className="text-lg font-medium text-primary">
                                        {instruction}
                                    </p>
                                </div>

                                {/* Achievement Banner */}
                                {achievement && (
                                    <div className="p-4 bg-chart-2 text-black rounded-lg font-medium animate-bounce max-w-md relative animate-in slide-in-from-top-2 duration-300">
                                        {achievement}
                                        <button
                                            onClick={() => setAchievement(null)}
                                            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-black hover:text-black/80 transition-colors text-sm font-bold bg-white/20 hover:bg-white/40 rounded-full"
                                            aria-label="Close achievement"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <motion.div
                                    className="flex gap-4 pt-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{
                                        opacity: 1,
                                        y: achievement ? 20 : 0,
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        ease: [0.68, -0.55, 0.265, 1.55],
                                    }}
                                >
                                    <Button onClick={handleGoHome} size="lg">
                                        <Home className="w-4 h-4 mr-2" />
                                        Go Home
                                    </Button>

                                    {showRetryButton && onRetry && (
                                        <Button
                                            onClick={onRetry}
                                            variant="outline"
                                            size="lg"
                                        >
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            Try Again
                                        </Button>
                                    )}
                                </motion.div>

                                {/* Desktop Instructions */}
                                <motion.div
                                    className="pt-6 text-sm text-muted-foreground border-t border-border max-w-md"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{
                                        opacity: 1,
                                        y: achievement ? 20 : 0,
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        ease: [0.68, -0.55, 0.265, 1.55],
                                    }}
                                >
                                    <p className="font-medium mb-2">
                                        🎮 Controls:
                                    </p>
                                    <ul className="space-y-1 text-xs">
                                        <li>• ←→ or A/D: move left/right</li>
                                        <li>• ↑ or W: rotate</li>
                                        <li>• Spacebar: hard drop</li>
                                        <li>• ↓ or S: soft drop</li>
                                        <li>• P: pause</li>
                                    </ul>
                                </motion.div>
                            </div>

                            {/* Right Side: Tetris Game */}
                            <div className="relative flex justify-start items-start overflow-hidden min-w-0">
                                <TetrisGame
                                    onAchievement={handleAchievement}
                                    onScoreSubmitted={handleScoreSubmitted}
                                    onGameOver={handleGameOver}
                                    onGameRestart={handleGameRestart}
                                    onGameStart={handleGameStart}
                                    autoScale={true}
                                    width={320}
                                    height={640}
                                    enableLeaderboard={true}
                                    minScoreForSubmission={
                                        minScoreForLeaderboard
                                    }
                                />

                                {/* Game Over Leaderboard Overlay - Only covers the canvas area */}
                                {showLeaderboard && (
                                    <div className="absolute top-0 left-0 right-0 bottom-12 bg-black/50 flex items-center justify-center backdrop-blur-sm z-10 animate-in fade-in-0 slide-in-from-top-4 duration-500 rounded-2xl">
                                        <div className="bg-chart-2 border-2 border-foreground rounded-lg overflow-hidden p-6 max-w-sm w-full max-h-[95%] overflow-y-auto relative">
                                            {/* Close Button */}
                                            <button
                                                onClick={() =>
                                                    setShowLeaderboard(false)
                                                }
                                                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-black hover:text-black/80 transition-colors z-20"
                                                aria-label="Close leaderboard"
                                            >
                                                ✕
                                            </button>
                                            {/* ESC hint */}
                                            <div className="absolute top-10 right-12 text-xs text-black/60">
                                                ESC to close
                                            </div>
                                            <TetrisLeaderboard
                                                ref={leaderboardRef}
                                                limit={10}
                                                showRefresh={false}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
