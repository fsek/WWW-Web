import { isApiError, normalizeApiError } from "@/types/api-error";

export default function getErrorMessage(
	error: unknown,
	t: (key: string) => string,
): string {
	if (typeof error === "string") {
		return error;
	}

	if (error instanceof Error) {
		if (error.message.toLowerCase().includes("networkerror")) {
			return t("main:loading.network_error");
		}
		return error.message;
	}

	if (isApiError(error)) {
		if (error.status_code === 401 || error.detail === "Unauthorized") {
			return t("main:loading.unauthorized");
		}
		return error.detail;
	}

	if (typeof error === "object" && error !== null) {
		const normalized = normalizeApiError(error);
		if (
			normalized.status_code === 401 ||
			normalized.detail === "Unauthorized"
		) {
			return t("main:loading.unauthorized");
		}
		return normalized.detail;
	}

	console.debug("Unexpected error type:", error);
	console.debug("Error type is:", typeof error);

	return t("main:loading.no_error_message");
}
