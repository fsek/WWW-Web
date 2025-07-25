import { Spinner } from "@/components/Spinner";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { CircleX } from "lucide-react";
import { useEffect, useState, type FC } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

function getRandomMessage() {
	return `main:loading.flavor_${Math.floor(Math.random() * 8) + 1}`;
}

function getErrorMessage(
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
	}

	if (typeof error === "object" && "detail" in error) {
		return (error as { detail: string }).detail;
	}

	console.debug("Unexpected error type:", error);
	console.debug("Error type is:", typeof error);

	return t("main:loading.no_error_message");
}

interface LoadingErrorCardProps {
	error?: Error | string;
	isLoading?: boolean;
	loadingMessage?: string;
	errorHomeButton?: boolean;
}

export const LoadingErrorCard: FC<LoadingErrorCardProps> = ({
	error,
	isLoading = true,
	loadingMessage,
	errorHomeButton = false,
}) => {
	const { t } = useTranslation();
	const [message, setMessage] = useState<string>(t("main:loading.basic"));
	const router = useRouter();

	useEffect(() => {
		if (!error && isLoading) {
			if (loadingMessage) {
				setMessage(loadingMessage);
			} else {
				setMessage(t(getRandomMessage()));
			}
		}
	}, [t, error, isLoading, loadingMessage]);

	const isError = !!error;
	const errorMessage = isError ? getErrorMessage(error, t) : "";

	return (
		<div className="flex flex-1 w-full h-full items-center justify-center min-h-[200px]">
			<Card className="p-8 flex flex-col items-center min-w-[300px] gap-2">
				{isError ? (
					<>
						<CircleX className="text-red-600 size-8 mb-4" />
						<div className="text-red-600 text-base font-semibold mb-2">
							{t("main:loading.error_occurred")}
						</div>
						<div className="text-base text-center">{errorMessage}</div>
						{errorHomeButton && (
							<Button
								variant="outline"
								className="mt-2"
								onClick={() => router.push("/home")}
							>
								{t("main:loading.go_home")}
							</Button>
						)}
					</>
				) : (
					<>
						<Spinner size={"medium"} />
						<div className="mt-4 text-gray-500 text-base text-center">
							{message}
						</div>
					</>
				)}
			</Card>
		</div>
	);
};
