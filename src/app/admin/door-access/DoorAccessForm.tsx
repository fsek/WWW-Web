import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	postUserAccessMutation,
	getAllUserAccessesQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import { toast } from "sonner";
import { door } from "@/api";

const doorAccessSchema = z.object({
	user_id: z.number().min(1, "User ID is required"),
	door: z.nativeEnum(door),
	starttime: z.date().nullable(),
	endtime: z.date().nullable(),
});

export default function DoorAccessForm() {
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);
	const doorAccessForm = useForm<z.infer<typeof doorAccessSchema>>({
		resolver: zodResolver(doorAccessSchema),
		defaultValues: {
			starttime: new Date(),
			endtime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days
			user_id: undefined,
			door: undefined,
		},
	});
	const { t } = useTranslation("admin");

	const createAccess = useMutation({
		...postUserAccessMutation(),
		throwOnError: false,
		onSuccess: () => {
			toast.success(t("door_access.success_add", "Dörråtkomst har lagts till"));
			queryClient.invalidateQueries({ queryKey: getAllUserAccessesQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
		},
		onError: (error) => {
			toast.error(
				t("door_access.error_add", {
					defaultValue: "Det gick inte att lägga till dörråtkomst",
					error: error?.detail ?? "Unknown error",
				}),
			);
			setSubmitEnabled(true);
		},
	});

	const queryClient = useQueryClient();

	function onSubmit(values: z.infer<typeof doorAccessSchema>) {
		setSubmitEnabled(false);
		createAccess.mutate({
			body: {
				user_id: values.user_id,
				door: values.door,
				starttime: values.starttime,
				endtime: values.endtime,
			},
		});
	}

	return (
		<div className="p-3">
			<Button
				onClick={() => {
					doorAccessForm.reset();
					setOpen(true);
					setSubmitEnabled(true);
				}}
			>
				<Plus />
				{t("door_access.create_access", "Lägg till dörråtkomst")}
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl">
					<DialogHeader>
						<DialogTitle>
							{t("door_access.create_access", "Lägg till dörråtkomst")}
						</DialogTitle>
					</DialogHeader>
					<hr />
					<Form {...doorAccessForm}>
						<form
							onSubmit={doorAccessForm.handleSubmit(onSubmit)}
							className="grid gap-x-4 gap-y-3 lg:grid-cols-2"
						>
							<FormField
								control={doorAccessForm.control}
								name="user_id"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t("door_access.user_id", "Användar-ID")}
										</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder={t("door_access.user_id", "Användar-ID")}
												{...field}
												value={field.value?.toString() ?? ""}
												onChange={(e) =>
													field.onChange(Number.parseInt(e.target.value) || 0)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={doorAccessForm.control}
								name="door"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("door_access.door", "Dörr")}</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue
														placeholder={t(
															"door_access.select_door",
															"Välj dörr",
														)}
													/>
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{Object.values(door).map((doorValue) => (
													<SelectItem key={doorValue} value={doorValue}>
														{doorValue}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={doorAccessForm.control}
								name="starttime"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t("door_access.starttime", "Startdatum")}
										</FormLabel>
										<AdminChooseDates
											value={field.value ?? undefined}
											onChange={field.onChange}
										/>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={doorAccessForm.control}
								name="endtime"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t("door_access.endtime", "Slutdatum")}
										</FormLabel>
										<AdminChooseDates
											value={field.value ?? undefined}
											onChange={field.onChange}
										/>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="space-x-2 lg:col-span-2 lg:grid-cols-subgrid">
								<Button
									type="submit"
									disabled={!submitEnabled}
									className="w-32 min-w-fit"
								>
									{t("door_access.add", "Lägg till")}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
