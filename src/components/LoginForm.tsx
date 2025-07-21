"use client";

import { authCookieLoginMutation } from "@/api/@tanstack/react-query.gen";
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
			const next = searchParams.get("next") || "/";
			router.push(next);
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
								<Input {...field} className="bg-neutral-100" type="password" />
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
					<div className="flex">
						<LanguageSwitcher />
						<ThemeToggle />
					</div>
				</div>
			</form>
		</Form>
	);
}
