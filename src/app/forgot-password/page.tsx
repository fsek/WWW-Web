"use client";

import ResetPasswordForm from "@/components/ResetPasswordForm";
import mh from "@/assets/mh.jpg";
import Image from "next/image";
import FLogga from "@/assets/f-logga";
import { useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { resetResetPasswordMutation } from "@/api/@tanstack/react-query.gen";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
	const { t } = useTranslation("main");
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const [status, setStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>(token ? "idle" : "error");
	const formContainerRef = useRef<HTMLDivElement>(null);

	const mutation = useMutation({
		...resetResetPasswordMutation(),
		throwOnError: false,
		onMutate: () => {
			setStatus("loading");
		},
		onError: () => {
			setStatus("error");
		},
		onSuccess: () => {
			setStatus("success");
		},
	});

	let innerCard: JSX.Element;
	if (!token || status === "error") {
		innerCard = (
			<LoadingErrorCard
				error={
					!token
						? t(
								"reset-password.invalid-reset-token",
								"No reset token found in the link.",
							)
						: t("reset-password.reset-error")
				}
				isLoading={false}
				errorHomeButton
			/>
		);
	} else if (status === "loading") {
		innerCard = (
			<LoadingErrorCard
				isLoading
				loadingMessage={t(
					"reset-password.resetting",
					"Resetting your password...",
				)}
			/>
		);
	} else if (status === "success") {
		innerCard = (
			<Card className="w-md mx-auto">
				<CardHeader className="flex flex-col items-center">
					<CheckCircle2 className="h-8 w-8 text-success mb-2" />
					<span>
						{t(
							"reset-password.reset-success",
							"Your password has been reset successfully!",
						)}
					</span>
				</CardHeader>
				<CardContent className="flex justify-center">
					<Button onClick={() => router.push("/")} className="w-full">
						{t("reset-password.goHome", "Go to Home")}
					</Button>
				</CardContent>
			</Card>
		);
	} else {
		innerCard = (
			<div
				className="relative max-w-md bg-neutral-50/75 dark:bg-neutral-800/75 backdrop-blur-md p-4 rounded-lg shadow-xs border w-full z-10 space-y-10 flex flex-col items-center"
				ref={formContainerRef}
			>
				<FLogga className="size-25" />
				<ResetPasswordForm
					onSubmit={(vals: { password: string }) =>
						mutation.mutate({ body: { token, password: vals.password } })
					}
				/>
			</div>
		);
	}

	return (
		<div className="relative min-h-screen w-full flex p-4 sm:p-8 items-center justify-center">
			<Image
				className="absolute inset-0 size-full z-0 object-cover"
				src={mh}
				alt="Matematikhuset, LTH"
				fill
			/>
			<div className="pointer-events-none absolute inset-0 z-0 dark:bg-black/60" />
			<div className="relative w-full z-10 flex justify-center">
				{innerCard}
			</div>
		</div>
	);
}
