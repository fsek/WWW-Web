import { useEffect, useState } from "react";
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
	updateEventSignupRouteMutation,
	getAllEventSignupsOptions,
} from "@/api/@tanstack/react-query.gen";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { EventSignupRead, EventSignupUpdate } from "@/api/types.gen";
import { Input } from "@/components/ui/input";
import { Save, X } from "lucide-react";

const editSchema = z.object({
	priority: z.string().optional(),
	group_name: z.string().optional(),
	drinkPackage: z.enum(["None", "AlcoholFree", "Alcohol"]),
});

interface SignupEditFormProps {
	open: boolean;
	onClose: () => void;
	eventId: number;
	selectedSignup: EventSignupRead;
}

export default function SignupEditForm({
	open,
	onClose,
	eventId,
	selectedSignup,
}: SignupEditFormProps) {
	const [submitEnabled, setSubmitEnabled] = useState(true);
	const { t } = useTranslation();
	const form = useForm<z.infer<typeof editSchema>>({
		resolver: zodResolver(editSchema),
		defaultValues: {
			priority: selectedSignup?.priority ?? "",
			group_name: selectedSignup?.group_name ?? "",
			drinkPackage: selectedSignup?.drinkPackage ?? "None",
		},
	});

	useEffect(() => {
		if (selectedSignup) {
			form.reset({
				priority: selectedSignup.priority ?? "",
				group_name: selectedSignup.group_name ?? "",
				drinkPackage: selectedSignup.drinkPackage ?? "None",
			});
		}
	}, [selectedSignup, form]);

	const queryClient = useQueryClient();

	const updateSignup = useMutation({
		...updateEventSignupRouteMutation(),
		onSuccess: () => {
			toast.success(t("event_signup.success_update") || "Signup updated");
			queryClient.invalidateQueries({
				queryKey: getAllEventSignupsOptions({ path: { event_id: eventId } })
					.queryKey,
			});
			onClose();
			setSubmitEnabled(true);
		},
		onError: (error: any) => {
			toast.error(
				t("event_signup.error_update", {
					error: error?.detail || t("event_signup.unknown_error"),
				}) || "Failed to update signup"
			);
			setSubmitEnabled(true);
		},
	});

	function onSubmit(values: z.infer<typeof editSchema>) {
		setSubmitEnabled(false);
		const body: EventSignupUpdate = {
			user_id: selectedSignup.user.id, // identify which user's signup to update
			priority: values.priority || null,
			group_name: values.group_name || null,
			drinkPackage: values.drinkPackage || "None",
		};
		updateSignup.mutate({
			path: { event_id: eventId },
			body,
		});
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
		>
			<DialogContent className="min-w-fit lg:max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						{t("admin:edit") || "Edit"} –{" "}
						{selectedSignup?.user?.first_name}{" "}
						{selectedSignup?.user?.last_name}
					</DialogTitle>
				</DialogHeader>
				<hr />
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid gap-x-4 gap-y-3 lg:grid-cols-2"
					>
						<FormField
							control={form.control}
							name="priority"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{t("event_signup.priority") || "Priority"}
									</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g. member, alum, guest"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="group_name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{t("event_signup.group_name") || "Group name"}
									</FormLabel>
									<FormControl>
										<Input
											placeholder={
												t("event_signup.group_name_placeholder") ||
												"Group name"
											}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="drinkPackage"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{
											t("event_signup.drink_package.title") ||
											"Drink package"
										}
									</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue
													placeholder={
														t(
															"event_signup.select_drink_package"
														) || "Select"
													}
												/>
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="None">
												{t("event_signup.drink_package.none") ||
													"None"}
											</SelectItem>
											<SelectItem value="AlcoholFree">
												{
													t(
														"event_signup.drink_package.alcohol_free"
													) || "Alcohol-free"
												}
											</SelectItem>
											<SelectItem value="Alcohol">
												{t("event_signup.drink_package.alcohol") ||
													"Alcohol"}
											</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="space-x-2 lg:col-span-2 lg:grid-cols-subgrid flex flex-row items-center">
							<Button
								type="submit"
								disabled={!submitEnabled}
								className="w-32 min-w-fit"
							>
								<Save className="mr-2 h-4 w-4" />
								{t("save") || "Save"}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								className="w-32 min-w-fit"
							>
								<X className="mr-2 h-4 w-4" />
								{t("cancel") || "Cancel"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
