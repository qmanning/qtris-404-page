"use client";

/**
 * /Users/qmanning/Local Sites/qmanning-next/src/components/tetris/TetrisLeaderboard.tsx
 * Last Change: Created leaderboard display component for Tetris game
 * v1
 */

import React, {
    useEffect,
    useState,
    forwardRef,
    useImperativeHandle,
} from "react";
import { useStableCallback } from "@/hooks/react-safety";
import { Trophy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TetrisScore {
    id: string;
    initials: string;
    score: number;
    level: number;
    lines: number;
    created_at: string;
    rank: number;
}

interface LeaderboardStats {
    totalScores: number;
    topScore: number;
    lastUpdated: string;
}

interface LeaderboardData {
    leaderboard: TetrisScore[];
    stats: LeaderboardStats;
}

interface TetrisLeaderboardProps {
    className?: string;
    limit?: number;
    showRefresh?: boolean;
    onScoreClick?: (score: TetrisScore) => void;
}

const TetrisLeaderboard = forwardRef<
    { refresh: () => void },
    TetrisLeaderboardProps
>(function TetrisLeaderboard(
    { className = "", limit = 10, showRefresh = true, onScoreClick },
    ref
) {
    const [data, setData] = useState<LeaderboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [previousData, setPreviousData] = useState<LeaderboardData | null>(
        null
    );
    const [animatingScores, setAnimatingScores] = useState<Set<string>>(
        new Set()
    );

    // Expose refresh function to parent component
    useImperativeHandle(ref, () => ({
        refresh: fetchLeaderboard,
    }));

    const fetchLeaderboard = useStableCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `/api/tetris/leaderboard?limit=${limit}`
            );

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch leaderboard: ${response.status}`
                );
            }

            const leaderboardData = await response.json();

            // Check if this is an update (not initial load)
            if (data && previousData) {
                // Find new scores and trigger animations
                const newScores = leaderboardData.leaderboard.filter(
                    (newScore: TetrisScore) =>
                        !data.leaderboard.some(
                            (oldScore: TetrisScore) =>
                                oldScore.id === newScore.id
                        )
                );

                if (newScores.length > 0) {
                    // Animate new scores
                    newScores.forEach((score: TetrisScore) => {
                        setAnimatingScores((prev) =>
                            new Set(prev).add(score.id)
                        );
                    });

                    // Clear animation state after animation completes
                    setTimeout(() => {
                        setAnimatingScores(new Set());
                    }, 1000);
                }
            }

            setPreviousData(data);
            setData(leaderboardData);
        } catch (err) {
            console.error("Error fetching leaderboard:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load leaderboard"
            );
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard, limit]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className={`space-y-4 ${className}`}>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-black">
                        <Trophy className="h-5 w-5 text-black" />
                        Leaderboard
                    </h3>
                </div>
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg animate-pulse"
                        >
                            <div className="w-5 h-5 bg-black/25 rounded"></div>
                            <div className="w-8 h-4 bg-black/25 rounded"></div>
                            <div className="flex-1 h-4 bg-black/25 rounded"></div>
                            <div className="w-16 h-4 bg-black/25 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`space-y-4 ${className}`}>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-black">
                        <Trophy className="h-5 w-5 text-black" />
                        Leaderboard
                    </h3>
                    {showRefresh && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchLeaderboard}
                            className="h-8"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground">{error}</p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchLeaderboard}
                        className="mt-2"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between -mt-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-black">
                    <Trophy className="h-5 w-5 text-black" />
                    Leaderboard
                </h3>
                {showRefresh && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchLeaderboard}
                        disabled={loading}
                        className="h-8"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                loading ? "animate-spin" : ""
                            }`}
                        />
                    </Button>
                )}
            </div>

            {/* Leaderboard */}
            <div className="space-y-0">
                {data?.leaderboard && data.leaderboard.length > 0 ? (
                    data.leaderboard.map((score, index) => (
                        <div key={score.id}>
                            <div
                                className={`flex items-center gap-3 py-2 transition-all duration-500 ${
                                    onScoreClick
                                        ? "cursor-pointer hover:bg-muted/30"
                                        : ""
                                } ${
                                    animatingScores.has(score.id)
                                        ? "animate-in fade-in-0 slide-in-from-top-2 bg-green-50/50"
                                        : ""
                                }`}
                                onClick={() => onScoreClick?.(score)}
                            >
                                {/* Rank */}
                                <div className="flex items-center justify-center w-8">
                                    <span className="text-sm font-bold text-black">
                                        #{score.rank}
                                    </span>
                                </div>

                                {/* Initials */}
                                <div className="font-bold text-lg min-w-[3rem] text-center text-black">
                                    {score.initials}
                                </div>

                                {/* Score */}
                                <div className="flex-1 text-right">
                                    <div className="font-bold text-base text-black">
                                        {score.score.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-black/70">
                                        Lv.{score.level} • {score.lines} lines
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="text-xs text-black/70 min-w-[4rem] text-right">
                                    {formatDate(score.created_at)}
                                </div>
                            </div>

                            {/* Divider - show for all except last item */}
                            {index < data.leaderboard.length - 1 && (
                                <div className="border-b border-black/5"></div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center p-6 bg-muted/50 rounded-lg">
                        <Trophy className="h-8 w-8 mx-auto mb-2 text-black/70" />
                        <p className="text-black">No scores yet!</p>
                        <p className="text-sm text-black/70 mt-1">
                            Be the first to set a high score.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
});

export default TetrisLeaderboard;
