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

		// FastAPI/pydantic validation errors (HTTP 422) come back as
		// { detail: [{ type, loc, msg, input, ctx? }, ...] }.
		// We don't want to use input since that could echo back sensitive information
		if (Array.isArray(detail)) {
			const messages = detail.flatMap((item) => {
				const { loc, msg } = (item ?? {}) as { loc?: unknown; msg?: unknown };
				if (typeof msg !== "string" || msg.length === 0) {
					return [];
				}

				// loc is e.g. ["body", "telephone_number"]
				// used to give context for what field the error is for
				const field = (Array.isArray(loc) ? loc : [])
					.filter(
						(part) =>
							typeof part === "string" &&
							part !== "body" &&
							part !== "query" &&
							part !== "path",
					)
					.pop() as string | undefined;

				if (!field) {
					return [msg];
				}

				const label = field.replace(/_/g, " ");
				return [`${label}: ${msg}`];
			});

			if (messages.length > 0) {
				return messages.join("\n");
			}
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
