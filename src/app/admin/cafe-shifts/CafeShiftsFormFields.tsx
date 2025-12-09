import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { AdminChooseDates } from "@/widgets/AdminChooseDates";
import { SelectFromOptions } from "@/widgets/SelectFromOptions";
import { Suspense, useEffect, useRef, useState } from "react";
import type { UseFormReturn, Path, PathValue } from "react-hook-form";
import { useTranslation } from "react-i18next";
import SearchResults from "@/components/userSearchResults";
import { Button } from "@/components/ui/button";
import type { UserRead } from "@/api";
import { X } from "lucide-react";

// Base fields for cafe shifts
interface CafeShiftFormFieldsBase {
	user_id?: number | null;
}

// Field mappings for calendar forms (which use start/end instead of starts_at/ends_at)
interface CalendarShiftFields extends CafeShiftFormFieldsBase {
	start?: Date; // Maps to starts_at
	end?: Date; // Maps to ends_at
}

// Field mappings for admin forms
interface AdminShiftFields extends CafeShiftFormFieldsBase {
	starts_at?: Date;
	ends_at?: Date;
}

// Combined type that works for both form patterns
type ShiftFormCompatible = (CalendarShiftFields | AdminShiftFields) &
	Record<string, unknown>;

interface CafeShiftFormFieldsProps<T extends ShiftFormCompatible> {
	shiftsForm: UseFormReturn<T>;
	disabledFields?: string[];
}

export default function CafeShiftFormFields<T extends ShiftFormCompatible>({
	shiftsForm,
	disabledFields = [],
}: CafeShiftFormFieldsProps<T>) {
	const { t } = useTranslation();
	const [nameFilter, setNameFilter] = useState("");
	const [resultsOpen, setResultsOpen] = useState(false);
	const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
	const popoverRef = useRef<HTMLDivElement>(null);

	// Add derived open state for the Popover
	const isPopoverOpen = selectedUserId === null && resultsOpen;

	const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
		// Check if focus is moving to an element inside the popover
		if (
			popoverRef.current &&
			!popoverRef.current.contains(event.relatedTarget)
		) {
			setTimeout(() => setResultsOpen(false), 200);
		}
	};

	// Helper to check if a field exists in the form values
	const hasField = (fieldName: string): boolean => {
		return fieldName in shiftsForm.getValues();
	};

	const onRowClick = (user: UserRead) => {
		setNameFilter(`${user.first_name} ${user.last_name}`);
		setSelectedUserId(user.id);
		setResultsOpen(false);
		shiftsForm.setValue(
			"user_id" as Path<T>,
			user.id as PathValue<T, Path<T>>,
			{
				shouldDirty: true,
				shouldValidate: true,
			},
		);
	};

	const clearSelectedUser = () => {
		setNameFilter("");
		setSelectedUserId(null);
		shiftsForm.setValue("user_id" as Path<T>, null as PathValue<T, Path<T>>, {
			shouldDirty: true,
			shouldValidate: true,
		});
		setResultsOpen(false);
	};

	useEffect(() => {
		const userId = shiftsForm.getValues("user_id" as Path<T>);
		const userName = shiftsForm.getValues("user_name" as Path<T>);
		if (userId !== null) {
			setSelectedUserId(userId as number | null);
			setNameFilter(userName as string);
			setResultsOpen(false);
		}
	}, [shiftsForm]);

	// Determine if we're using start/end or starts_at/ends_at pattern
	const useStartFormat = hasField("start");
	const startFieldName = useStartFormat ? "start" : "starts_at";
	const endFieldName = useStartFormat ? "end" : "ends_at";

	return (
		<div className="w-full grid gap-x-4 gap-y-3 lg:grid-cols-2 mt-4">
			{!disabledFields.includes("user_id") && (
				<FormField
					control={shiftsForm.control}
					name={"user_id" as Path<T>}
					render={({ field }) => (
						<FormItem className="lg:col-span-2">
							<FormLabel>{t("admin:cafe_shifts.assigned_user")}</FormLabel>
							<FormControl>
								<div className="w-full max-w-sm relative">
									<Popover
										open={isPopoverOpen}
										onOpenChange={(open) => {
											if (selectedUserId === null) setResultsOpen(open);
										}}
									>
										<PopoverTrigger asChild>
											<div className="flex items-center">
												<Input
													className="bg-white"
													placeholder={t(
														"admin:nollning.group_members.search_user_placeholder",
													)}
													value={nameFilter}
													onChange={(e) => {
														setNameFilter(e.target.value);
														if (!resultsOpen && e.target.value.length > 0) {
															setResultsOpen(true);
														}
														setSelectedUserId(null);
														shiftsForm.setValue(
															"user_id" as Path<T>,
															null as PathValue<T, Path<T>>,
															{
																shouldDirty: true,
																shouldValidate: true,
															},
														);
													}}
													onFocus={() => {
														if (nameFilter.length > 0 && !selectedUserId) {
															setResultsOpen(true);
														}
													}}
													onBlur={handleBlur}
													disabled={selectedUserId !== null}
													autoComplete="off"
												/>
												{selectedUserId !== null && (
													<button
														type="button"
														className="absolute right-2"
														onClick={clearSelectedUser}
														tabIndex={0}
														aria-label={t("common:clear")}
													>
														<X className="w-4 h-4 text-destructive-foreground bg-destructive rounded" />
													</button>
												)}
											</div>
										</PopoverTrigger>
										<PopoverContent
											ref={popoverRef}
											onOpenAutoFocus={(e) => e.preventDefault()}
											className="p-0"
										>
											<Suspense
												fallback={
													<div className="p-4">
														<Button
															variant="ghost"
															className="w-full justify-start"
															disabled
														>
															{t("admin:nollning.group_members.searching")}
														</Button>
													</div>
												}
											>
												<SearchResults
													nameFilter={nameFilter}
													programFilter={null}
													startYearFilter={null}
													excludedFromSearch={null}
													onRowClick={(user: UserRead) => onRowClick(user)}
												/>
											</Suspense>
										</PopoverContent>
									</Popover>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			)}
			<FormField
				control={shiftsForm.control}
				name={startFieldName as Path<T>}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("admin:cafe_shifts.start_time")}</FormLabel>
						<AdminChooseDates
							value={field.value as Date}
							onChange={(newStart: Date) => {
								field.onChange(newStart);
								const endValue = shiftsForm.getValues(endFieldName as Path<T>);
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
										newStart.getTime() + 2 * 60 * 60 * 1000, // Default 2 hour shift
									);
									shiftsForm.setValue(
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
				control={shiftsForm.control}
				name={endFieldName as Path<T>}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("admin:cafe_shifts.end_time")}</FormLabel>
						<AdminChooseDates
							value={field.value as Date}
							onChange={field.onChange}
						/>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	);
}
