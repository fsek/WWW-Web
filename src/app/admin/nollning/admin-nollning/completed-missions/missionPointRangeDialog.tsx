import type { AdventureMissionRead } from "@/api";
import { Button } from "@/components/ui/button";
import {
	DialogClose,
	DialogHeader,
	Dialog,
	DialogContent,
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
import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { is_accepted as acceptEnum } from "@/api";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface Props {
	title: string;
	open: boolean;
	onClose: () => void;
	defaultPoints?: number;
	maxPoints?: number;
	minPoints?: number;
	selectedMission: AdventureMissionRead;
	children?: React.ReactNode;
	onSubmit: (points: number, adventure_mission_id: number, is_accepted: acceptEnum) => void;
	defaultIsAccepted?: acceptEnum;
}

const MissionPointRangeDialog = ({
	title,
	open,
	selectedMission,
	defaultPoints = 0,
	maxPoints,
	minPoints,
	children,
	onSubmit,
	onClose,
	defaultIsAccepted = acceptEnum.ACCEPTED,
}: Props) => {

	const editCompletedMissionSchema = z.object({
		points: z.number().int(),
		is_accepted: z.nativeEnum(acceptEnum),
	}).refine((data) => {
		// Enforce point limitations
		if (maxPoints && data.points > maxPoints) {
			return false;
		}
		if (minPoints && data.points < minPoints) {
			return false;
		}
		return true;
	},
		{
			message: `Points must be between ${minPoints ?? 0} and ${maxPoints ?? "∞"}.`,
			path: ["points"]
		});

	const form = useForm<z.infer<typeof editCompletedMissionSchema>>({
		resolver: zodResolver(editCompletedMissionSchema),
		defaultValues: {
			points: 0,
			is_accepted: defaultIsAccepted,
		},
	});

	useEffect(() => {
		if (open) {
			form.reset({
				points: defaultPoints,
				is_accepted: defaultIsAccepted,
			});
		}
	}, [defaultPoints, defaultIsAccepted, form, open]);

	function handleSubmit(values: z.infer<typeof editCompletedMissionSchema>) {
		onSubmit(values.points, selectedMission.id, values.is_accepted);
		onClose();
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) {
					onClose();
				}
			}}
		>
			<DialogContent className="px-10 py-8">
				<DialogHeader>
					<DialogTitle className="text-3xl py-3 font-bold text-primary">
						{title}
					</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit, (error) =>
							console.log(error),
						)}
					>
						<div className="space-x-4 space-y-4">
							<FormField
								control={form.control}
								name={"points"}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Points </FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="0"
												{...field}
												onChange={(e) => field.onChange(e.target.valueAsNumber)}
											/>
										</FormControl>
										{form.formState.errors.points && (
											<p className="text-red-500 text-sm">
												{form.formState.errors.points.message}
											</p>
										)}
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name={"is_accepted"}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Status</FormLabel>
										<FormControl>
											<Select
												value={field.value}
												onValueChange={field.onChange}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value={acceptEnum.ACCEPTED}>Godkänd</SelectItem>
													<SelectItem value={acceptEnum.REVIEW}>Granskas</SelectItem>
													<SelectItem value={acceptEnum.FAILED}>Underkänd</SelectItem>
												</SelectContent>
											</Select>
										</FormControl>
									</FormItem>
								)}
							/>
							<Button type="submit" className="w-32 min-w-fit">
								Spara
							</Button>
							{children}
							<DialogClose>Avbryt</DialogClose>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default MissionPointRangeDialog;
