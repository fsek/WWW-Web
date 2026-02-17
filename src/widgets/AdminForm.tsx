import { useEffect, useState } from "react";
import type { ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	useForm,
	type FieldValues,
	type Path,
	type DefaultValues,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Pen, Plus } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/textarea";
import { SelectFromOptions } from "./SelectFromOptions";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";

type BaseAdminFormInputField<T extends FieldValues> = {
	name: Path<T>;
	label: string;
	colSpan?: number;
};

type TextAdminFormInputField<T extends FieldValues> =
	BaseAdminFormInputField<T> & {
		variant: "text";
		placeholder?: string;
	};

type TextareaAdminFormInputField<T extends FieldValues> =
	BaseAdminFormInputField<T> & {
		variant: "textarea";
		rows?: number;
		placeholder?: string;
	};

type SelectFromOptionsAdminFormInputField<T extends FieldValues> =
	BaseAdminFormInputField<T> & {
		variant: "selectFromOptions";
		options: { value: string; label: string }[];
		placeholder?: string;
	};

// Implement further cases here

export type AdminFormInputField<T extends FieldValues> =
	| TextAdminFormInputField<T>
	| TextareaAdminFormInputField<T>
	| SelectFromOptionsAdminFormInputField<T>;

export interface AdminFormProps<T extends FieldValues> {
	title: string;
	description?: string;
	gridCols?: number;
	formType: "add" | "edit";
	inputFields: AdminFormInputField<T>[];
	zodSchema: ZodType<T>;
	defaultValues?: DefaultValues<T>;
	onSubmit: (data: T) => void;
	submitEnabled: boolean;
	setSubmitEnabled: (enabled: boolean) => void;
	useDeleteButton?: boolean;
	requireConfirmationToDelete?: boolean;
	onDelete?: (data: T) => void;
	customButtons?: React.ReactNode;
	showDialogButton?: boolean;
	editItem?: T | null;
	setEditItem?: (item: T | null) => void;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

/* A generic admin form with a title and grid-system with generic input fields of different kinds. */
export default function AdminForm<T extends FieldValues>({
	title,
	description,
	gridCols = 4,
	formType,
	inputFields,
	zodSchema,
	defaultValues,
	onSubmit,
	submitEnabled = true,
	setSubmitEnabled,
	useDeleteButton = false,
	requireConfirmationToDelete = true,
	onDelete,
	customButtons,
	showDialogButton = true,
	editItem,
	setEditItem,
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
}: AdminFormProps<T>) {
	const [internalOpen, setInternalOpen] = useState(false);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const { t } = useTranslation("admin");

	const isControlled = controlledOpen !== undefined;
	const open = isControlled ? controlledOpen : internalOpen;

	const handleOpenChange = (newOpen: boolean) => {
		if (!isControlled) {
			setInternalOpen(newOpen);
		}
		controlledOnOpenChange?.(newOpen);

		if (!newOpen) {
			genericForm.reset();
			if (formType === "edit") {
				setEditItem?.(null);
			}
		}
	};

	const genericForm = useForm<T>({
		resolver: zodResolver(zodSchema),
		defaultValues,
	});

	const getColSpanClass = (colSpan?: number) => {
		if (!colSpan || colSpan === 1) return "";
		return `lg:col-span-${colSpan}`;
	};

	const getGridColsClass = () => {
		return `lg:grid-cols-${gridCols}`;
	};

	// If in edit mode, we reset the form when we get a new editItem, to populate the form
	// with the new data.
	useEffect(() => {
		if (editItem && formType === "edit") {
			console.log("editItem", editItem);
			genericForm.reset(editItem);
		}
		console.log("genericForm values after reset", genericForm.getValues());
	}, [editItem, genericForm]);

	return (
		<div className="p-3">
			{showDialogButton && (
				<Button
					onClick={() => {
						genericForm.reset();
						handleOpenChange(true);
						setSubmitEnabled(true);
					}}
				>
					{formType === "add" ? <Plus /> : formType === "edit" ? <Pen /> : null}
					{title}
				</Button>
			)}

			{/* Show dialog if opened by the button, or if there is no button and we are in edit mode show only if there is an editItem */}
			<Dialog
				open={open}
				onOpenChange={handleOpenChange}
			>
				<DialogContent className="min-w-fit lg:max-w-7xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{title}</DialogTitle>
					</DialogHeader>
					{description && <DialogDescription>{description}</DialogDescription>}
					<hr />
					<Form {...genericForm}>
						<form
							onSubmit={genericForm.handleSubmit(onSubmit)}
							className={`grid gap-x-4 gap-y-3 ${getGridColsClass()}`}
						>
							{inputFields.map((inputField) => {
								switch (inputField.variant) {
									case "text":
										return (
											<FormField
												key={inputField.name}
												control={genericForm.control}
												name={inputField.name}
												render={({ field }) => (
													<FormItem
														className={getColSpanClass(inputField.colSpan)}
													>
														<FormLabel>{inputField.label}</FormLabel>
														<FormControl>
															<Input
																placeholder={inputField.placeholder}
																{...field}
															/>
														</FormControl>
													</FormItem>
												)}
											/>
										);
									case "textarea":
										return (
											<FormField
												key={inputField.name}
												control={genericForm.control}
												name={inputField.name}
												render={({ field }) => (
													<FormItem
														className={getColSpanClass(inputField.colSpan)}
													>
														<FormLabel>{inputField.label}</FormLabel>
														<FormControl>
															<Textarea
																placeholder={inputField.placeholder}
																rows={inputField.rows}
																{...field}
															/>
														</FormControl>
													</FormItem>
												)}
											/>
										);
									case "selectFromOptions":
										return (
											<FormField
												key={inputField.name}
												control={genericForm.control}
												name={inputField.name}
												render={({ field }) => (
													<FormItem
														className={getColSpanClass(inputField.colSpan)}
													>
														<FormLabel>{inputField.label}</FormLabel>
														<FormControl>
															<SelectFromOptions
																placeholder={inputField.placeholder}
																options={inputField.options}
																{...field}
															/>
														</FormControl>
													</FormItem>
												)}
											/>
										);
									// Implement further cases here
									default:
										return null;
								}
							})}
							<div
								className={`space-x-2 ${getColSpanClass(gridCols)} lg:grid-cols-subgrid justify-between flex`}
							>
								<div className="flex gap-2">
									{useDeleteButton && formType === "edit" && onDelete ? (
										requireConfirmationToDelete ? (
											<ConfirmDeleteDialog
												open={deleteConfirmOpen}
												onOpenChange={setDeleteConfirmOpen}
												onConfirm={() => {
													setDeleteConfirmOpen(false);
													onDelete(genericForm.getValues());
													handleOpenChange(false);
												}}
											/>
										) : (
											<Button
												variant="destructive"
												type="button"
												onClick={() => {
													onDelete(genericForm.getValues());
													handleOpenChange(false);
												}}
											>
												{t("remove")}
											</Button>
										)
									) : null}

									{customButtons ? <>{customButtons}</> : null}
								</div>

								<Button
									type="submit"
									disabled={!submitEnabled}
									className="w-32 min-w-fit"
								>
									{formType === "add"
										? t("create")
										: formType === "edit"
											? t("save_changes")
											: title}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
