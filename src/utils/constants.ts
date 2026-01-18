// DEMO_MODE: Set to true for shortened timers during development/demo
export const DEMO_MODE = true;

// Duration presets in minutes (or seconds in demo mode)
export const DURATION_PRESETS = DEMO_MODE
  ? [1, 2, 3] // 1-3 minutes for demo
  : [25, 50, 90]; // Real durations

// Proof window in seconds (time to submit before proof)
export const PROOF_WINDOW_SECONDS = DEMO_MODE ? 60 : 120; // 60s demo, 2min real

// Tags for sessions
export const SESSION_TAGS = ['Study', 'Gym', 'Build', 'Other'] as const;
export type SessionTag = (typeof SESSION_TAGS)[number];

// Reaction emojis
export const REACTION_EMOJIS = ['🔥', '💪', '🎯', '⭐', '🚀'] as const;
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

// Tag icons mapping
export const TAG_ICONS: Record<SessionTag, string> = {
  Study: '📚',
  Gym: '💪',
  Build: '🛠️',
  Other: '✨',
};
