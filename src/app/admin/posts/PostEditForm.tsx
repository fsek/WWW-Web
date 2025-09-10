import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { AdminChooseCouncil } from "@/widgets/AdminChooseCouncil";
import {
	deletePostMutation,
	getAllPostsQueryKey,
	updatePostMutation,
} from "@/api/@tanstack/react-query.gen";
import type { PostRead, PostUpdate, PostDoorAccessRead } from "@/api";
import { elected_by, elected_at_semester } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { door } from "@/api";
import StyledMultiSelect from "@/components/StyledMultiSelect";
import { SelectFromOptions } from "@/widgets/SelectFromOptions";

const postEditSchema = z.object({
	id: z.number(),
	name_sv: z.string().min(2),
	name_en: z.string().min(2),
	description_sv: z.string().optional(),
	description_en: z.string().optional(),
	email: z.string().email(),
	council_id: z.number().int(),
	doors: z.array(z.string()).optional(),
	elected_at_semester: z.nativeEnum(elected_at_semester),
	elected_by: z.nativeEnum(elected_by),
	elected_user_recommended_limit: z.coerce.number().int().min(0),
	elected_user_max_limit: z.coerce.number().int().min(0),
});

type PostEditFormType = z.infer<typeof postEditSchema>;

interface PostEditFormProps {
	open: boolean;
	onClose: () => void;
	selectedPost: PostRead;
}

export default function PostEditForm({
	open,
	onClose,
	selectedPost,
}: PostEditFormProps) {
	const { t } = useTranslation("admin");
	const form = useForm<PostEditFormType>({
		resolver: zodResolver(postEditSchema),
		defaultValues: {
			name_sv: "",
			name_en: "",
			description_sv: "",
			description_en: "",
			email: "",
			doors: [],
			elected_at_semester: elected_at_semester.OTHER,
			elected_by: elected_by.OTHER,
			elected_user_recommended_limit: 0,
			elected_user_max_limit: 0,
		},
	});

	const router = useRouter();

	useEffect(() => {
		if (open && selectedPost) {
			form.reset({
				...selectedPost,
				doors: selectedPost.post_door_accesses.map(
					(doorAccess) => doorAccess.door,
				),
				elected_at_semester: (selectedPost.elected_at_semester ??
					elected_at_semester.OTHER) as elected_at_semester,
				elected_by: (selectedPost.elected_by ?? elected_by.OTHER) as elected_by,
				elected_user_recommended_limit:
					selectedPost.elected_user_recommended_limit ?? 0,
				elected_user_max_limit: selectedPost.elected_user_max_limit ?? 0,
			});
		}
	}, [selectedPost, form, open]);

	const queryClient = useQueryClient();

	const updatePost = useMutation({
		...updatePostMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllPostsQueryKey() });
			toast.success(t("posts.edit_success"));
		},
		onError: (error) => {
			onClose();
			toast.error(
				t("posts.edit_error") + (error?.detail ? ` (${error.detail})` : ""),
			);
		},
	});

	const removePost = useMutation({
		...deletePostMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllPostsQueryKey() });
			toast.success(t("posts.delete_success"));
		},
		onError: (error) => {
			onClose();
			toast.error(
				t("posts.delete_error") + (error?.detail ? ` (${error.detail})` : ""),
			);
		},
	});

	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	function handleFormSubmit(values: PostEditFormType) {
		const updatedEvent: PostUpdate = {
			name_sv: values.name_sv,
			name_en: values.name_en,
			description_sv: values.description_sv,
			description_en: values.description_en,
			email: values.email,
			council_id: values.council_id,
			doors: values.doors as PostDoorAccessRead["door"][],
			elected_at_semester: values.elected_at_semester,
			elected_by: values.elected_by,
			elected_user_recommended_limit: values.elected_user_recommended_limit,
			elected_user_max_limit: values.elected_user_max_limit,
		};

		updatePost.mutate(
			{
				path: { post_id: values.id },
				body: updatedEvent,
			},
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	function handleRemoveSubmit() {
		removePost.mutate(
			{ path: { post_id: form.getValues("id") } },
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	function viewPermissions() {
		// Save the complete object in session storage
		queryClient.setQueryData<PostRead>(["selectedPost"], selectedPost);
		router.push("/admin/posts/post-permissions");
	}

	function handleDeleteClick() {
		setShowDeleteDialog(true);
	}

	function handleDeleteConfirm() {
		setShowDeleteDialog(false);
		handleRemoveSubmit();
	}
	// function handleDeleteCancel() {
	// 	setShowDeleteDialog(false);
	// }

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
					<DialogTitle>{t("posts.edit")}</DialogTitle>
				</DialogHeader>
				<hr />
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleFormSubmit)}
						className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
					>
						{/* Name (sv) */}
						<FormField
							control={form.control}
							name="name_sv"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("posts.name")}</FormLabel>
									<FormControl>
										<Input
											placeholder={t("posts.name_placeholder")}
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Name (en) */}
						<FormField
							control={form.control}
							name="name_en"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("posts.name_en")}</FormLabel>
									<FormControl>
										<Input
											placeholder={t("posts.name_en_placeholder")}
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Description (sv) */}
						<FormField
							control={form.control}
							name="description_sv"
							render={({ field }) => (
								<FormItem className="lg:col-span-2">
									<FormLabel>{t("posts.description_sv")}</FormLabel>
									<FormControl>
										<Textarea
											placeholder={t("posts.description_placeholder_sv")}
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Description (en) */}
						<FormField
							control={form.control}
							name="description_en"
							render={({ field }) => (
								<FormItem className="lg:col-span-2">
									<FormLabel>{t("posts.description_en")}</FormLabel>
									<FormControl>
										<Textarea
											placeholder={t("posts.description_placeholder_en")}
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Email */}
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("posts.email")}</FormLabel>
									<FormControl>
										<Input
											placeholder={t("posts.email_placeholder")}
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Council */}
						<FormField
							control={form.control}
							name="council_id"
							render={({ field }) => (
								<FormItem className="lg:col-span-2">
									<FormLabel>{t("posts.council")}</FormLabel>
									<AdminChooseCouncil
										value={field.value}
										onChange={field.onChange}
									/>
								</FormItem>
							)}
						/>

						{/* Door access */}
						<FormField
							control={form.control}
							name="doors"
							render={({ field }) => (
								<FormItem className="lg:col-span-2">
									<FormLabel>{t("posts.door_access")}</FormLabel>
									<FormControl>
										<StyledMultiSelect
											isMulti
											options={Object.values(door).map((d) => ({
												value: d,
												label: d,
											}))}
											value={field.value?.map((d) => ({
												value: d,
												label: d,
											}))}
											onChange={(options) => {
												const vals = Array.isArray(options)
													? options.map((o) => o.value)
													: [];
												field.onChange(vals);
											}}
											placeholder={t("posts.select_doors")}
											className="w-full"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Elected at semester */}
						<FormField
							control={form.control}
							name="elected_at_semester"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("posts.elected_at_semester")}</FormLabel>
									<FormControl>
										<SelectFromOptions
											options={Object.values(elected_at_semester).map(
												(value) => ({
													value,
													label: t(`enums.elected_at_semester.${value}`),
												}),
											)}
											value={field.value}
											onChange={field.onChange}
											placeholder={t("posts.elected_at_semester_placeholder")}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Elected by */}
						<FormField
							control={form.control}
							name="elected_by"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("posts.elected_by")}</FormLabel>
									<FormControl>
										<SelectFromOptions
											options={Object.values(elected_by).map((value) => ({
												value,
												label: t(`enums.elected_by.${value}`),
											}))}
											value={field.value}
											onChange={field.onChange}
											placeholder={t("posts.elected_by_placeholder")}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Elected user recommended limit */}
						<FormField
							control={form.control}
							name="elected_user_recommended_limit"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{t("posts.elected_user_recommended_limit")}
									</FormLabel>
									<FormControl>
										<Input
											type="number"
											min={0}
											placeholder={t(
												"posts.elected_user_recommended_limit_placeholder",
											)}
											{...field}
											value={(field.value as number) ?? 0}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Elected user max limit */}
						<FormField
							control={form.control}
							name="elected_user_max_limit"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("posts.elected_user_max_limit")}</FormLabel>
									<FormControl>
										<Input
											type="number"
											min={0}
											placeholder={t(
												"posts.elected_user_max_limit_placeholder",
											)}
											{...field}
											value={(field.value as number) ?? 0}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<div className="space-x-2 lg:col-span-4 lg:grid-cols-subgrid">
							<ConfirmDeleteDialog
								open={showDeleteDialog}
								onOpenChange={setShowDeleteDialog}
								onConfirm={handleRemoveSubmit}
								triggerText={t("posts.remove")}
								title={t("posts.confirm_remove")}
								description={t("posts.confirm_remove_text")}
								confirmText={t("posts.remove")}
								cancelText={t("cancel")}
							/>

							<Button
								variant="outline"
								type="button"
								className="w-32 min-w-fit"
								onClick={viewPermissions}
							>
								{t("posts.update_permissions")}
							</Button>

							<Button type="submit" className="w-32 min-w-fit">
								<Save />
								{t("save")}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
