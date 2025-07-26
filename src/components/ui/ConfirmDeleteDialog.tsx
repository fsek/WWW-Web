import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface ConfirmDeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	triggerText?: string;
	title?: string;
	description?: string;
	confirmText?: string;
	cancelText?: string;
	children?: React.ReactNode;
}

export function ConfirmDeleteDialog({
	open,
	onOpenChange,
	onConfirm,
	triggerText,
	title,
	description,
	confirmText,
	cancelText,
	children,
}: ConfirmDeleteDialogProps) {
	const { t } = useTranslation();

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogTrigger asChild>
				<Button
					variant="destructive"
					type="button"
					className="w-32 min-w-fit"
					onClick={() => onOpenChange(true)}
				>
					{triggerText ?? t("admin:remove")}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogDescription className="sr-only">
					{description ?? t("admin:remove_confirm_description")}
				</AlertDialogDescription>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{title ?? t("admin:remove_confirm_title")}
					</AlertDialogTitle>
					{children ?? description ?? t("admin:remove_confirm_text")}
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={() => onOpenChange(false)}>
						{cancelText ?? t("admin:cancel")}
					</AlertDialogCancel>
					<Button
						variant="destructive"
						onClick={() => {
							onConfirm();
							onOpenChange(false);
						}}
					>
						{confirmText ?? t("admin:remove")}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
