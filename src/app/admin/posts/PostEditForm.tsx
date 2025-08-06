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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { door } from "@/api";
import StyledMultiSelect from "@/components/StyledMultiSelect";

const postEditSchema = z.object({
	id: z.number(),
	name_sv: z.string().min(2),
	name_en: z.string().min(2),
	description_sv: z.string().optional(),
	description_en: z.string().optional(),
	email: z.string().email(),
	council_id: z.number().int(),
	doors: z.array(z.string()).optional(),
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
			});
		}
	}, [selectedPost, form, open]);

	const queryClient = useQueryClient();

	const updatePost = useMutation({
		...updatePostMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllPostsQueryKey() });
			toast.success(t("posts.edit_success", "Post uppdaterad!"));
		},
		onError: (error) => {
			onClose();
			toast.error(
				t("posts.edit_error", "Kunde inte uppdatera post.") +
					(error?.detail ? ` (${error.detail})` : ""),
			);
		},
	});

	const removePost = useMutation({
		...deletePostMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllPostsQueryKey() });
			toast.success(t("posts.delete_success", "Post borttagen!"));
		},
		onError: (error) => {
			onClose();
			toast.error(
				t("posts.delete_error", "Kunde inte ta bort post.") +
					(error?.detail ? ` (${error.detail})` : ""),
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
			<DialogContent className="min-w-fit lg:max-w-7xl">
				<DialogHeader>
					<DialogTitle>{t("posts.edit", "Redigera post")}</DialogTitle>
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
									<FormLabel>{t("posts.name", "Name")}</FormLabel>
									<FormControl>
										<Input
											placeholder={t("posts.name_placeholder", "Namn")}
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
									<FormLabel>{t("posts.name_en", "Name (English)")}</FormLabel>
									<FormControl>
										<Input
											placeholder={t(
												"posts.name_en_placeholder",
												"Name (English)",
											)}
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
									<FormLabel>
										{t("posts.description_sv", "Description (Swedish)")}
									</FormLabel>
									<FormControl>
										<Textarea
											placeholder={t(
												"posts.description_placeholder_sv",
												"Beskrivning (Svenska)",
											)}
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
									<FormLabel>
										{t("posts.description_en", "Description (English)")}
									</FormLabel>
									<FormControl>
										<Textarea
											placeholder={t(
												"posts.description_placeholder_en",
												"Description (English)",
											)}
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
									<FormLabel>{t("posts.email", "Email")}</FormLabel>
									<FormControl>
										<Input
											placeholder={t("posts.email_placeholder", "Email")}
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
									<FormLabel>{t("posts.council", "Council")}</FormLabel>
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
											// Simplifying these seems straightforward,
											// but I could not do it without creating type errors
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

						<div className="space-x-2 lg:col-span-4 lg:grid-cols-subgrid">
							<ConfirmDeleteDialog
								open={showDeleteDialog}
								onOpenChange={setShowDeleteDialog}
								onConfirm={handleRemoveSubmit}
								triggerText={t("posts.remove", "Remove post")}
								title={t("posts.confirm_remove", "Confirm removal")}
								description={t(
									"posts.confirm_remove_text",
									"Are you sure you want to remove this post?",
								)}
								confirmText={t("posts.remove", "Remove post")}
								cancelText={t("cancel", "Cancel")}
							/>

							<Button
								variant="outline"
								type="button"
								className="w-32 min-w-fit"
								onClick={viewPermissions}
							>
								{t("posts.update_permissions", "Updatera permissions")}
							</Button>

							<Button type="submit" className="w-32 min-w-fit">
								<Save />
								{t("save", "Spara")}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
