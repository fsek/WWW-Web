"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit3, Save, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
	getMeOptions,
	updateSelfMutation,
} from "@/api/@tanstack/react-query.gen";
import { program } from "@/api";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { parsePhoneNumberWithError } from "libphonenumber-js";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ChangeEmailPassForm from "@/components/ChangeEmailPassForm";

const FOOD_PREFERENCES = [
	"Vegetarian",
	"Vegan",
	"Pescetarian",
	"Mjölkallergi",
	"Gluten",
];

const PROGRAMS = [
	{ value: "F", label: "F" },
	{ value: "Pi", label: "Pi" },
	{ value: "N", label: "N" },
];

export default function AccountSettingsPage() {
	const { t } = useTranslation("user-settings");
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const accountSchema = z.object({
		first_name: z.string().min(1, t("first-name-required")),
		last_name: z.string().min(1, t("last-name-required")),
		start_year: z
			.number({ invalid_type_error: t("invalid-year") })
			.min(1960, t("invalid-year"))
			.max(new Date().getFullYear(), t("invalid-year")),
		telephone_number: z.string().min(1, t("phone-required")),
		program: z.enum(Object.values(program) as [program]).optional(),
		notifications: z.boolean().optional(),
		stil_id: z.string().optional(),
		standard_food_preferences: z.array(z.string()).optional(),
		other_food_preferences: z.string().optional(),
	});

	// initialize the form and keep the entire form methods object
	const form = useForm<z.infer<typeof accountSchema>>({
		resolver: zodResolver(accountSchema),
		defaultValues: {
			first_name: "",
			last_name: "",
			start_year: undefined,
			telephone_number: "",
			program: undefined,
			notifications: false,
			stil_id: "",
			standard_food_preferences: [],
			other_food_preferences: "",
		},
	});
	const {
		control,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors },
	} = form;

	const {
		data: user,
		isLoading,
		error,
		refetch,
	} = useQuery({
		...getMeOptions(),
		refetchOnWindowFocus: false,
	});

	const mutation = useMutation({
		...updateSelfMutation(),
		onSuccess: async () => {
			await refetch();
			setIsEditing(false);
			toast.success(t("user-settings:update-success"));
		},
		onError: (error) => {
			toast.error(
				typeof error === "string"
					? error
					: error instanceof Error
						? error.message
						: t("user-settings:update-error"),
			);
		},
		onSettled: () => setIsSaving(false),
	});

	const onSubmit = (data: z.infer<typeof accountSchema>) => {
		setIsSaving(true);
		mutation.mutate({
			body: {
				...data,
				start_year: Number(data.start_year),
				standard_food_preferences: data.standard_food_preferences ?? null,
				other_food_preferences: data.other_food_preferences ?? null,
			},
		});
	};

	const handleCancel = () => {
		if (user) {
			reset({
				first_name: user.first_name ?? "",
				last_name: user.last_name ?? "",
				start_year: user.start_year ?? undefined,
				telephone_number: user.telephone_number ?? "",
				program: (user.program as program) ?? undefined,
				notifications: user.want_notifications ?? false,
				stil_id: user.stil_id ?? "",
				standard_food_preferences: user.standard_food_preferences || [],
				other_food_preferences: user.other_food_preferences ?? "",
			});
		}
		setIsEditing(false);
	};

	useEffect(() => {
		if (isEditing && user) {
			reset({
				first_name: user.first_name ?? "",
				last_name: user.last_name ?? "",
				start_year: user.start_year ?? undefined,
				telephone_number:
					parsePhoneNumberWithError(
						user.telephone_number,
					).formatInternational() ??
					user.telephone_number ??
					"",
				program: (user.program as program) ?? "",
				notifications: user.want_notifications ?? false,
				stil_id: user.stil_id ?? "",
				standard_food_preferences: user.standard_food_preferences || [],
				other_food_preferences: user.other_food_preferences ?? "",
			});
		}
	}, [isEditing, user, reset]);

	if (isLoading || error) {
		return (
			<LoadingErrorCard
				isLoading={isLoading}
				error={error || undefined}
				loadingMessage={t("main:loading.basic")}
			/>
		);
	}

	if (!user) {
		return <LoadingErrorCard error={"Failed to load user data"} />;
	}

	return (
		<div className="container mx-auto p-6 max-w-4xl">
			<Tabs defaultValue="profile" className="w-full">
				<TabsList className="mb-6">
					<TabsTrigger value="profile">{t("settings")}</TabsTrigger>
					<TabsTrigger value="security">
						{t("change-email-password", "Change Email/Password")}
					</TabsTrigger>
				</TabsList>
				<TabsContent value="profile">
					<div className="flex justify-between items-center mb-6">
						<h1 className="text-3xl font-bold">{t("settings")}</h1>
						{!isEditing ? (
							<Button onClick={() => setIsEditing(true)} variant="outline">
								<Edit3 className="w-4 h-4 mr-2" />
								{t("edit-profile")}
							</Button>
						) : (
							<div className="space-x-2">
								<Button onClick={handleSubmit(onSubmit)} disabled={isSaving}>
									<Save className="w-4 h-4 mr-2" />
									{isSaving ? t("saving") : t("save")}
								</Button>
								<Button
									onClick={handleCancel}
									variant="outline"
									disabled={isSaving}
								>
									<X className="w-4 h-4 mr-2" />
									{t("cancel")}
								</Button>
							</div>
						)}
					</div>

					<Form {...form}>
						<div className="grid gap-6">
							<Card>
								<CardHeader>
									<CardTitle>{t("personal-info")}</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<FormField
											control={control}
											name="first_name"
											render={({ field }) => (
												<FormItem>
													<FormLabel>{t("first-name")}</FormLabel>
													{isEditing ? (
														<FormControl>
															<Input
																{...field}
																value={field.value ?? ""}
																className={
																	errors.first_name ? "border-destructive" : ""
																}
															/>
														</FormControl>
													) : (
														<p className="text-sm font-medium mt-1">
															{user.first_name}
														</p>
													)}
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={control}
											name="last_name"
											render={({ field }) => (
												<FormItem>
													<FormLabel>{t("last-name")}</FormLabel>
													{isEditing ? (
														<FormControl>
															<Input
																{...field}
																value={field.value ?? ""}
																className={
																	errors.last_name ? "border-destructive" : ""
																}
															/>
														</FormControl>
													) : (
														<p className="text-sm font-medium mt-1">
															{user.last_name}
														</p>
													)}
													<FormMessage />
												</FormItem>
											)}
										/>
										{/* Telephone number field */}
										<FormField
											control={control}
											name="telephone_number"
											render={({ field }) => (
												<FormItem>
													<FormLabel>{t("phone")}</FormLabel>
													{isEditing ? (
														<FormControl>
															<Input
																type="tel"
																{...field}
																value={field.value ?? ""}
																placeholder={t("phone")}
																className={
																	errors.telephone_number
																		? "border-destructive"
																		: ""
																}
															/>
														</FormControl>
													) : (
														<p className="text-sm font-medium mt-1">
															{(parsePhoneNumberWithError(
																user.telephone_number,
															).formatNational() ??
																user.telephone_number) ||
																t("not-provided")}
														</p>
													)}
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<div>
										<Label>{t("email")}</Label>
										<p className="text-sm font-medium mt-1">{user.email}</p>
									</div>

									<div className="flex items-center gap-4">
										<span className="text-sm font-medium">
											{t("verified-status")}:
										</span>
										<Badge variant={user.is_verified ? "default" : "secondary"}>
											{user.is_verified ? t("verified") : t("not-verified")}
										</Badge>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<FormField
											control={control}
											name="start_year"
											render={({ field }) => (
												<FormItem>
													<FormLabel>{t("start-year")}</FormLabel>
													{isEditing ? (
														<FormControl>
															<Input
																type="number"
																{...field}
																value={field.value ?? ""}
																onChange={(e) => {
																	const val = e.target.value;
																	field.onChange(
																		val === "" ? undefined : Number(val),
																	);
																}}
																className={
																	errors.start_year ? "border-destructive" : ""
																}
															/>
														</FormControl>
													) : (
														<p className="text-sm font-medium mt-1">
															{user.start_year}
														</p>
													)}
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={control}
											name="program"
											render={({ field }) => (
												<FormItem>
													<FormLabel>{t("program")}</FormLabel>
													{isEditing ? (
														<Select
															onValueChange={(value) => field.onChange(value)}
															defaultValue={user.program || ""}
														>
															<SelectTrigger>
																<SelectValue
																	placeholder={t("select-program")}
																/>
															</SelectTrigger>
															<SelectContent>
																{PROGRAMS.map((program) => (
																	<SelectItem
																		key={program.value}
																		value={program.value}
																	>
																		{program.label}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													) : (
														<p className="text-sm font-medium mt-1">
															{user.program || t("not-specified")}
														</p>
													)}
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<FormField
										control={control}
										name="stil_id"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("stil-id")}</FormLabel>
												{isEditing ? (
													<>
														<FormControl>
															<Input
																{...field}
																value={field.value ?? ""}
																placeholder={t("optional")}
															/>
														</FormControl>
														<span className="text-sm text-muted-foreground">
															{t("stil-id_subtitle")}
														</span>
													</>
												) : (
													<p className="text-sm font-medium mt-1">
														{user.stil_id || t("not-provided")}
													</p>
												)}
												<FormMessage />
											</FormItem>
										)}
									/>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>{t("preferences")}</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<FormField
										control={control}
										name="notifications"
										render={({ field }) => (
											<FormItem>
												<FormLabel htmlFor="notifications">
													{t("email-notifications")}
												</FormLabel>
												{isEditing ? (
													<FormControl>
														<Checkbox
															id="notifications"
															checked={!!field.value}
															onCheckedChange={(checked) =>
																field.onChange(!!checked)
															}
														/>
													</FormControl>
												) : (
													<Badge
														variant={
															user.want_notifications ? "default" : "secondary"
														}
													>
														{user.want_notifications
															? t("enabled")
															: t("disabled")}
													</Badge>
												)}
												<FormMessage />
											</FormItem>
										)}
									/>

									<Separator />

									<FormField
										control={control}
										name="standard_food_preferences"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("food-preferences")}</FormLabel>
												{isEditing ? (
													<div className="mt-2 space-y-2">
														{FOOD_PREFERENCES.map((pref) => (
															<div
																key={pref}
																className="flex items-center space-x-2"
															>
																<Checkbox
																	id={pref}
																	checked={field.value?.includes(pref)}
																	onCheckedChange={(checked) => {
																		const current = field.value || [];
																		if (checked) {
																			field.onChange([...current, pref]);
																		} else {
																			field.onChange(
																				current.filter(
																					(p: string) => p !== pref,
																				),
																			);
																		}
																	}}
																/>
																<Label htmlFor={pref} className="capitalize">
																	{pref}
																</Label>
															</div>
														))}
													</div>
												) : (
													<div className="mt-2 space-y-1">
														{user.standard_food_preferences &&
														user.standard_food_preferences.length > 0 ? (
															<div className="flex flex-wrap gap-2">
																{user.standard_food_preferences.map((pref) => (
																	<Badge
																		key={pref}
																		variant="outline"
																		className="capitalize"
																	>
																		{pref}
																	</Badge>
																))}
															</div>
														) : (
															<p className="text-sm text-muted-foreground">
																{t("no-food-preferences")}
															</p>
														)}
													</div>
												)}
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={control}
										name="other_food_preferences"
										render={({ field }) => (
											<FormItem>
												<FormLabel htmlFor="other_food_preferences">
													{t("other-food-preferences")}
												</FormLabel>
												{isEditing ? (
													<FormControl>
														<Textarea
															id="other_food_preferences"
															{...field}
															value={field.value ?? ""}
															placeholder={t(
																"other-food-preferences-placeholder",
															)}
															className="mt-1"
														/>
													</FormControl>
												) : (
													<p className="text-sm font-medium mt-1">
														{user.other_food_preferences || t("none-specified")}
													</p>
												)}
												<FormMessage />
											</FormItem>
										)}
									/>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>{t("account-info")}</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									<div className="flex justify-between">
										<span className="text-sm font-medium">
											{t("member-status")}:
										</span>
										<Badge variant={user.is_member ? "default" : "secondary"}>
											{user.is_member ? t("member") : t("not-member")}
										</Badge>
									</div>
									<div className="flex justify-between">
										<span className="text-sm font-medium">
											{t("account-created")}:
										</span>
										<span className="text-sm">
											{new Date(user.account_created).toLocaleDateString("sv")}
										</span>
									</div>
								</CardContent>
							</Card>
						</div>
					</Form>
					<Toaster position="top-center" richColors />
				</TabsContent>
				<TabsContent value="security">
					<ChangeEmailPassForm />
				</TabsContent>
			</Tabs>
			<Toaster position="top-center" richColors />
		</div>
	);
}
