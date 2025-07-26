"use client";

import mh from "@/assets/mh.jpg";
import Image from "next/image";
import FLogga from "@/assets/f-logga";
import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
	registerRegisterMutation,
	verifyRequestTokenMutation,
} from "@/api/@tanstack/react-query.gen";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";

type Status = "idle" | "loading" | "success" | "error" | "password-mismatch";

export default function RegistrationPage() {
	const ref = useRef<HTMLDivElement>(null);
	const { t } = useTranslation("main");
	const router = useRouter();

	const registrationSchema = z
		.object({
			email: z.string().email({
				message: t("register.emailInvalid", "Invalid email address"),
			}),
			password: z.string().min(8, {
				message: t(
					"register.passwordShort",
					"Password must be at least 8 characters",
				),
			}),
			confirmPassword: z.string(),
			first_name: z.string().min(1, {
				message: t("register.firstNameRequired", "First name required"),
			}),
			last_name: z.string().min(1, {
				message: t("register.lastNameRequired", "Last name required"),
			}),
			telephone_number: z.string().min(1, {
				message: t(
					"register.telephoneNumberRequired",
					"Telephone number required",
				),
			}),
			start_year: z
				.string()
				.optional()
				.refine(
					(val) => {
						if (!val) return true; // Optional field
						const year = Number(val);
						const currentYear = new Date().getFullYear();
						return year >= 1960 && year <= currentYear;
					},
					{
						message: t(
							"register.startYearInvalid",
							"Start year must be between 1960 and the current year",
						),
					},
				),
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: t(
				"register.passwordMismatch",
				"Passwords do not match. Please try again.",
			),
			path: ["confirmPassword"],
		});

	const [status, setStatus] = useState<Status>("idle");
	const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

	const form = useForm<z.infer<typeof registrationSchema>>({
		resolver: zodResolver(registrationSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
			first_name: "",
			last_name: "",
			telephone_number: "",
			start_year: "",
		},
	});

	const verifyMutation = useMutation({
		...verifyRequestTokenMutation(),
		onMutate: () => {
			setStatus("loading");
			setErrorMsg(undefined);
		},
		onSuccess: () => {
			setStatus("success");
		},
		onError: (err) => {
			setStatus("error");
			setErrorMsg(
				typeof err.detail === "string"
					? err.detail
					: t(
							"register.verifyError",
							"Registered user, but failed to send verification email. Please try again later.",
						),
			);
		},
	});

	const registerMutation = useMutation({
		...registerRegisterMutation(),
		onMutate: () => {
			setStatus("loading");
			setErrorMsg(undefined);
		},
		onSuccess: () => {
			// Try sending a verification email too
			verifyMutation.mutate({
				body: { email: form.getValues("email") },
			});
		},
		onError: (err) => {
			setStatus("error");
			setErrorMsg(
				typeof err.detail === "string"
					? err.detail
					: t(
							"register.error",
							"Registration failed. Please check your details and try again.",
						),
			);
		},
	});

	const handleSubmit = (values: z.infer<typeof registrationSchema>) => {
		setStatus("loading");
		registerMutation.mutate({
			body: {
				email: values.email,
				password: values.password,
				first_name: values.first_name,
				last_name: values.last_name,
				telephone_number: values.telephone_number,
				start_year: values.start_year ? Number(values.start_year) : undefined,
			},
		});
	};

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
				{status === "loading" ? (
					<LoadingErrorCard
						loadingMessage={t("register.loading", "Registering...")}
					/>
				) : status === "error" ? (
					<LoadingErrorCard error={errorMsg || "Unknown error occurred"} />
				) : (
					<div
						className="relative max-w-md bg-neutral-50/75 dark:bg-neutral-800/75 backdrop-blur-md p-4 rounded-lg shadow-xs border w-full z-10 space-y-10 flex flex-col items-center"
						ref={ref}
					>
						<FLogga className="size-25" />
						<div className="text-2xl font-bold text-center mb-0">
							{t("register.title", "Register for an Account")}
						</div>
						{status === "success" ? (
							<Card className="w-full">
								<CardHeader className="flex flex-col items-center">
									<CheckCircle2 className="h-8 w-8 text-success mb-2" />
									<span>
										{t(
											"register.success",
											"Registration successful! Please check your email to verify your account.",
										)}
									</span>
								</CardHeader>
								<CardContent className="flex justify-center">
									<Button
										onClick={() => router.push("/login?next=/home")}
										className="w-full"
									>
										{t("register.goLogin", "Go to Login")}
									</Button>
								</CardContent>
							</Card>
						) : (
							<Form {...form}>
								<form
									className="w-full space-y-4"
									onSubmit={form.handleSubmit(handleSubmit)}
									noValidate
								>
									<div className="text-center text-sm mb-7">
										<Button
											type="button"
											variant="link"
											className="text-forange p-0 h-auto"
											onClick={() => router.push("/login")}
										>
											{t(
												"register.loginPrompt",
												"Already have an account? Login here.",
											)}
										</Button>
									</div>
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input
														type="email"
														placeholder={t("register.email", "Email")}
														className="bg-background"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input
														type="password"
														placeholder={t("register.password", "Password")}
														className="bg-background"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="confirmPassword"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input
														type="password"
														placeholder={t(
															"register.confirmPassword",
															"Confirm Password",
														)}
														className="bg-background"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="first_name"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input
														type="text"
														placeholder={t("register.firstName", "First Name")}
														className="bg-background"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="last_name"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input
														type="text"
														placeholder={t("register.lastName", "Last Name")}
														className="bg-background"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="telephone_number"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input
														type="tel"
														placeholder={t(
															"register.telephone",
															"Telephone Number",
														)}
														className="bg-background"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="start_year"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input
														type="number"
														placeholder={t(
															"register.startYear",
															"Start Year (optional)",
														)}
														min={1960}
														max={new Date().getFullYear()}
														className="bg-background"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<div className="flex flex-row gap-2 justify-between">
										<Button type="submit" className="w-fit">
											{t("register.submit", "Register")}
										</Button>
										<div className="flex items-center gap-2">
											<LanguageSwitcher />
											<ThemeToggle />
										</div>
									</div>
								</form>
							</Form>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
