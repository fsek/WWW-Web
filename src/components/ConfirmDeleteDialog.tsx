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
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface ConfirmDeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	disabled?: boolean;
	triggerText?: string;
	title?: string;
	description?: string;
	confirmText?: string;
	cancelText?: string;
	children?: React.ReactNode;
	confirmByTyping?: boolean;
	confirmByTypingText?: string;
	confirmByTypingKey?: string;
	showIcon?: boolean;
}

export function ConfirmDeleteDialog({
	open,
	onOpenChange,
	onConfirm,
	disabled = false,
	triggerText,
	title,
	description,
	confirmText,
	cancelText,
	children,
	confirmByTyping = false,
	confirmByTypingText,
	confirmByTypingKey = "confirm",
	showIcon = true,
}: ConfirmDeleteDialogProps) {
	const { t } = useTranslation();
	const [typedValue, setTypedValue] = useState("");

	const isConfirmEnabled =
		!confirmByTyping || typedValue.trim() === (confirmByTypingKey ?? "").trim();

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogTrigger asChild>
				<Button
					variant="destructive"
					type="button"
					className="w-32 min-w-fit"
					disabled={disabled}
					onClick={() => onOpenChange(true)}
				>
					{showIcon && <Trash2 />}
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
					{confirmByTyping && (
						<div className="mt-4 flex flex-col gap-2">
							<span>
								{confirmByTypingText ??
									t("admin:remove_confirm_by_typing", {
										key: confirmByTypingKey,
									})}
							</span>
							<Input
								type="text"
								className="input input-bordered w-full"
								value={typedValue}
								onChange={(e) => setTypedValue(e.target.value)}
							/>
						</div>
					)}
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel
						onClick={() => {
							onOpenChange(false);
							setTypedValue("");
						}}
					>
						{cancelText ?? t("admin:cancel")}
					</AlertDialogCancel>
					<Button
						variant="destructive"
						onClick={() => {
							onConfirm();
							onOpenChange(false);
							setTypedValue("");
						}}
						disabled={!isConfirmEnabled}
					>
						{showIcon && <Trash2 />}
						{confirmText ?? t("admin:remove")}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
