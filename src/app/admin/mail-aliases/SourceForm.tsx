import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { aliasCreateAliasMutation } from "@/api/@tanstack/react-query.gen";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export default function SourceForm() {
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);
	const { t } = useTranslation("admin");

	const aliasSchema = z.object({
		source: z
			.string()
			.email(t("mail_aliases.invalid_email"))
			.refine((val) => val.endsWith("@fsektionen.se"), {
				message: t("mail_aliases.invalid_domain"),
			}),
	});

	const aliasForm = useForm<z.infer<typeof aliasSchema>>({
		resolver: zodResolver(aliasSchema),
		defaultValues: {
			source: "",
		},
	});

	const createSource = useMutation({
		...aliasCreateAliasMutation(),
		onSuccess: () => {
			setOpen(false);
			setSubmitEnabled(true);
			toast.success(t("mail_aliases.create_source_success"));
		},
		onError: () => {
			setOpen(false);
			setSubmitEnabled(true);
			toast.error(t("mail_aliases.create_source_error"));
		},
	});

	function onSubmit(values: z.infer<typeof aliasSchema>) {
		setSubmitEnabled(false);
		createSource.mutate({
			query: { alias: values.source },
		});
	}

	return (
		<div className="p-3">
			<Button
				onClick={() => {
					aliasForm.reset();
					setOpen(true);
					setSubmitEnabled(true);
				}}
			>
				<Plus />
				{t("mail_aliases.create_source")}
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl">
					<DialogHeader>
						<DialogTitle>{t("mail_aliases.create_source")}</DialogTitle>
					</DialogHeader>
					<hr />
					<Form {...aliasForm}>
						<form
							onSubmit={aliasForm.handleSubmit(onSubmit)}
							className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
						>
							<FormField
								control={aliasForm.control}
								name="source"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("mail_aliases.source")}</FormLabel>
										<Input
											type="text"
											placeholder="alias@fsektionen.se"
											{...field}
										/>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="space-x-2 lg:col-span-2 lg:grid-cols-subgrid">
								<Button
									type="submit"
									disabled={!submitEnabled}
									className="w-32 min-w-fit"
								>
									{t("mail_aliases.create_source_confirm")}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
