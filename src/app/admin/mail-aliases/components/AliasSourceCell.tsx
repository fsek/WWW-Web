"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { aliasDeleteAliasMutation } from "@/api/@tanstack/react-query.gen";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";

interface AliasSourceCellProps {
	alias: string;
	onRefetch: () => void;
}

export function AliasSourceCell({ alias, onRefetch }: AliasSourceCellProps) {
	const { t } = useTranslation();
	const [confirmOpen, setConfirmOpen] = useState(false);

	const deleteAliasMutation = useMutation({
		...aliasDeleteAliasMutation(),
		onSuccess: () => {
			toast.success(t("admin:mail_aliases.delete_source_success"));
			onRefetch();
		},
		onError: () => {
			toast.error(t("admin:mail_aliases.delete_source_error"));
		},
	});

	const removeSource = (source: string) => {
		deleteAliasMutation.mutate({
			path: { alias_email: source },
		});
	};

	return (
		<div className="flex items-center gap-2 text-md bg-accent p-4 rounded-lg">
			<span className="font-semibold text-lg flex-1">{alias}</span>
			<ConfirmDeleteDialog
				open={confirmOpen}
				onOpenChange={(open) => {
					setConfirmOpen(open);
					if (!open) {
						deleteAliasMutation.reset();
					}
				}}
				onConfirm={() => {
					removeSource(alias);
					setConfirmOpen(false);
				}}
				triggerText={t("admin:mail_aliases.delete_source")}
				title={t("admin:mail_aliases.delete_source_confirm_title")}
				description={t("admin:mail_aliases.delete_source_confirm_description", {
					alias,
				})}
				confirmText={t("admin:mail_aliases.delete_source_confirm")}
				cancelText={t("admin:cancel")}
			/>
		</div>
	);
}
