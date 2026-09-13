"use client";

/**
 * /Users/qmanning/Local Sites/qmanning-next/src/components/tetris/ScoreSubmissionModal.tsx
 * Last Change: Created score submission modal for Tetris leaderboard
 * v1
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Trophy, Star } from "lucide-react";

interface ScoreSubmissionModalProps {
    isOpen: boolean;
    score: number;
    level: number;
    lines: number;
    onSubmit: (initials: string) => Promise<void>;
    onClose: () => void;
    isSubmitting?: boolean;
}

export default function ScoreSubmissionModal({
    isOpen,
    score,
    level,
    lines,
    onSubmit,
    onClose,
    isSubmitting = false,
}: ScoreSubmissionModalProps) {
    const [initials, setInitials] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!initials.trim()) {
            setError("Please enter your initials");
            return;
        }

        if (initials.length < 1 || initials.length > 3) {
            setError("Initials must be 1-3 characters");
            return;
        }

        if (!/^[A-Za-z0-9]+$/.test(initials)) {
            setError("Only letters and numbers allowed");
            return;
        }

        setError("");
        try {
            await onSubmit(initials.toUpperCase());
        } catch {
            setError("Failed to submit score. Please try again.");
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase().slice(0, 3);
        setInitials(value);
        if (error) setError("");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background border-2 border-foreground rounded-lg shadow-[8px_8px_0px_0px_#000000] max-w-md w-full mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b-2 border-foreground">
                    <div className="flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-chart-2" />
                        <h2 className="text-xl font-bold">Great Score!</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-muted rounded transition-colors"
                        disabled={isSubmitting}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Score Display */}
                <div className="p-6 border-b-2 border-foreground">
                    <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-2">
                            <Star className="h-5 w-5 text-chart-2" />
                            <span className="text-2xl font-bold text-primary">
                                {score.toLocaleString()}
                            </span>
                            <Star className="h-5 w-5 text-chart-2" />
                        </div>
                        <div className="flex justify-center gap-6 text-sm">
                            <div className="text-center">
                                <div className="font-medium text-muted-foreground">
                                    Level
                                </div>
                                <div className="text-lg font-bold">{level}</div>
                            </div>
                            <div className="text-center">
                                <div className="font-medium text-muted-foreground">
                                    Lines
                                </div>
                                <div className="text-lg font-bold">{lines}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="initials"
                                className="block text-sm font-medium mb-2"
                            >
                                Enter your initials (1-3 characters):
                            </label>
                            <Input
                                id="initials"
                                type="text"
                                value={initials}
                                onChange={handleInputChange}
                                placeholder="ABC"
                                maxLength={3}
                                className="text-center text-lg font-bold uppercase"
                                disabled={isSubmitting}
                                autoFocus
                            />
                            {error && (
                                <p className="text-sm text-destructive mt-1">
                                    {error}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="flex-1"
                            >
                                Skip
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !initials.trim()}
                                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                {isSubmitting
                                    ? "Submitting..."
                                    : "Submit Score"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
