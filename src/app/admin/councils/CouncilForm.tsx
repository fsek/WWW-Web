import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createCouncilMutation,
	getAllCouncilsQueryKey,
} from "@/api/@tanstack/react-query.gen";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

const councilSchema = z.object({
	name_sv: z.string().min(2),
	name_en: z.string().min(2),
	description_sv: z.string().nullable().optional(),
	description_en: z.string().nullable().optional(),
});

export default function CouncilForm() {
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);
	const { t } = useTranslation("admin");

	const councilForm = useForm<z.infer<typeof councilSchema>>({
		resolver: zodResolver(councilSchema),
		defaultValues: {
			name_sv: "",
			name_en: "",
			description_sv: "",
			description_en: "",
		},
	});

	const queryClient = useQueryClient();

	const createCouncil = useMutation({
		...createCouncilMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllCouncilsQueryKey() });
			toast.success(t("councils.create_success", "Utskottet har skapats"));
			setOpen(false);
			setSubmitEnabled(true);
		},
		onError: (error) => {
			toast.error(
				typeof error?.detail === "string"
					? error.detail
					: t("councils.create_error", "Kunde inte skapa utskott"),
			);
			setOpen(false);
			setSubmitEnabled(true);
		},
	});

	function onSubmit(values: z.infer<typeof councilSchema>) {
		setSubmitEnabled(false);
		createCouncil.mutate({
			body: {
				name_sv: values.name_sv,
				name_en: values.name_en,
				description_sv: values.description_sv,
				description_en: values.description_en,
			},
		});
	}

	return (
		<div className="p-3">
			<Button
				onClick={() => {
					councilForm.reset();
					setOpen(true);
					setSubmitEnabled(true);
				}}
			>
				<Plus />
				{t("councils.create_council", "Skapa utskott")}
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="min-w-fit lg:max-w-7xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{t("councils.create_council", "Skapa utskott")}
						</DialogTitle>
					</DialogHeader>
					<hr />
					<Form {...councilForm}>
						<form
							onSubmit={councilForm.handleSubmit(onSubmit)}
							className="grid gap-x-4 gap-y-3 lg:grid-cols-4"
						>
							<FormField
								control={councilForm.control}
								name="name_sv"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t("councils.name_sv", "Namn (svenska)")}
										</FormLabel>
										<FormControl>
											<Input
												placeholder={t(
													"councils.name_placeholder",
													"Utskottets namn",
												)}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={councilForm.control}
								name="name_en"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t("councils.name_en", "Name (English)")}
										</FormLabel>
										<FormControl>
											<Input
												placeholder={t(
													"councils.name_placeholder",
													"Council Name",
												)}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={councilForm.control}
								name="description_sv"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t("councils.description_sv", "Beskrivning (svenska)")}
										</FormLabel>
										<FormControl>
											<Textarea
												placeholder={t(
													"councils.description_sv",
													"Beskrivning (svenska)",
												)}
												{...field}
												value={field.value ?? ""}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={councilForm.control}
								name="description_en"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t("councils.description_en", "Description (English)")}
										</FormLabel>
										<FormControl>
											<Textarea
												placeholder={t(
													"councils.description_en",
													"Description (English)",
												)}
												{...field}
												value={field.value ?? ""}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<div className="space-x-2 lg:col-span-4 lg:grid-cols-subgrid">
								<Button
									type="submit"
									disabled={!submitEnabled}
									className="w-32 min-w-fit"
								>
									{t("councils.create", "Skapa utskott")}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
