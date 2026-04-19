export interface ApiError {
	detail: string;
	status_code: number;
	code?: string;
	[key: string]: unknown;
}

const getStringDetail = (detail: unknown): string | null => {
	if (typeof detail === "string") {
		return detail;
	}

	if (detail && typeof detail === "object") {
		const values = Object.values(detail as Record<string, unknown>);
		const firstString = values.find((value) => typeof value === "string");
		if (typeof firstString === "string") {
			return firstString;
		}
	}

	return null;
};

export const normalizeApiError = (
	error: unknown,
	statusCode?: number,
): ApiError => {
	if (error && typeof error === "object") {
		const obj = error as Record<string, unknown>;
		const normalizedStatus =
			typeof obj.status_code === "number" ? obj.status_code : statusCode;
		const normalizedDetail =
			getStringDetail(obj.detail) ??
			(typeof obj.message === "string" ? obj.message : "Unknown error");

		return {
			...obj,
			detail: normalizedDetail,
			status_code: normalizedStatus ?? 0,
		};
	}

	if (typeof error === "string") {
		return {
			detail: error,
			status_code: statusCode ?? 0,
		};
	}

	if (error instanceof Error) {
		return {
			detail: error.message,
			status_code: statusCode ?? 0,
		};
	}

	return {
		detail: "Unknown error",
		status_code: statusCode ?? 0,
	};
};

export const isApiError = (error: unknown): error is ApiError => {
	return (
		typeof error === "object" &&
		error !== null &&
		typeof (error as { detail?: unknown }).detail === "string" &&
		typeof (error as { status_code?: unknown }).status_code === "number"
	);
};
