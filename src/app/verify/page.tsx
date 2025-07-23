"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
	verifyRequestTokenMutation,
	verifyVerifyMutation,
} from "@/api/@tanstack/react-query.gen";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import mh from "@/assets/mh.jpg";
import Image from "next/image";

export default function VerifyPage() {
	const { t } = useTranslation("main");
	const searchParams = useSearchParams();
	const router = useRouter();

	const token = searchParams.get("token");
	const [status, setStatus] = useState<
		| "idle"
		| "loading"
		| "verify-success"
		| "request-success"
		| "verify-error"
		| "request-error"
	>(token ? "loading" : "idle");

	const [email, setEmail] = useState("");
	const [requestDisabled, setRequestDisabled] = useState(false);

	const triggered = useRef(false);

	const verifyMutation = useMutation({
		...verifyRequestTokenMutation(),
		onSuccess: () => {
			setStatus("request-success");
		},
		onError: () => {
			setStatus("request-error");
		},
	});

	const mutation = useMutation({
		...verifyVerifyMutation(),
		onSuccess: () => {
			console.log("Verification successful");
			setStatus("verify-success");
		},
		onError: () => {
			console.error("Verification failed");
			setStatus("verify-error");
		},
	});

	useEffect(() => {
		if (token && !triggered.current) {
			triggered.current = true;
			mutation.mutate({
				body: { token: token ?? "" },
			});
		}
	}, [token, mutation.mutate]);

	return (
		<div className="relative min-h-screen w-full flex p-4 sm:p-8 items-center justify-center">
			<Image
				className="absolute inset-0 size-full z-0 object-cover"
				src={mh}
				alt="Matematikhuset, LTH"
			/>
			{/* Dark overlay for dark mode */}
			<div className="pointer-events-none absolute inset-0 z-0 dark:bg-black/60" />
			<div className="relative w-full z-10 flex justify-center">
				{!token &&
				status !== "verify-error" &&
				status !== "request-error" &&
				status !== "loading" ? (
					status === "request-success" ? (
						<Card className="w-md mx-auto mt-16">
							<CardHeader className="flex flex-col items-center">
								<CheckCircle2 className="h-8 w-8 text-success mb-2" />
								<span>
									{t(
										"verifyMail.requestSuccess",
										"A verification email has been sent to your address!",
									)}
								</span>
							</CardHeader>
							<CardContent className="flex justify-center">
								<Button onClick={() => router.push("/home")} className="w-full">
									{t("verifyMail.goHome", "Go to Home")}
								</Button>
							</CardContent>
						</Card>
					) : (
						<Card className="w-md mx-auto mt-16">
							<CardHeader className="flex flex-col items-center">
								<span className="text-xl">
									{t(
										"verifyMail.noToken",
										"No verification token provided, assuming you want to get a new email.",
									)}
								</span>
							</CardHeader>
							<CardContent className="flex flex-col items-center space-y-4">
								<input
									type="email"
									placeholder={t(
										"verifyMail.emailPlaceholder",
										"Enter your email",
									)}
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									disabled={requestDisabled}
									className="w-full max-w-md px-3 py-2 border rounded mb-2"
								/>
								<Button
									onClick={() => {
										verifyMutation.mutate({ body: { email } });
										setStatus("loading");
										setRequestDisabled(true);
									}}
									className="w-full max-w-md"
									disabled={requestDisabled || !email}
								>
									{t("verifyMail.requestNew", "Request New Verification Email")}
								</Button>
							</CardContent>
						</Card>
					)
				) : status === "loading" ? (
					<LoadingErrorCard
						isLoading={true}
						loadingMessage={t("verifyMail.loading", "Verifying your email...")}
					/>
				) : status === "verify-error" ? (
					<LoadingErrorCard
						error={t(
							"verifyMail.error",
							"Verification failed. The link may be invalid or expired.",
						)}
						isLoading={false}
					/>
				) : status === "request-error" ? (
					<LoadingErrorCard
						error={t(
							"verifyMail.requestError",
							"Failed to send verification email. Please check your email address and try again.",
						)}
						isLoading={false}
					/>
				) : status === "verify-success" ? (
					<Card className="w-md mx-auto mt-16">
						<CardHeader className="flex flex-col items-center">
							<CheckCircle2 className="h-8 w-8 text-success mb-2" />
							<span>
								{t(
									"verifyMail.success",
									"Your email has been verified successfully!",
								)}
							</span>
						</CardHeader>
						<CardContent className="flex justify-center">
							<Button onClick={() => router.push("/home")} className="w-full">
								{t("verifyMail.goHome", "Go to Home")}
							</Button>
						</CardContent>
					</Card>
				) : null}
			</div>
		</div>
	);
}
