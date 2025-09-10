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
		if (error.detail === "Unauthorized") {
			return t("main:loading.unauthorized");
		}
		return (error as { detail: string }).detail;
	}

	console.debug("Unexpected error type:", error);
	console.debug("Error type is:", typeof error);

	return t("main:loading.no_error_message");
}
