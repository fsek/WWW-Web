import { useEffect, useState } from "react";
import { z } from "zod";
import {
	deleteKeyvalMutation,
	getKeyvalsQueryKey,
	updateKeyvalMutation,
} from "@/api/@tanstack/react-query.gen";
import type { KeyvalRead, KeyvalUpdate } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import AdminForm from "@/widgets/AdminForm";

const keyvalEditSchema = z.object({
	key: z.string().min(1),
	value: z.string().min(1),
});

interface KeyvalEditFormProps {
	item: KeyvalRead | null;
	onClose: () => void;
}

export default function KeyvalEditForm({ onClose, item }: KeyvalEditFormProps) {
	const { t } = useTranslation("admin");
	const [convertedItem, setConvertedItem] = useState<z.infer<
		typeof keyvalEditSchema
	> | null>(null);
	useEffect(() => {
		if (item) {
			setConvertedItem({
				key: item.key,
				value: item.value,
			});
		}
	}, [item]);

	const queryClient = useQueryClient();

	const updateKeyval = useMutation({
		...updateKeyvalMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getKeyvalsQueryKey(),
			});
			toast.success(t("keyvals.edit_success"));
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("keyvals.edit_error"),
			);

			onClose();
		},
	});

	const deleteKeyval = useMutation({
		...deleteKeyvalMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getKeyvalsQueryKey(),
			});
			toast.success(t("keyvals.remove_success"));
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("keyvals.edit_error"),
			);

			onClose();
		},
	});

	function handleFormSubmit(values: z.infer<typeof keyvalEditSchema>) {
		const updatedKeyval: KeyvalUpdate = {
			value: values.value,
		};

		updateKeyval.mutate(
			{
				path: { key: values.key },
				body: updatedKeyval,
			},
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	function handleRemoveSubmit(data: z.infer<typeof keyvalEditSchema>) {
		deleteKeyval.mutate(
			{ path: { key: data.key } },
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	return (
		<AdminForm
			title={t("keyvals.edit_keyval")}
			formType="edit"
			gridCols={2}
			open={!!item}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
			inputFields={[
				{
					variant: "text",
					name: "key",
					label: t("keyvals.key"),
					placeholder: t("keyvals.key_placeholder"),
				},
				{
					variant: "text",
					name: "value",
					label: t("keyvals.value"),
					placeholder: t("keyvals.value_placeholder"),
				},
			]}
			zodSchema={keyvalEditSchema}
			onSubmit={handleFormSubmit}
			useDeleteButton
			onDelete={handleRemoveSubmit}
			showDialogButton={false}
			editItem={convertedItem || undefined}
			setEditItem={setConvertedItem}
			confirmDeleteDialogTitle={t("keyvals.confirm_remove")}
			confirmDeleteDialogDescription={t("keyvals.confirm_remove_text")}
		/>
	);
}
