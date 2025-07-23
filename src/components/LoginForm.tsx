"use client";

import {
	authCookieLoginMutation,
	resetForgotPasswordMutation,
} from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthState } from "@/lib/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";

const emailPasswordSchema = z.object({
	email: z.string(),
	password: z.string(),
});

export default function LoginForm() {
	const { t } = useTranslation();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [submitEnabled, setSubmitEnabled] = useState(true);
	const auth = useAuthState();
	const form = useForm<z.infer<typeof emailPasswordSchema>>({
		resolver: zodResolver(emailPasswordSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const login = useMutation({
		...authCookieLoginMutation({ credentials: "include" }),
		throwOnError: false,
		onSettled: () => {
			setSubmitEnabled(true);
		},
		onError: (error) => {
			switch (error.detail) {
				case "LOGIN_BAD_CREDENTIALS":
					form.setError("root", {
						type: "value",
						message: t("login.invalid-email-or-password"),
					});
					break;
				default:
					form.setError("root", {
						type: "value",
						message: `An error occurred: ${error.detail}`,
					});
					console.error(error);
			}
		},
		onSuccess: (data) => {
			auth.setAccessToken(data);
			const next = searchParams.get("next") || "/home";
			router.push(next);
		},
	});

	const [forgotMode, setForgotMode] = useState(false);
	const [forgotEmail, setForgotEmail] = useState("");
	const [forgotLoading, setForgotLoading] = useState(false);
	const [forgotError, setForgotError] = useState<string | null>(null);
	const [forgotSuccess, setForgotSuccess] = useState(false);

	function isValidEmail(email: string) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}

	const forgotMutation = useMutation({
		...resetForgotPasswordMutation(),
		onMutate: () => {
			setForgotLoading(true);
			setForgotError(null);
			setForgotSuccess(false);
		},
		onSuccess: () => {
			setForgotLoading(false);
			setForgotSuccess(true);
		},
		onError: (error) => {
			setForgotLoading(false);
			// If error is an object, show a generic error
			setForgotError(
				typeof error === "string"
					? error
					: typeof error?.detail === "string"
						? error.detail
						: "Unknown error",
			);
		},
	});

	function onSubmit(values: z.infer<typeof emailPasswordSchema>) {
		setSubmitEnabled(false);
		login.mutate({
			body: {
				username: values.email,
				password: values.password,
			},
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
				<h1 className="text-3xl font-bold text-center">{t("login.title")}</h1>
				<div className="text-center text-sm mb-2">
					<Button
						type="button"
						className="text-forange cursor-pointer underline p-0 h-auto"
						onClick={() => router.push("/register")}
						variant={"link"}
					>
						{t("login.registerPrompt", "Don't have an account? Register here.")}
					</Button>
				</div>
				{!forgotMode ? (
					<>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("login.email")}</FormLabel>
									<FormControl>
										<Input {...field} className="bg-neutral-100" />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("login.password")}</FormLabel>
									<FormControl>
										<Input
											{...field}
											className="bg-neutral-100"
											type="password"
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						{form.formState.errors.root && (
							<div className="text-red-500">
								{form.formState.errors.root.message}
							</div>
						)}
						<div className="flex justify-between items-center">
							<Button type="submit" disabled={!submitEnabled}>
								{t("login.login")}
							</Button>
							<Button
								type="button"
								variant="outline"
								className="text-sm"
								onClick={() => setForgotMode(true)}
							>
								{t("login.forgotPassword", "Forgot password?")}
							</Button>
							<div className="flex">
								<LanguageSwitcher />
								<ThemeToggle />
							</div>
						</div>
					</>
				) : (
					<>
						<div className="space-y-2">
							<span className="block font-medium">
								{t(
									"login.forgotEmailLabel",
									"Enter your email to reset password",
								)}
							</span>
							<Input
								type="email"
								value={forgotEmail}
								onChange={(e) => {
									setForgotEmail(e.target.value);
									setForgotError(null);
								}}
								disabled={forgotLoading || forgotSuccess}
								className="bg-neutral-100"
								placeholder={t("login.email")}
							/>
							{forgotError && <div className="text-red-500">{forgotError}</div>}
							{forgotSuccess && (
								<div className="text-green-600">
									{t(
										"login.forgotSuccess",
										"If your email exists, a reset link has been sent.",
									)}
								</div>
							)}
						</div>
						<div className="flex justify-between items-center mt-2">
							<Button
								type="button"
								disabled={forgotLoading || !forgotEmail || forgotSuccess}
								onClick={() => {
									setForgotError(null);
									if (!isValidEmail(forgotEmail)) {
										setForgotError(
											t("login.invalidEmailFormat", "Invalid email format"),
										);
										return;
									}
									forgotMutation.mutate({ body: { email: forgotEmail } });
								}}
							>
								{forgotLoading
									? t("login.forgotLoading", "Sending...")
									: t("login.forgotSubmit", "Send reset link")}
							</Button>
							<Button
								type="button"
								variant="link"
								className="text-sm"
								onClick={() => {
									setForgotMode(false);
									setForgotEmail("");
									setForgotError(null);
									setForgotSuccess(false);
								}}
							>
								{t("login.backToLogin", "Back to login")}
							</Button>
						</div>
					</>
				)}
			</form>
		</Form>
	);
}
