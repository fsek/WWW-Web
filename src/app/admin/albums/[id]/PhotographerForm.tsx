import {
	addAlbumPhotographerMutation,
	getOneAlbumQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import AdminChooseUser, { type Option } from "@/widgets/AdminChooseUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";

const photographerSchema = z.object({
	user: z.number(),
});

export default function PhotographerForm({
	album_id,
	excluded_users,
}: { album_id: number; excluded_users: number[] }) {
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(false);
	const [user, setUser] = useState<number | undefined>(undefined);
	const { t } = useTranslation("admin");
	const queryClient = useQueryClient();

	const photographerForm = useForm<z.infer<typeof photographerSchema>>({
		resolver: zodResolver(photographerSchema),
		defaultValues: {},
	});

	const addPhotographer = useMutation({
		...addAlbumPhotographerMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getOneAlbumQueryKey({ path: { album_id: album_id } }),
			});
			setOpen(false);
			setSubmitEnabled(true);
		},
		onError: (error) => {
			toast.error(
				t("album.error_add_photographer", {
					error: error?.detail ?? t("unknown_error"),
				}),
			);
			setSubmitEnabled(true);
		},
	});

	return (
		<div className="p-3">
			<Button
				onClick={() => {
					photographerForm.reset();
					setOpen(true);
					setSubmitEnabled(true);
				}}
			>
				<UserPlus /> {t("album.add_photographer")}
			</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl">
					<DialogHeader>
						<DialogTitle>
							{t("album.add_photographer", "Lägg till fotograf")}
						</DialogTitle>
					</DialogHeader>
					<hr />
					<Form {...photographerForm}>
						<form
							onSubmit={photographerForm.handleSubmit((data) => {
								setSubmitEnabled(false);
								addPhotographer.mutate({
									body: { album_id: album_id, user_id: data.user },
								});
							})}
							className="grid gap-x-4 gap-y-3 lg:grid-cols-2"
						>
							<FormField
								control={photographerForm.control}
								name="user"
								render={({ field }) => (
									<FormItem>
										<AdminChooseUser
											isMulti={false}
											onChange={(user) => {
												field.onChange((user as Option)?.value);
											}}
											additionalFilters={{ exclude_ids: excluded_users }}
										/>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button
								type="submit"
								disabled={!submitEnabled}
								className="w-32 min-w-fit"
							>
								<UserPlus />
								{t("album.add_photographer")}
							</Button>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
