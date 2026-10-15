export default function getErrorMessage(
	error: Error | string | object,
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

	if (typeof error === "object" && "detail" in error) {
		const { detail } = error as { detail: unknown };

		if (detail === "Unauthorized") {
			return t("main:loading.unauthorized");
		}

		if (typeof detail === "string") {
			return detail;
		}

		// fastapi-users returns errors as { code, reason }
		// basically only relevant for registration errors
		if (
			!Array.isArray(detail) &&
			typeof detail === "object" &&
			detail !== null
		) {
			const { reason } = detail as { reason?: unknown };
			if (typeof reason === "string") {
				return reason;
			}
		}
	}

	console.debug("Unexpected error type:", error);
	console.debug("Error type is:", typeof error);

	return t("main:loading.no_error_message");
}
