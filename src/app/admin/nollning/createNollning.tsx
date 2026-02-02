import {
	getAllNollningQueryKey,
	postNollningMutation,
} from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import {
	DialogClose,
	DialogContent,
	DialogHeader,
} from "@/components/ui/dialog";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const nollningSchema = z.object({
	name: z.string().min(1),
	description: z.string().min(1),
	year: z.coerce.number().min(1960).max(2100),
});

const CreateNollning = () => {
	const [open, setOpen] = useState(false);
	const { t } = useTranslation("admin");

	const nollningForm = useForm<z.infer<typeof nollningSchema>>({
		resolver: zodResolver(nollningSchema),
		defaultValues: {
			name: "",
			description: "",
			year: new Date().getFullYear(),
		},
	});

	const queryClient = useQueryClient();

	const createNollning = useMutation({
		...postNollningMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getAllNollningQueryKey() });
			toast.success(t("nollning.main.create_success"));
			setOpen(false);
		},
		onError: () => {
			toast.error(t("nollning.main.create_error"));
			setOpen(false);
		},
	});

	function onSubmit(values: z.infer<typeof nollningSchema>) {
		createNollning.mutate({
			body: {
				name: values.name,
				description: values.description,
				year: values.year,
			},
		});
	}

	return (
		<div>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button
						onClick={() => {
							nollningForm.reset();
						}}
					>
						<Plus />
						{t("nollning.main.create_button")}
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-3xl py-3 font-bold text-primary">
							{t("nollning.main.create_title")}
						</DialogTitle>
					</DialogHeader>
					<Form {...nollningForm}>
						<form onSubmit={nollningForm.handleSubmit(onSubmit)}>
							<div className="px-8 space-x-4 space-y-4">
								<FormField
									control={nollningForm.control}
									name={"name"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("nollning.main.name")}</FormLabel>
											<FormControl>
												<Input
													placeholder={t("nollning.main.name_placeholder")}
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={nollningForm.control}
									name={"year"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("nollning.main.year")}</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder={t("nollning.main.year_placeholder")}
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={nollningForm.control}
									name={"description"}
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("nollning.main.description")}</FormLabel>
											<FormControl>
												<textarea
													className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
													placeholder={t(
														"nollning.main.description_placeholder",
													)}
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<Button
									type="submit"
									className="w-32 min-w-fit"
									disabled={createNollning.isPending}
								>
									{createNollning.isPending
										? t("nollning.main.creating")
										: t("nollning.main.create")}
								</Button>
								<DialogClose>{t("nollning.main.cancel")}</DialogClose>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default CreateNollning;
