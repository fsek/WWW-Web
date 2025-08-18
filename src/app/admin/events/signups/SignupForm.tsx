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
	eventSignupRouteMutation,
	getAllEventSignupsOptions,
} from "@/api/@tanstack/react-query.gen";
import { Plus, Save, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import AdminChooseUser, { type Option } from "@/widgets/AdminChooseUser";
import type { EventSignupCreate } from "@/api/types.gen";
import AdminChooseOnePriority from "@/widgets/AdminChooseOnePriority";

const schema = z.object({
	user_id: z.number({ required_error: "User is required" }),
	priority: z.string().optional(),
	group_name: z.string().optional(),
	drinkPackage: z.enum(["None", "AlcoholFree", "Alcohol"]),
});

interface SignupFormProps {
	eventId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function SignupForm({
	eventId,
	open,
	onOpenChange,
}: SignupFormProps) {
	const [submitEnabled, setSubmitEnabled] = useState(true);
	const { t } = useTranslation();

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			user_id: undefined as unknown as number,
			priority: "",
			group_name: "",
			drinkPackage: "None",
		},
	});

	const queryClient = useQueryClient();

	const createSignup = useMutation({
		...eventSignupRouteMutation(),
		onSuccess: () => {
			toast.success(t("event_signup.success_create") || "Signup created");
			queryClient.invalidateQueries({
				queryKey: getAllEventSignupsOptions({ path: { event_id: eventId } })
					.queryKey,
			});
			form.reset();
			onOpenChange(false);
			setSubmitEnabled(true);
		},
		onError: (error: any) => {
			toast.error(
				t("event_signup.error_create", {
					error: error?.detail || t("event_signup.unknown_error"),
				}) || "Failed to create signup",
			);
			setSubmitEnabled(true);
		},
	});

	function onSubmit(values: z.infer<typeof schema>) {
		setSubmitEnabled(false);
		const body: EventSignupCreate = {
			user_id: values.user_id,
			priority: values.priority || null,
			group_name: values.group_name || null,
			drinkPackage: values.drinkPackage || "None",
		};
		createSignup.mutate({
			path: { event_id: eventId },
			body,
		});
	}

	return (
		<div className="p-3">
			<Button
				onClick={() => {
					form.reset({
						user_id: undefined as unknown as number,
						priority: "",
						group_name: "",
						drinkPackage: "None",
					});
					onOpenChange(true);
					setSubmitEnabled(true);
				}}
				className="hidden"
			>
				<Plus />
				{t("event_signup.button")}
			</Button>

			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="min-w-fit lg:max-w-2xl">
					<DialogHeader>
						<DialogTitle>
							{t("admin:event-signups.add") || "Add signup"}
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
								name="user_id"
								render={({ field }) => (
									<FormItem className="lg:col-span-2">
										<FormLabel>{t("admin:user") || "User"}</FormLabel>
										<FormControl>
											<AdminChooseUser
												onChange={(user) => {
													field.onChange((user as Option)?.value);
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="priority"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("event_signup.priority")}</FormLabel>
										<FormControl>
											<AdminChooseOnePriority
												value={field.value ?? ""}
												onChange={(value) => field.onChange(value)}
												className="text-sm"
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
											{t("event_signup.drink_package.title")}
										</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue
														placeholder={t("event_signup.select_drink_package")}
													/>
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="None">
													{t("event_signup.drink_package.none")}
												</SelectItem>
												<SelectItem value="AlcoholFree">
													{t("event_signup.drink_package.alcohol_free")}
												</SelectItem>
												<SelectItem value="Alcohol">
													{t("event_signup.drink_package.alcohol")}
												</SelectItem>
											</SelectContent>
										</Select>
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
									<Save className="mr-2 h-4 w-4" />
									{t("create")}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => onOpenChange(false)}
									className="w-32 min-w-fit"
								>
									<X className="mr-2 h-4 w-4" />
									{t("cancel")}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
