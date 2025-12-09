import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	adminDeleteUserMutation,
	adminGetAllUsersQueryKey,
	adminUpdateUserMutation,
	updateUserPostsMutation,
} from "@/api/@tanstack/react-query.gen";
import {
	ActionEnum,
	TargetEnum,
	type UserUpdate,
	type AdminUserRead,
} from "@/api";
import { useTranslation } from "react-i18next";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { toast } from "sonner";
import { AdminChooseMultPosts } from "@/widgets/AdminChooseMultPosts";
import { Pen, Save } from "lucide-react";
import UserDetailsCard from "@/components/UserDetailsCard";
import { useAuthState } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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

import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parsePhoneNumberWithError } from "libphonenumber-js";

const userSchema = z.object({
	first_name: z.string().nullable().optional(),
	last_name: z.string().nullable().optional(),
	start_year: z.number().nullable().optional(),
	program: z.enum(["Oklart", "F", "Pi", "N"]).nullable().optional(),
	stil_id: z.string().nullable().optional(),
	standard_food_preferences: z.array(z.string()).nullable().optional(),
	other_food_preferences: z.string().nullable().optional(),
	telephone_number: z.string().nullable().optional(),
	moose_game_name: z.string().nullable().optional(),
});

interface MemberEditFormProps {
	open: boolean;
	onClose: () => void;
	selectedUser: AdminUserRead;
}

export default function UserPostsEditForm({
	open,
	onClose,
	selectedUser,
}: MemberEditFormProps) {
	const { t } = useTranslation("admin");
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const auth = useAuthState();
	const permissions = auth.getPermissions();
	const queryClient = useQueryClient();

	const form = useForm<UserUpdate>({
		resolver: zodResolver(userSchema),
		defaultValues: {
			first_name: selectedUser.first_name ?? "",
			last_name: selectedUser.last_name ?? "",
			start_year: selectedUser.start_year ?? null,
			program: selectedUser.program ?? "Oklart",
			stil_id: selectedUser.stil_id ?? "",
			standard_food_preferences: selectedUser.standard_food_preferences ?? [],
			other_food_preferences: selectedUser.other_food_preferences ?? "",
			telephone_number: selectedUser.telephone_number ?? "",
			moose_game_name: selectedUser.moose_game_name ?? "",
		},
	});

	const PROGRAMS = [
		{ value: "F", label: "F" },
		{ value: "Pi", label: "Pi" },
		{ value: "N", label: "N" },
		{ value: "Oklart", label: t("admin:unclear_program") },
	];

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = form;

	const deleteUser = useMutation({
		...adminDeleteUserMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminGetAllUsersQueryKey() });
			onClose();
			toast.success(t("member.delete_success", "User deleted."));
		},
		onError: (e) => {
			toast.error(
				t("member.delete_error", "Failed to delete selected user: {details}", {
					details: e.detail,
				}),
			);
		},
	});

	const updateUser = useMutation({
		...adminUpdateUserMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminGetAllUsersQueryKey() });
			toast.success(t("member.update_success", "User updated successfully!"));
			setIsEditing(false);
			onClose?.();
		},
		onError: () => {
			toast.error(t("member.update_error", "Failed to update user."));
		},
	});

	function handleDeleteUser() {
		deleteUser.mutate(
			{
				path: { user_id: selectedUser.id },
			},
			{
				onSuccess: () => {
					setConfirmOpen(false);
				},
			},
		);
	}

	function onSubmit(values: UserUpdate) {
		updateUser.mutate({
			path: { user_id: selectedUser.id },
			body: values,
		});
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) {
					onClose();
				}
			}}
		>
			<DialogContent className="min-w-fit lg:max-w-7xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{t("member.edit", "Manage User")}</DialogTitle>
				</DialogHeader>
				<hr />
				<div className="py-4">
					{isEditing ? (
						<Form {...form}>
							<div className="grid gap-6">
								<Card>
									<CardHeader>
										<CardTitle>{t("user-settings:personal-info")}</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<FormField
												control={control}
												name="first_name"
												render={({ field }) => (
													<FormItem>
														<FormLabel>{t("user-settings:first-name")}</FormLabel>
														{isEditing ? (
															<FormControl>
																<Input
																	{...field}
																	value={field.value ?? ""}
																	className={
																		errors.first_name
																			? "border-destructive"
																			: ""
																	}
																/>
															</FormControl>
														) : (
															<p className="text-sm font-medium mt-1">
																{selectedUser.first_name}
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
														<FormLabel>{t("user-settings:last-name")}</FormLabel>
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
																{selectedUser.last_name}
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
														<FormLabel>{t("user-settings:phone")}</FormLabel>
														{isEditing ? (
															<FormControl>
																<Input
																	type="tel"
																	{...field}
																	value={field.value ?? ""}
																	placeholder={t("user-settings:phone")}
																	className={
																		errors.telephone_number
																			? "border-destructive"
																			: ""
																	}
																/>
															</FormControl>
														) : (
															<p className="text-sm font-medium mt-1">
																{(() => {
																	try {
																		const phone = parsePhoneNumberWithError(
																			selectedUser.telephone_number,
																		);
																		// Only format as national if Swedish number (+46)
																		if (phone.countryCallingCode === "46") {
																			return phone.formatNational();
																		}
																		return phone.formatInternational();
																	} catch {
																		return (
																			selectedUser.telephone_number ||
																			t("user-settings:not-provided")
																		);
																	}
																})()}
															</p>
														)}
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<FormField
												control={control}
												name="start_year"
												render={({ field }) => (
													<FormItem>
														<FormLabel>{t("user-settings:start-year")}</FormLabel>
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
																		errors.start_year
																			? "border-destructive"
																			: ""
																	}
																/>
															</FormControl>
														) : (
															<p className="text-sm font-medium mt-1">
																{selectedUser.start_year}
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
																defaultValue={selectedUser.program || ""}
															>
																<SelectTrigger>
																	<SelectValue
																		placeholder={t("user-settings:select-program")}
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
																{selectedUser.program || t("user-settings:not-specified")}
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
													<FormLabel>{t("user-settings:stil-id")}</FormLabel>
													{isEditing ? (
														<>
															<FormControl>
																<Input
																	{...field}
																	value={field.value ?? ""}
																	placeholder={t("user-settings:optional")}
																/>
															</FormControl>
															<span className="text-sm text-muted-foreground">
																{t("user-settings:stil-id_subtitle")}
															</span>
														</>
													) : (
														<p className="text-sm font-medium mt-1">
															{selectedUser.stil_id || t("user-settings:not-provided")}
														</p>
													)}
													<FormMessage />
												</FormItem>
											)}
										/>
									</CardContent>
								</Card>
							</div>
						</Form>
					) : (
						<UserDetailsCard user={selectedUser} full={true} />
					)}

					<div className="flex gap-2 mt-6">
						{isEditing ? (
							<div className="flex gap-2">
								<Button
									onClick={() => {
										setIsEditing(false);
										form.reset();
									}}
								>
									{t("cancel")}
								</Button>
								<Button onClick={() => form.handleSubmit(onSubmit)}>
									<Save />
									{t("save")}
								</Button>
							</div>
						) : (
							<>
								<Button onClick={() => setIsEditing(true)}>
									<Pen />
									{t("edit")}
								</Button>
								{permissions.hasRequiredPermissions([
									[ActionEnum.SUPER, TargetEnum.USER],
								]) ? (
									<ConfirmDeleteDialog
										open={confirmOpen}
										onOpenChange={setConfirmOpen}
										onConfirm={handleDeleteUser}
										triggerText={t("member.remove")}
										title={t("member.confirm_remove", {user: `${selectedUser.first_name} ${selectedUser.last_name}`})}
										description={t("member.confirm_remove_text")}
										confirmText={t("member.remove")}
										cancelText={t("cancel", "Cancel")}
									/>
								) : null}
							</>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
