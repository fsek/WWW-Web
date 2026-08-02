export const ACCEPT_ENUM = {
	ACCEPTED: "Accepted",
	FAILED: "Failed",
	REVIEW: "Review",
} as const;

// Create a type from the enum values
export type AcceptEnum = (typeof ACCEPT_ENUM)[keyof typeof ACCEPT_ENUM];

export const MENTOR_GROUP_TYPE_ENUM = {
	MENTOR: "Mentor",
	MISSION: "Mission",
	DEFAULT: "Default",
	COMMITTEE: "Committee",
} as const;

export type MentorGroupType =
	(typeof MENTOR_GROUP_TYPE_ENUM)[keyof typeof MENTOR_GROUP_TYPE_ENUM];

export const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL || "https://stage.backend.fsektionen.se";
export const MAX_DOC_FILE_SIZE_MB = 25;
