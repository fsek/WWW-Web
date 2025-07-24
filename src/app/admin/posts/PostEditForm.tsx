import { useEffect } from "react";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { AdminChooseCouncil } from "@/widgets/AdminChooseCouncil";
import {
	deletePostMutation,
	getAllPostsQueryKey,
	updatePostMutation,
} from "@/api/@tanstack/react-query.gen";
import type { PostRead, PostUpdate } from "../../../api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

const postEditSchema = z.object({
	id: z.number(),
	name: z.string().min(2),
	council_id: z.number().int(),
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
			name: "",
		},
	});

	const router = useRouter();

	useEffect(() => {
		if (open && selectedPost) {
			form.reset({
				...selectedPost,
			});
		}
	}, [selectedPost, form, open]);

	const queryClient = useQueryClient();

	const updatePost = useMutation({
		...updatePostMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllPostsQueryKey() });
		},
		onError: () => {
			onClose();
		},
	});

	const removePost = useMutation({
		...deletePostMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllPostsQueryKey() });
		},
		onError: () => {
			onClose();
		},
	});

	function handleFormSubmit(values: PostEditFormType) {
		const updatedEvent: PostUpdate = {
			name: values.name,
			council_id: values.council_id,
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
						{/* Title (sv) */}
						<FormField
							control={form.control}
							name="name"
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

						<div className="space-x-2 lg:col-span-4 lg:grid-cols-subgrid">
							<Button
								variant="destructive"
								type="button"
								className="w-32 min-w-fit"
								onClick={handleRemoveSubmit}
							>
								{t("posts.remove", "Remove post")}
							</Button>

							<Button
								variant="outline"
								type="button"
								className="w-32 min-w-fit"
								onClick={viewPermissions}
							>
								{t("posts.update_permissions", "Updatera permissions")}
							</Button>

							<Button type="submit" className="w-32 min-w-fit">
								{t("save", "Spara")}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
