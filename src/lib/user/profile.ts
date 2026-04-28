"use client";

import { useCallback, useEffect, useState } from "react";

export type UserLevel =
  | "absolute_beginner"
  | "beginner"
  | "intermediate"
  | "returning";

export type UserGoal =
  | "learn_basics"
  | "learn_songs"
  | "improve_technique"
  | "daily_habit";

export type TutorStyle = "gentle" | "encouraging" | "analytical" | "strict";

export type UserProfile = {
  level: UserLevel;
  goal: UserGoal;
  dailyMinutes: number;
  tutorStyle: TutorStyle;
  completedAt: string;
};

const KEY = "piano_tutor_profile";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setProfile(raw ? (JSON.parse(raw) as UserProfile) : null);
    } catch {
      setProfile(null);
    }
    setReady(true);
  }, []);

  const saveProfile = useCallback((p: UserProfile) => {
    localStorage.setItem(KEY, JSON.stringify(p));
    setProfile(p);
  }, []);

  const clearProfile = useCallback(() => {
    localStorage.removeItem(KEY);
    setProfile(null);
  }, []);

  return { profile, ready, saveProfile, clearProfile };
}

export function levelLabel(level: UserLevel): string {
  return {
    absolute_beginner: "Absolute beginner",
    beginner: "Beginner",
    intermediate: "Intermediate",
    returning: "Returning player",
  }[level];
}

export function goalLabel(goal: UserGoal): string {
  return {
    learn_basics: "Learn the basics",
    learn_songs: "Learn songs",
    improve_technique: "Improve technique",
    daily_habit: "Build a daily habit",
  }[goal];
}

export function styleLabel(style: TutorStyle): string {
  return {
    gentle: "Gentle",
    encouraging: "Encouraging",
    analytical: "Analytical",
    strict: "Strict",
  }[style];
}
