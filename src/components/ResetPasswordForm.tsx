"use client";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";

const passwordSchema = z
	.object({
		password: z.string().min(1),
		retypePassword: z.string().min(1),
	})
	.refine((data) => data.password === data.retypePassword, {
		message: "Passwords do not match",
		path: ["retypePassword"],
	});

export default function ResetPasswordForm({
	onSubmit,
}: {
	onSubmit: (values: z.infer<typeof passwordSchema>) => void;
}) {
	const { t } = useTranslation("main");
	const form = useForm<z.infer<typeof passwordSchema>>({
		resolver: zodResolver(passwordSchema),
		defaultValues: {
			password: "",
			retypePassword: "",
		},
	});

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
				<h1 className="text-3xl font-bold text-center">
					{t("reset-password.title")}
				</h1>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("reset-password.password")}</FormLabel>
							<FormControl>
								<Input {...field} className="bg-neutral-100" type="password" />
							</FormControl>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="retypePassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								{t("reset-password.retype-password", "Retype password")}
							</FormLabel>
							<FormControl>
								<Input {...field} className="bg-neutral-100" type="password" />
							</FormControl>
							{form.formState.errors.retypePassword && (
								<div className="text-red-500">
									{form.formState.errors.retypePassword.message}
								</div>
							)}
						</FormItem>
					)}
				/>
				{form.formState.errors.root && (
					<div className="text-red-500">
						{form.formState.errors.root.message}
					</div>
				)}
				<div className="flex justify-between items-center">
					<Button type="submit">{t("reset-password.reset-password")}</Button>
					<div className="flex">
						<LanguageSwitcher />
						<ThemeToggle />
					</div>
				</div>
			</form>
		</Form>
	);
}
