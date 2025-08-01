import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AdminChooseCouncil } from "@/widgets/AdminChooseCouncil";
import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import { SelectFromOptions } from "@/widgets/SelectFromOptions";
import { Checkbox } from "@/components/ui/checkbox";
import { TabsList } from "@/components/ui/tabs";
import type { UseFormReturn, Path } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

// Common base fields expected by the form component
interface RoomBookingFormFieldsBase {
	room?: "LC" | "Alumni" | "SK";
	description_sv?: string;
	council_id?: number;
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
							render={({ field }) => {
								const personalChecked = roomBookingForm.watch("personal" as Path<T>);
								return (
									<FormItem className="w-full">
										<FormLabel>{t("admin:room_bookings.council")}</FormLabel>
										{personalChecked ? (
											<div className="text-muted-foreground text-sm py-2">
												{t("admin:room_bookings.no_council_needed")}
											</div>
										) : (
											<AdminChooseCouncil
												value={field.value as number}
												onChange={field.onChange}
											/>
										)}
										<FormMessage />
									</FormItem>
								);
							}}
						/>
					)}

					{!disabled_fields.includes("personal") && (
						checkboxFields.map((fieldName) => (
							<FormField
								key={fieldName as string}
								control={roomBookingForm.control}
								name={fieldName}
								render={({ field }) => (
									<Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-muted-foreground has-[[aria-checked=true]]:bg-accent">
										<Checkbox
											checked={field.value as boolean}
											onCheckedChange={field.onChange}
											className="data-[state=checked]:border-[var(--wavelength-612-color-light)] data-[state=checked]:bg-[var(--wavelength-612-color-light)] data-[state=checked]:text-white"
										/>
										<div className="grid gap-1.5 font-normal">
											<p className="text-sm leading-none font-medium">
												{t(`admin:events.${fieldName as string}`)}
											</p>
										</div>
									</Label>
								)}
							/>
						))
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
												newEnd as any,
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
				</TabsContent>
			</Tabs>
		</>
	);
}