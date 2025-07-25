import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createPermissionMutation,
	getAllPermissionsQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { useTranslation } from "react-i18next";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { permissionActions, permissionTargets } from "@/constants";

const permissionSchema = z.object({
	action: z.enum([...permissionActions] as [string, ...string[]]),
	target: z.enum([...permissionTargets] as [string, ...string[]]),
});

export default function PermissionForm() {
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);
	const { t } = useTranslation("admin");

	const permissionForm = useForm<z.infer<typeof permissionSchema>>({
		resolver: zodResolver(permissionSchema),
		defaultValues: {
			action: "view",
			target: "Event",
		},
	});

	const queryClient = useQueryClient();

	const createPermission = useMutation({
		...createPermissionMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllPermissionsQueryKey() });
			setOpen(false);
			setSubmitEnabled(true);
			toast.success(t("permissions.create_success", "Permission skapad!"));
		},
		onError: () => {
			setOpen(false);
			setSubmitEnabled(true);
			toast.error(
				t("permissions.create_error", "Kunde inte skapa permission."),
			);
		},
	});

	function onSubmit(values: z.infer<typeof permissionSchema>) {
		setSubmitEnabled(false);
		createPermission.mutate({
			body: {
				action: values.action,
				target: values.target,
			},
		});
	}

	return (
		<div className="p-3">
			<Button
				onClick={() => {
					permissionForm.reset();
					setOpen(true);
					setSubmitEnabled(true);
				}}
			>
				{t("permissions.submit", "Skapa permission")}
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl">
					<DialogHeader>
						<DialogTitle>
							{t("permissions.title", "Skapa permission")}
						</DialogTitle>
					</DialogHeader>
					<hr />
					<Form {...permissionForm}>
						<form
							onSubmit={permissionForm.handleSubmit(onSubmit)}
							className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
						>
							<FormField
								control={permissionForm.control}
								name="action"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("permissions.action", "Action")}</FormLabel>
										<Select value={field.value} onValueChange={field.onChange}>
											<SelectTrigger>
												<SelectValue
													placeholder={t("permissions.action", "Action")}
												/>
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="view">view</SelectItem>
												<SelectItem value="manage">manage</SelectItem>
												<SelectItem value="super">super</SelectItem>
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>
							<FormField
								control={permissionForm.control}
								name="target"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("permissions.target", "Target")}</FormLabel>
										<Select value={field.value} onValueChange={field.onChange}>
											<SelectTrigger>
												<SelectValue
													placeholder={t("permissions.target", "Target")}
												/>
											</SelectTrigger>
											<SelectContent>
												{permissionSchema.shape.target.options.map((tgt) => (
													<SelectItem key={tgt} value={tgt}>
														{tgt}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>
							<div className="space-x-2 lg:col-span-2 lg:grid-cols-subgrid">
								<Button
									type="submit"
									disabled={!submitEnabled}
									className="w-32 min-w-fit"
								>
									{t("permissions.publish", "Publicera")}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
