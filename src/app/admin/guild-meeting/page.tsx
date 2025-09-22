"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	updateGuildMeetingMutation,
	getGuildMeetingOptions,
	getGuildMeetingQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { GuildMeetingUpdate } from "@/api";

const formSchema = z.object({
	title_sv: z.string().optional(),
	title_en: z.string().optional(),
	date_description_sv: z.string().optional(),
	date_description_en: z.string().optional(),
	description_sv: z.string().optional(),
	description_en: z.string().optional(),
	is_active: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function GuildMeetingAdminPage() {
	const queryClient = useQueryClient();
	const { t } = useTranslation("admin");

	const { data, isLoading, isError, error } = useQuery({
		...getGuildMeetingOptions(),
	});

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: useMemo(
			() => ({
				title_sv: "",
				title_en: "",
				date_description_sv: "",
				date_description_en: "",
				description_sv: "",
				description_en: "",
				is_active: false,
			}),
			[],
		),
	});

	useEffect(() => {
		if (data) {
			form.reset({
				title_sv: data.title_sv ?? "",
				title_en: data.title_en ?? "",
				date_description_sv: data.date_description_sv ?? "",
				date_description_en: data.date_description_en ?? "",
				description_sv: data.description_sv ?? "",
				description_en: data.description_en ?? "",
				is_active: data.is_active ?? false,
			});
		}
	}, [data, form]);

	const updateGuildMeeting = useMutation({
		...updateGuildMeetingMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getGuildMeetingQueryKey() });

			toast.success(t("guild_meeting.update_success"));
		},
		onError: () => {
			toast.error(t("guild_meeting.update_failed"));
		},
	});

	function normalize(values: FormValues): GuildMeetingUpdate {
		const toNull = (s?: string) =>
			s === undefined ? undefined : s.trim() === "" ? null : s;
		return {
			title_sv: toNull(values.title_sv),
			title_en: toNull(values.title_en),
			date_description_sv: toNull(values.date_description_sv),
			date_description_en: toNull(values.date_description_en),
			description_sv: toNull(values.description_sv),
			description_en: toNull(values.description_en),
			is_active: values.is_active,
		};
	}

	function onSubmit(values: FormValues) {
		updateGuildMeeting.mutate({
			body: normalize(values),
		});
	}

	if (isLoading) {
		return <LoadingErrorCard />;
	}

	if (isError) {
		return <LoadingErrorCard error={error} />;
	}

	return (
		<div className="p-6 max-w-5xl">
			<h1 className="text-2xl font-semibold mb-4">
				{t("guild_meeting.edit_title")}
			</h1>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="grid gap-4 md:grid-cols-2"
				>
					<FormField
						control={form.control}
						name="title_sv"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("guild_meeting.title_sv_label")}</FormLabel>
								<FormControl>
									<Input
										placeholder={t("guild_meeting.title_sv_placeholder")}
										{...field}
										value={field.value ?? ""}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="title_en"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("guild_meeting.title_en_label")}</FormLabel>
								<FormControl>
									<Input
										placeholder={t("guild_meeting.title_en_placeholder")}
										{...field}
										value={field.value ?? ""}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="date_description_sv"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									{t("guild_meeting.date_description_sv_label")}
								</FormLabel>
								<FormControl>
									<Textarea
										className="h-24"
										placeholder={t(
											"guild_meeting.date_description_sv_placeholder",
										)}
										{...field}
										value={field.value ?? ""}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="date_description_en"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									{t("guild_meeting.date_description_en_label")}
								</FormLabel>
								<FormControl>
									<Textarea
										className="h-24"
										placeholder={t(
											"guild_meeting.date_description_en_placeholder",
										)}
										{...field}
										value={field.value ?? ""}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="description_sv"
						render={({ field }) => (
							<FormItem className="md:col-span-1">
								<FormLabel>{t("guild_meeting.description_sv_label")}</FormLabel>
								<FormControl>
									<Textarea
										className="h-48"
										placeholder={t("guild_meeting.description_sv_placeholder")}
										{...field}
										value={field.value ?? ""}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="description_en"
						render={({ field }) => (
							<FormItem className="md:col-span-1">
								<FormLabel>{t("guild_meeting.description_en_label")}</FormLabel>
								<FormControl>
									<Textarea
										className="h-48"
										placeholder={t("guild_meeting.description_en_placeholder")}
										{...field}
										value={field.value ?? ""}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					{/* is active */}
					<FormField
						control={form.control}
						name="is_active"
						render={({ field }) => (
							<FormItem className="text-center w-full">
								<Label className="hover:bg-accent/50 flex gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-muted-foreground has-[[aria-checked=true]]:bg-accent">
									<Checkbox
										checked={field.value}
										onCheckedChange={field.onChange}
										className="data-[state=checked]:border-[var(--wavelength-612-color-light)] data-[state=checked]:bg-[var(--wavelength-612-color-light)] data-[state=checked]:text-white"
									/>
									<div className="grid gap-1.5 font-normal">
										<p className="text-sm leading-none font-medium">
											{t("guild_meeting.is_active_label")}
										</p>
									</div>
								</Label>
							</FormItem>
						)}
					/>

					<div className="md:col-span-2 flex gap-2 items-center">
						<Button
							type="button"
							variant="outline"
							onClick={() =>
								form.reset({
									title_sv: data?.title_sv ?? "",
									title_en: data?.title_en ?? "",
									date_description_sv: data?.date_description_sv ?? "",
									date_description_en: data?.date_description_en ?? "",
									description_sv: data?.description_sv ?? "",
									description_en: data?.description_en ?? "",
								})
							}
						>
							{t("guild_meeting.reset")}
						</Button>
						<Button
							type="submit"
							disabled={updateGuildMeeting.isPending}
							className="min-w-28"
						>
							<Save className="mr-1" />
							{t("guild_meeting.save")}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
