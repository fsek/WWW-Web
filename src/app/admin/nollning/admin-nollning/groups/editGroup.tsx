import type { GroupRead } from "@/api";
import {
	getNollningByYearQueryKey,
	getNollningQueryKey,
	patchGroupMutation,
	removeGroupMutation,
} from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogHeader,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import GroupTypeSelect from "./GroupTypeSelect";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const GroupSchema = z.object({
	id: z.number().int(),
	name: z.string().min(2),
	group_type: z.enum(["Mentor", "Mission", "Default", "Committee"]),
});

interface Props {
	open: boolean;
	onClose: () => void;
	selectedGroup: GroupRead;
	nollning_id: number;
	children?: React.ReactNode;
}

const EditGroup = ({
	open,
	onClose,
	selectedGroup,
	nollning_id,
	children,
}: Props) => {
	const { t } = useTranslation("admin");
	const form = useForm<z.infer<typeof GroupSchema>>({
		resolver: zodResolver(GroupSchema),
		defaultValues: {
			name: "",
			group_type: "Mentor",
		},
	});

	useEffect(() => {
		if (open && selectedGroup) {
			form.reset({
				...selectedGroup,
			});
		}
	}, [selectedGroup, form, open]);

	const queryClient = useQueryClient();

	const updateGroup = useMutation({
		...patchGroupMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getNollningQueryKey({
					path: { nollning_id: nollning_id },
				}),
			});
			queryClient.invalidateQueries({
				queryKey: getNollningByYearQueryKey({
					path: { year: new Date().getFullYear() },
				}),
			});
			toast.success(t("nollning.groups.edit_success"));
		},
		onError: () => {
			toast.error(t("nollning.groups.edit_error"));
			onClose();
		},
	});

	const removeGroup = useMutation({
		...removeGroupMutation(),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getNollningQueryKey({
					path: { nollning_id: nollning_id },
				}),
			});
			queryClient.invalidateQueries({
				queryKey: getNollningByYearQueryKey({
					path: { year: new Date().getFullYear() },
				}),
			});
			toast.success(t("nollning.groups.delete_success"));
		},
		onError: () => {
			toast.error(t("nollning.groups.delete_error"));
			onClose();
		},
	});

	function onSubmit(values: z.infer<typeof GroupSchema>) {
		updateGroup.mutate(
			{
				path: { id: values.id },
				body: {
					name: values.name,
					group_type: values.group_type,
				},
			},
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	function onDelete() {
		removeGroup.mutate(
			{ path: { id: selectedGroup.id } },
			{
				onSuccess: () => {
					onClose();
				},
			},
		);
	}

	return (
		<div>
			<Dialog
				open={open}
				onOpenChange={(isOpen) => {
					if (!isOpen) {
						onClose();
					}
				}}
			>
				<DialogContent className="px-10 py-8 space-y-2">
					<DialogHeader>
						<DialogTitle className=" px-4 text-2xl underline underline-offset-4 ">
							{selectedGroup?.name ?? "ingen grupp vald :(("}
						</DialogTitle>
					</DialogHeader>
					<div className="border border-gray-300 rounded-lg">
						<div className="space-y-4 p-4">
							<h3 className="underline underline-offset-2 ">
								{t("nollning.groups.admin_group")}
							</h3>
							{children}
						</div>
					</div>
					<Form {...form}>
						<form
							className="border border-gray-300 rounded-lg "
							onSubmit={form.handleSubmit(onSubmit)}
						>
							<div className="space-x-4 space-y-4 p-4">
								<h3 className="underline underline-offset-2 ">
									{t("nollning.groups.edit_group")}
								</h3>
								<FormField
									control={form.control}
									name={"name"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("nollning.groups.title")}</FormLabel>
											<FormControl>
												<Input
													placeholder={t("nollning.groups.title")}
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name={"group_type"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("nollning.groups.group_type")}</FormLabel>
											<GroupTypeSelect
												value={field.value}
												onChange={field.onChange}
											/>
										</FormItem>
									)}
								/>

								<div className=" space-x-2 flex flex-row w-full">
									<Button type="submit" className="flex-1">
										{t("nollning.groups.save_changes")}
									</Button>
									<Button
										variant="destructive"
										type="button"
										className="flex-1"
										onClick={onDelete}
									>
										{t("nollning.groups.delete")}
									</Button>
								</div>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default EditGroup;
