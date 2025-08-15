export const ACCEPT_ENUM = {
	ACCEPTED: "Accepted",
	FAILED: "Failed",
	REVIEW: "Review",
} as const;

// Create a type from the enum values
export type AcceptEnum = (typeof ACCEPT_ENUM)[keyof typeof ACCEPT_ENUM];
