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

export default function PhotographerForm({ album_id }: { album_id: number }) {
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(false);
	const [user, setUser] = useState<number | undefined>(undefined);
	const { t } = useTranslation("admin");
	const queryClient = useQueryClient();
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
			<Button onClick={() => setOpen(true)}>
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
					<AdminChooseUser
						isMulti={false}
						onChange={(user) => {
							if (user) {
								setSubmitEnabled(true);
								setUser((user as Option).value as number);
								console.log(user);
							} else {
								setSubmitEnabled(false);
								setUser(undefined);
							}
						}}
					/>
					<Button
						type="submit"
						disabled={!submitEnabled}
						onClick={() =>
							addPhotographer.mutate({
								body: { album_id: album_id, user_id: user as number },
							})
						}
						className="w-32 min-w-fit"
					>
						<UserPlus />
						{t("album.add_photographer")}
					</Button>
				</DialogContent>
			</Dialog>
		</div>
	);
}
