"use client";

import { authJwtLoginMutation } from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { handleBearerResponse } from "@/lib/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const emailPasswordSchema = z.object({
	email: z.string(),
	password: z.string(),
});

export default function LoginForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [submitEnabled, setSubmitEnabled] = useState(true);
	const form = useForm<z.infer<typeof emailPasswordSchema>>({
		resolver: zodResolver(emailPasswordSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const login = useMutation({
		...authJwtLoginMutation(),
		throwOnError: false,
		onSettled: () => {
			setSubmitEnabled(true);
		},
		onError: (error) => {
			switch (error.detail) {
				case "LOGIN_BAD_CREDENTIALS":
					form.setError("root", {
						type: "value",
						message: "Invalid email or password",
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
			handleBearerResponse(data);
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
		<div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input {...field} type="password" />
								</FormControl>
							</FormItem>
						)}
					/>
					{form.formState.errors.root && (
						<div className="text-red-500">
							{form.formState.errors.root.message}
						</div>
					)}
					<Button type="submit" disabled={!submitEnabled}>
						Log in
					</Button>
				</form>
			</Form>
		</div>
	);
}
