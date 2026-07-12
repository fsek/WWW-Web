import "@tanstack/react-query";
import type { ApiError } from "@/types/api-error";

declare module "@tanstack/react-query" {
	interface Register {
		defaultError: ApiError;
	}
}
