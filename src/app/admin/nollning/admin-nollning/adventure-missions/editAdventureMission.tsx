import type { AdventureMissionRead } from "@/api";
import {
	deleteAdventureMissionMutation,
	editAdventureMissionMutation,
	getNollningByYearQueryKey,
	getNollningQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogClose,
	DialogHeader,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const AdventureMissionSchema = z.object({
	title_sv: z.string().min(2),
	title_en: z.string().min(2),
	description_sv: z.string().min(2),
	description_en: z.string().min(2),
	max_points: z.number().min(1),
	min_points: z.number().min(0),
	nollning_week: z.number().min(0).max(4),
});

interface Props {
	open: boolean;
	onClose: () => void;
	selectedMission: AdventureMissionRead;
	nollning_id: number;
}

const EditAdventureMission = ({
	open,
	onClose,
	selectedMission,
	nollning_id,
}: Props) => {
	const { t } = useTranslation("admin");
	const form = useForm<z.infer<typeof AdventureMissionSchema>>({
		resolver: zodResolver(AdventureMissionSchema),
		defaultValues: {
			title_sv: "",
			title_en: "",
			description_sv: "",
			description_en: "",
			max_points: 1,
			min_points: 0,
			nollning_week: 0,
		},
	});

	useEffect(() => {
		if (open && selectedMission) {
			form.reset({
				...selectedMission,
			});
		}
	}, [selectedMission, form, open]);

	const queryClient = useQueryClient();

	const updateAdventureMission = useMutation({
		...editAdventureMissionMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getNollningQueryKey({
					path: { nollning_id: nollning_id },
				}),
			});
			queryClient.invalidateQueries({
				queryKey: getNollningByYearQueryKey({
					path: { year: new Date().getFullYear() },
				}),
			});
			toast.success(t("nollning.missions.edit_success"));
		},
		onError: () => {
			toast.error(t("nollning.missions.edit_error"));
			onClose();
		},
	});

	const removeAdventureMission = useMutation({
		...deleteAdventureMissionMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getNollningQueryKey({
					path: { nollning_id: nollning_id },
				}),
			});
			queryClient.invalidateQueries({
				queryKey: getNollningByYearQueryKey({
					path: { year: new Date().getFullYear() },
				}),
			});
			toast.success(t("nollning.missions.delete_success"));
		},
		onError: () => {
			toast.error(t("nollning.missions.delete_error"));
			onClose();
		},
	});

	function onSubmit(values: z.infer<typeof AdventureMissionSchema>) {
		updateAdventureMission.mutate(
			{
				path: { mission_id: selectedMission.id },
				body: {
					title_sv: values.title_sv,
					title_en: values.title_en,
					description_sv: values.description_sv,
					description_en: values.description_en,
					max_points: values.max_points,
					min_points: values.min_points,
					nollning_week: values.nollning_week,
				},
			},
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	function onDelete() {
		removeAdventureMission.mutate(
			{
				path: { mission_id: selectedMission.id },
				query: { nollning_id: nollning_id },
			},
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(open) => {
				if (!open) {
					onClose();
				}
			}}
		>
			<DialogContent className="min-w-fit lg:max-w-7xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{t("nollning.missions.edit_title")}</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit, (error) =>
							console.log(error),
						)}
						className="w-full"
					>
						<div className="px-8 space-x-4 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
							<FormField
								control={form.control}
								name={"title_sv"}
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("nollning.missions.title_sv")}</FormLabel>
										<FormControl>
											<Input
												placeholder={t("nollning.missions.title_placeholder")}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name={"title_en"}
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("nollning.missions.title_en")}</FormLabel>
										<FormControl>
											<Input
												placeholder={t("nollning.missions.title_placeholder")}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name={"description_sv"}
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t("nollning.missions.description_sv")}
										</FormLabel>
										<FormControl>
											<textarea
												className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
												placeholder={t(
													"nollning.missions.description_placeholder",
												)}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name={"description_en"}
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t("nollning.missions.description_en")}
										</FormLabel>
										<FormControl>
											<textarea
												className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
												placeholder={t(
													"nollning.missions.description_placeholder",
												)}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name={"min_points"}
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("nollning.missions.min_points")}</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="0"
												value={
													typeof field.value === "number" &&
													!Number.isNaN(field.value)
														? field.value
														: ""
												}
												onChange={(e) => field.onChange(e.target.valueAsNumber)}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name={"max_points"}
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("nollning.missions.max_points")}</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="1"
												value={
													typeof field.value === "number" &&
													!Number.isNaN(field.value)
														? field.value
														: ""
												}
												onChange={(e) => field.onChange(e.target.valueAsNumber)}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name={"nollning_week"}
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("nollning.missions.week")}</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="0"
												value={
													typeof field.value === "number" &&
													!Number.isNaN(field.value)
														? field.value
														: ""
												}
												onChange={(e) => field.onChange(e.target.valueAsNumber)}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</div>
						<div className="flex flex-row justify-end space-x-2 mt-4">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								className="w-32 min-w-fit"
							>
								{t("nollning.missions.cancel")}
							</Button>
							<Button type="submit" className="w-32 min-w-fit">
								{t("nollning.missions.save")}
							</Button>
							<Button
								variant="destructive"
								type="button"
								className="w-32 min-w-fit"
								onClick={onDelete}
							>
								{t("nollning.missions.delete")}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default EditAdventureMission;
