import { useState } from "react";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getKeyvalsQueryKey,
	postKeyvalMutation,
} from "@/api/@tanstack/react-query.gen";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import AdminForm from "@/widgets/AdminForm";

const keyvalSchema = z.object({
	key: z.string().min(1),
	value: z.string().min(1),
});

export default function KeyvalForm() {
	const [open, setOpen] = useState(false);
	const { t } = useTranslation("admin");

	const queryClient = useQueryClient();

	const createKeyval = useMutation({
		...postKeyvalMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getKeyvalsQueryKey(),
			});
			toast.success(t("keyvals.create_success"));
			setOpen(false);
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("keyvals.create_error"),
			);
			setOpen(false);
		},
	});

	function onSubmit(values: z.infer<typeof keyvalSchema>) {
		createKeyval.mutate({
			body: {
				key: values.key,
				value: values.value,
			},
		});
	}

	return (
		<AdminForm
			title={t("keyvals.create_keyval")}
			formType="add"
			gridCols={2}
			open={open}
			onOpenChange={setOpen}
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
			zodSchema={keyvalSchema}
			onSubmit={onSubmit}
		/>
	);
}
