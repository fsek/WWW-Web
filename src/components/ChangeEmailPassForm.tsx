import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
	authCookieUpdateEmailMutation,
	authCookieUpdatePasswordMutation,
	getMeQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { getMeOptions } from "@/api/@tanstack/react-query.gen";
import { toast } from "sonner";

export default function ChangeEmailPassForm() {
	const { t } = useTranslation("user-settings");
	const { data: user } = useQuery({
		...getMeOptions(),
		refetchOnWindowFocus: false,
	});

	// Email change form
	const emailSchema = z.object({
		email: z.string().email(t("invalid-email", "Invalid email")),
		current_password: z
			.string()
			.min(1, t("password-required", "Password required")),
	});
	const emailForm = useForm<z.infer<typeof emailSchema>>({
		resolver: zodResolver(emailSchema),
		defaultValues: {
			email: user?.email ?? "",
			current_password: "",
		},
	});

	const queryClient = useQueryClient();

	const emailMutation = useMutation({
		...authCookieUpdateEmailMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getMeQueryKey() });
			toast.success(t("email-change-success", "Email updated successfully"));
			emailForm.reset({ email: user?.email ?? "", current_password: "" });
		},
		onError: (err) => {
			toast.error(
				typeof err?.detail === "string"
					? err.detail
					: t("email-change-error", "Failed to update email"),
			);
		},
	});

	// Password change form
	const passwordSchema = z
		.object({
			current_password: z
				.string()
				.min(1, t("password-required", "Password required")),
			new_password: z
				.string()
				.min(8, t("password-too-short", "Password too short")),
			confirm_new_password: z.string(),
		})
		.refine((data) => data.new_password === data.confirm_new_password, {
			message: t("passwords-dont-match", "Passwords do not match"),
			path: ["confirm_new_password"],
		});

	const passwordForm = useForm<z.infer<typeof passwordSchema>>({
		resolver: zodResolver(passwordSchema),
		defaultValues: {
			current_password: "",
			new_password: "",
			confirm_new_password: "",
		},
	});

	const passwordMutation = useMutation({
		...authCookieUpdatePasswordMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getMeQueryKey() }); // Might as well invalidate the user data
			toast.success(
				t("password-change-success", "Password updated successfully"),
			);
			passwordForm.reset();
			// wait a bit and then redirect to login
			setTimeout(() => {
				window.location.href = "/login?next=/account-settings";
			}, 2000);
		},
		onError: (err) => {
			toast.error(
				typeof err?.detail === "string"
					? err.detail
					: t("password-change-error", "Failed to update password"),
			);
		},
	});

	return (
		<div className="grid gap-8">
			<Card>
				<CardHeader>
					<CardTitle>{t("change-email", "Change Email")}</CardTitle>
				</CardHeader>
				<CardContent>
					<Form {...emailForm}>
						<form
							className="space-y-4"
							onSubmit={emailForm.handleSubmit((values) => {
								if (!user?.email) {
									toast.error(t("no-email", "No email found for user"));
									return;
								}
								emailMutation.mutate({
									credentials: "include",
									body: {
										new_email: values.email,
										username: user.email,
										password: values.current_password,
									},
								});
							})}
						>
							<FormField
								control={emailForm.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("new-email", "New Email")}</FormLabel>
										<FormControl>
											<Input
												type="email"
												{...field}
												value={field.value ?? ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={emailForm.control}
								name="current_password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t("current-password", "Current Password")}
										</FormLabel>
										<FormControl>
											<Input
												type="password"
												{...field}
												value={field.value ?? ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" className="w-fit">
								{t("change-email-btn", "Change Email")}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>{t("change-password", "Change Password")}</CardTitle>
				</CardHeader>
				<CardContent>
					<Form {...passwordForm}>
						<form
							className="space-y-4"
							onSubmit={passwordForm.handleSubmit((values) => {
								if (!user?.email) {
									toast.error(t("no-email", "No email found for user"));
									return;
								}
								passwordMutation.mutate({
									credentials: "include",
									body: {
										username: user.email,
										password: values.current_password,
										new_password: values.new_password,
									},
								});
							})}
						>
							<FormField
								control={passwordForm.control}
								name="current_password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t("current-password", "Current Password")}
										</FormLabel>
										<FormControl>
											<Input
												type="password"
												{...field}
												value={field.value ?? ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={passwordForm.control}
								name="new_password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("new-password", "New Password")}</FormLabel>
										<FormControl>
											<Input
												type="password"
												{...field}
												value={field.value ?? ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={passwordForm.control}
								name="confirm_new_password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t("confirm-new-password", "Confirm New Password")}
										</FormLabel>
										<FormControl>
											<Input
												type="password"
												{...field}
												value={field.value ?? ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" className="w-fit">
								{t("change-password-btn", "Change Password")}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
