import { useState, useEffect } from "react";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AdminChooseCouncil } from "@/widgets/AdminChooseCouncil";
import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import { SelectFromOptions } from "@/widgets/SelectFromOptions";
import { TabsList } from "@/components/ui/tabs";
import type { UseFormReturn, Path, PathValue } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TriangleAlert } from "lucide-react";


// Common base fields expected by the form component
interface RoomBookingFormFieldsBase {
	room?: "LC" | "Alumni" | "SK";
	description_sv?: string;
	council_id?: number;
	recur_interval_days?: number; // 0 for no recurrence, 7 for weekly, etc.
	recur_until?: Date; // Date until which the recurrence applies
}

// Field mappings for calendar forms (which use start/end instead of start_time/end_time)
interface CalendarRoomBookingFields extends RoomBookingFormFieldsBase {
	start?: Date; // Maps to start_time
	end?: Date; // Maps to end_time
}

// Field mappings for admin forms
interface AdminRoomBookingFields extends RoomBookingFormFieldsBase {
	start_time?: Date;
	end_time?: Date;
}

// Combined type that works for both form patterns
type RoomBookingFormCompatible = (CalendarRoomBookingFields | AdminRoomBookingFields) &
	Record<string, unknown>;

interface RoomBookingFormFieldsProps<T extends RoomBookingFormCompatible> {
	roomBookingForm: UseFormReturn<T>;
	checkboxFields: ReadonlyArray<Path<T>>;
	disabled_fields?: string[];
}

export default function RoomBookingFormFields<T extends RoomBookingFormCompatible>({
	roomBookingForm,
	checkboxFields,
	disabled_fields = [],
}: RoomBookingFormFieldsProps<T>) {
	const { t } = useTranslation();

	// Helper to check if a field exists in the form values
	const hasField = (fieldName: string): boolean => {
		return fieldName in roomBookingForm.getValues();
	};

	// Determine if we're using start/end or start_time/end_time pattern
	const useStartFormat = hasField("start");
	const startFieldName = useStartFormat ? "start" : "start_time";
	const endFieldName = useStartFormat ? "end" : "end_time";

	const recurInterval = roomBookingForm.watch("recur_interval_days" as Path<T>);
	const [useRecurrence, setUseRecurrence] = useState(
		!!recurInterval && recurInterval !== 0
	);

	// Keep local state in sync with form value
	useEffect(() => {
		if (recurInterval && recurInterval !== 0) {
			setUseRecurrence(true);
			// Set default recur_until if not set
			const recurUntil = roomBookingForm.getValues("recur_until" as Path<T>);
			if (!recurUntil) {
				const start =
					roomBookingForm.getValues(startFieldName as Path<T>) ||
					new Date();
				const defaultUntil = new Date(
					(start instanceof Date ? start : new Date(start as string)).getTime() +
					30 * 24 * 60 * 60 * 1000 // 30 days
				);
				roomBookingForm.setValue("recur_until" as Path<T>, defaultUntil as PathValue<T, Path<T>>);
			}
		} else {
			setUseRecurrence(false);
			roomBookingForm.setValue("recur_until" as Path<T>, undefined as PathValue<T, Path<T>>);
		}
	}, [recurInterval, roomBookingForm, startFieldName]);

	return (
		<>
			<Tabs defaultValue="basic" className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="basic">
						{t("admin:room_bookings.basic_info")}
					</TabsTrigger>
					<TabsTrigger value="datetime">
						{t("admin:room_bookings.date_time")}
					</TabsTrigger>
				</TabsList>

				<TabsContent
					value="basic"
					className="grid gap-x-4 gap-y-3 lg:grid-cols-2 mt-4"
				>
					{!disabled_fields.includes("room") && (
						<FormField
							control={roomBookingForm.control}
							name={"room" as Path<T>}
							render={({ field }) => {
								const options = [
									{ value: "LC", label: "Ledningscentralen" },
									{ value: "Alumni", label: "Alumni" },
									{ value: "SK", label: "Syster Kents" },
								];
								const selectedOption =
									options.find((opt) => opt.value === field.value) ?? options[0];
								return (
									<FormItem>
										<FormLabel>{t("admin:room_bookings.room")}</FormLabel>
										<SelectFromOptions
											options={options}
											value={selectedOption.value}
											onChange={(value) => field.onChange(value)}
											placeholder={t("admin:room_bookings.select_room")}
										/>
									</FormItem>
								);
							}}
						/>
					)}
					{!disabled_fields.includes("council_id") && (
						<FormField
							control={roomBookingForm.control}
							name={"council_id" as Path<T>}
							render={({ field }) => (
								<FormItem className="w-full">
									<FormLabel>{t("admin:room_bookings.council")}</FormLabel>
									<AdminChooseCouncil
										value={field.value as number}
										onChange={field.onChange}
									/>
								</FormItem>
							)}
						/>
					)}

					<FormField
						control={roomBookingForm.control}
						name={"description_sv" as Path<T>}
						render={({ field }) => (
							<FormItem className="lg:col-span-2">
								<FormLabel>{t("admin:room_bookings.description")}</FormLabel>
								<FormControl>
									<Textarea
										placeholder={t("admin:room_bookings.description")}
										className="max-h-36"
										{...field}
										value={(field.value as string) ?? ""}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
				</TabsContent>

				<TabsContent
					value="datetime"
					className="grid gap-x-4 gap-y-3 lg:grid-cols-2 mt-4"
				>
					<FormField
						control={roomBookingForm.control}
						name={startFieldName as Path<T>}
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("admin:room_bookings.start_time")}</FormLabel>
								<AdminChooseDates
									value={field.value as Date}
									onChange={(newStart: Date) => {
										field.onChange(newStart);
										const endValue = roomBookingForm.getValues(
											endFieldName as Path<T>,
										);
										if (
											endValue &&
											((endValue instanceof Date
												? endValue
												: typeof endValue === "string" ||
													typeof endValue === "number"
													? new Date(endValue)
													: null
											)?.getTime() ?? 0) < newStart.getTime()
										) {
											const newEnd = new Date(
												newStart.getTime() + 60 * 60 * 1000,
											);
											roomBookingForm.setValue(
												endFieldName as Path<T>,
												newEnd as PathValue<T, Path<T>>,
												{
													shouldDirty: true,
													shouldValidate: true,
												},
											);
										}
									}}
								/>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={roomBookingForm.control}
						name={endFieldName as Path<T>}
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("admin:room_bookings.end_time")}</FormLabel>
								<AdminChooseDates
									value={field.value as Date}
									onChange={field.onChange}
								/>
							</FormItem>
						)}
					/>

					{!disabled_fields.includes("recur_interval_days") && (
						<FormField
							control={roomBookingForm.control}
							name={"recur_interval_days" as Path<T>}
							render={({ field }) => {
								const showWarning = !!field.value;
								return (
									<FormItem className="lg:col-span-2">
										<FormControl>
											<FormLabel className="flex items-center gap-2">
												<SelectFromOptions
													options={[
														{ value: "0", label: t("admin:room_bookings.no_recurrence") },
														{ value: "7", label: t("admin:room_bookings.every_week") },
														{ value: "14", label: t("admin:room_bookings.every_two_weeks") },
														{ value: "30", label: t("admin:room_bookings.every_month") },
													]}
													value={field.value?.toString() ?? "0"}
													onChange={(value) => field.onChange(Number(value))}
													placeholder={t("admin:room_bookings.recurrence")}
												/>
											</FormLabel>
										</FormControl>
										{showWarning && (
											<div className="text-sm text-foreground bg-amber-400 dark:bg-yellow-900 rounded px-2 py-1 mt-2">
												<TriangleAlert className="inline px-1" />
												{t("admin:room_bookings.recurrence_warning")}
											</div>
										)}
									</FormItem>
								);
							}}
						/>
					)}
					{!disabled_fields.includes("recur_until") && (
						<FormField
							control={roomBookingForm.control}
							name={"recur_until" as Path<T>}
							render={({ field }) => (
								<FormItem className="lg:col-span-2">
									<FormControl>
										<FormLabel>{t("admin:room_bookings.recurrence_end")}
											<AdminChooseDates
												value={field.value as Date}
												onChange={field.onChange}
												disabled={!useRecurrence}
											/>
										</FormLabel>
									</FormControl>
								</FormItem>
							)}
						/>
					)}

				</TabsContent>
			</Tabs>
		</>
	);
}