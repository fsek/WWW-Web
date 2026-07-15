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
import AdminChoosePriorities from "@/widgets/AdminChoosePriorities";
import { SelectFromOptions } from "@/widgets/SelectFromOptions";
import { Checkbox } from "@/components/ui/checkbox";
import { TabsList } from "@/components/ui/tabs";
import type { UseFormReturn, Path } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import StyledCreatableSelect from "@/components/StyledCreatableSelect";
import AdminChooseMentorGroupTypes from "@/widgets/AdminChooseMentorGroupType";
import { Container } from "lucide-react";
import { useState } from "react";

const LOCATIONS = {
	MH: "MH",
	Victoriastadion: "Victoriastadion",
	"Hilbert Café": "Hilbert Café",
	Loftet: "Loftet",
	Gasquesalen: "Gasquesalen",
	Ledningscentralen: "Ledningscentralen",
};

const DRESS_CODES = {
	Overall: "Overall",
	Temaenligt: "Temanligt",
	Kavaj: "Kavaj",
	"Mörk kostym": "Mörk kostym",
	"Frack/Högtidsklädsel M.A.O.": "Frack/Högtidsklädsel M.A.O.",
};

// Common base fields expected by the form component
interface EventFormFieldsBase {
	title_sv?: string;
	title_en?: string;
	council_id?: number;
	description_sv?: string;
	description_en?: string;
	location?: string;
	max_event_users?: number;
	priorities?: string[];
	alcohol_event_type?: "Alcohol" | "Alcohol-Served" | "None";
	dress_code?: string;
	price?: number;
	dot?: "None" | "Single" | "Double";
}

// Field mappings for calendar forms (which use start/end instead of starts_at/ends_at)
interface CalendarEventFields extends EventFormFieldsBase {
	start?: Date; // Maps to starts_at
	end?: Date; // Maps to ends_at
	signup_start?: Date;
	signup_end?: Date;
	all_day?: boolean;
	recurring?: boolean;
	food?: boolean;
	closed?: boolean;
	can_signup?: boolean;
	drink_package?: boolean;
	is_nollning_event?: boolean;
	lottery?: boolean;
	personal?: boolean;
	confirmed?: boolean;
}

// Field mappings for admin forms
interface AdminEventFields extends EventFormFieldsBase {
	starts_at?: Date;
	ends_at?: Date;
	signup_start?: Date;
	signup_end?: Date;
	all_day?: boolean;
	recurring?: boolean;
	food?: boolean;
	closed?: boolean;
	can_signup?: boolean;
	drink_package?: boolean;
	is_nollning_event?: boolean;
	mentor_group_types?: ("Mentor" | "Mission" | "Default" | "Committee")[];
	allow_other_mentors?: boolean;
	lottery?: boolean;
}

// Combined type that works for both form patterns
type EventFormCompatible = (CalendarEventFields | AdminEventFields) &
	Record<string, unknown>;

interface EventFormFieldsProps<T extends EventFormCompatible> {
	eventsForm: UseFormReturn<T>;
	checkboxFields: ReadonlyArray<Path<T>>;
}

export default function EventFormFields<T extends EventFormCompatible>({
	eventsForm,
	checkboxFields,
}: EventFormFieldsProps<T>) {
	const { t } = useTranslation();

	const [allDay, setAllDay] = useState(
		eventsForm.getValues("all_day" as Path<T>) as boolean,
	);
	const [drinkPackageDisabled, setDrinkPackageDisabled] = useState(
		eventsForm.getValues("alcohol_event_type" as Path<T>) === "None",
	);
	const [signup, setSignup] = useState(
		eventsForm.getValues("can_signup" as Path<T>) as boolean,
	);
	const [nollning, setNollning] = useState(
		eventsForm.getValues("is_nollning_event" as Path<T>) as boolean,
	);

	// Helper to check if a field exists in the form values
	const hasField = (fieldName: string): boolean => {
		return fieldName in eventsForm.getValues();
	};

	// Determine if we're using start/end or starts_at/ends_at pattern
	const useStartFormat = hasField("start");
	const startFieldName = useStartFormat ? "start" : "starts_at";
	const endFieldName = useStartFormat ? "end" : "ends_at";

	return (
		<div className="grid gap-x-4 gap-y-3 lg:grid-cols-2 mt-4">
			<div className="grid gap-x-4 gap-y-3 auto-rows-min">
				<FormField
					control={eventsForm.control}
					name={"title_sv" as Path<T>}
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("admin:events.title_sv")}</FormLabel>
							<FormControl>
								<Input
									placeholder={t("admin:events.title_sv")}
									{...field}
									value={(field.value as string) ?? ""}
								/>
							</FormControl>
						</FormItem>
					)}
				/>
				<FormField
					control={eventsForm.control}
					name={"description_sv" as Path<T>}
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("admin:events.description_sv")}</FormLabel>
							<FormControl>
								<Textarea
									placeholder={t("admin:events.description_sv")}
									className="min-h-36"
									{...field}
									value={(field.value as string) ?? ""}
								/>
							</FormControl>
						</FormItem>
					)}
				/>
			</div>
			<div className="grid gap-x-4 gap-y-3 auto-rows-min">
				<FormField
					control={eventsForm.control}
					name={"title_en" as Path<T>}
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("admin:events.title_en")}</FormLabel>
							<FormControl>
								<Input
									placeholder={t("admin:events.title_en")}
									{...field}
									value={(field.value as string) ?? ""}
								/>
							</FormControl>
						</FormItem>
					)}
				/>

				<FormField
					control={eventsForm.control}
					name={"description_en" as Path<T>}
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("admin:events.description_en")}</FormLabel>
							<FormControl>
								<Textarea
									placeholder={t("admin:events.description_en")}
									className="min-h-36"
									{...field}
									value={(field.value as string) ?? ""}
								/>
							</FormControl>
						</FormItem>
					)}
				/>
			</div>
			<FormField
				control={eventsForm.control}
				name={"council_id" as Path<T>}
				render={({ field }) => (
					<FormItem className="lg:col-span-2">
						<FormLabel>{t("admin:events.council")}</FormLabel>
						<AdminChooseCouncil
							value={field.value as number}
							onChange={field.onChange}
						/>
					</FormItem>
				)}
			/>
			<FormField
				control={eventsForm.control}
				name={"location" as Path<T>}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("admin:events.location")}</FormLabel>
						<FormControl>
							<StyledCreatableSelect
								isClearable
								placeholder={t("admin:events.location_placeholder")}
								{...field}
								value={
									field.value
										? {
												label: String(field.value),
												value: String(field.value),
											}
										: null
								}
								onChange={(options) => {
									const vals = Array.isArray(options)
										? options.map((o) => o.value)
										: options && "value" in options
											? options.value
											: null;
									field.onChange(vals);
								}}
								options={Object.entries(LOCATIONS).map(([value, label]) => ({
									value: value,
									label: label,
								}))}
							/>
						</FormControl>
					</FormItem>
				)}
			/>
			<FormField
				control={eventsForm.control}
				name={"price" as Path<T>}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("admin:events.price")}</FormLabel>
						<FormControl>
							<Input
								type="number"
								{...field}
								value={(field.value as number) ?? 0}
							/>
						</FormControl>
					</FormItem>
				)}
			/>

			<hr className="lg:col-span-2 mt-4" />
			<h3 className="lg:col-span-2">{t("admin:events.date_time")}</h3>

			<div className="grid gap-x-1 grid-cols-3">
				<FormField
					control={eventsForm.control}
					name={startFieldName as Path<T>}
					render={({ field }) => (
						<FormItem className="col-span-2">
							<FormLabel>{t("admin:events.start_time")}</FormLabel>
							<AdminChooseDates
								value={field.value as Date}
								granularity={allDay ? "day" : "minute"}
								placeholder={t("admin:events.pick_date")}
								onChange={(newStart: Date) => {
									field.onChange(newStart);
									const endValue = eventsForm.getValues(
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
										eventsForm.setValue(
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
					control={eventsForm.control}
					name={"dot" as Path<T>}
					render={({ field }) => {
						const options = [
							{ value: "None", label: t("admin:events.dot_none") },
							{
								value: "Single",
								label: t("admin:events.dot_single"),
							},
							{
								value: "Double",
								label: t("admin:events.dot_double"),
							},
						];
						const selectedOption =
							options.find((opt) => opt.value === field.value) ?? options[0];
						return (
							<FormItem>
								<FormLabel className="whitespace-nowrap text-ellipsis overflow-hidden">
									{t("admin:events.select_dot")}
								</FormLabel>
								<SelectFromOptions
									options={options}
									value={selectedOption.value}
									isDisabled={allDay}
									onChange={(value) => field.onChange(value)}
								/>
							</FormItem>
						);
					}}
				/>
			</div>
			<FormField
				control={eventsForm.control}
				name={endFieldName as Path<T>}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("admin:events.end_time")}</FormLabel>
						<AdminChooseDates
							value={field.value as Date}
							placeholder={t("admin:events.pick_date")}
							granularity={allDay ? "day" : "minute"}
							onChange={field.onChange}
						/>
					</FormItem>
				)}
			/>

			<FormField
				control={eventsForm.control}
				name={"all_day" as Path<T>}
				render={({ field }) => (
					<Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-muted-foreground has-[[aria-checked=true]]:bg-accent">
						<Checkbox
							checked={field.value as boolean}
							onCheckedChange={(value) => {
								field.onChange(value);
								setAllDay(value as boolean);
							}}
							className="data-[state=checked]:border-[var(--wavelength-612-color-light)] data-[state=checked]:bg-[var(--wavelength-612-color-light)] data-[state=checked]:text-white"
						/>
						<div className="grid gap-1.5 font-normal">
							<p className="text-sm leading-none font-medium">
								{t(`admin:events.all_day`)}
							</p>
						</div>
					</Label>
				)}
			/>

			<FormField
				control={eventsForm.control}
				name={"recurring" as Path<T>}
				render={({ field }) => (
					<Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-muted-foreground has-[[aria-checked=true]]:bg-accent">
						<Checkbox
							checked={field.value as boolean}
							onCheckedChange={field.onChange}
							className="data-[state=checked]:border-[var(--wavelength-612-color-light)] data-[state=checked]:bg-[var(--wavelength-612-color-light)] data-[state=checked]:text-white"
						/>
						<div className="grid gap-1.5 font-normal">
							<p className="text-sm leading-none font-medium">
								{t(`admin:events.recurring`)}
							</p>
						</div>
					</Label>
				)}
			/>
			<hr className="lg:col-span-2 mt-4" />
			<h3 className="lg:col-span-2">{t("admin:events.settings")}</h3>
			<FormField
				control={eventsForm.control}
				name={"food" as Path<T>}
				render={({ field }) => (
					<Label className="lg:col-span-2 hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-muted-foreground has-[[aria-checked=true]]:bg-accent">
						<Checkbox
							checked={field.value as boolean}
							onCheckedChange={field.onChange}
							className="data-[state=checked]:border-[var(--wavelength-612-color-light)] data-[state=checked]:bg-[var(--wavelength-612-color-light)] data-[state=checked]:text-white"
						/>
						<div className="grid gap-1.5 font-normal">
							<p className="text-sm leading-none font-medium">
								{t(`admin:events.food`)}
							</p>
						</div>
					</Label>
				)}
			/>

			<FormField
				control={eventsForm.control}
				name={"alcohol_event_type" as Path<T>}
				render={({ field }) => {
					const options = [
						{
							value: "Alcohol",
							label: t("admin:events.alcohol"),
						},
						{
							value: "Alcohol-Served",
							label: t("admin:events.alcohol_served"),
						},
						{
							value: "None",
							label: t("admin:events.alcohol_none"),
						},
					];
					const selectedOption =
						options.find((opt) => opt.value === field.value) ?? options[2];
					return (
						<FormItem>
							<FormLabel>{t("admin:events.alcohol_event_type")}</FormLabel>
							<SelectFromOptions
								options={options}
								value={selectedOption.value}
								onChange={(value) => {
									field.onChange(value);
									if (value === "None") {
										setDrinkPackageDisabled(true);
										eventsForm.setValue(
											"drink_package" as Path<T>,
											false as any,
										);
									} else {
										setDrinkPackageDisabled(false);
									}
								}}
								placeholder={t("admin:events.select_alcohol_event_type")}
							/>
						</FormItem>
					);
				}}
			/>
			<FormField
				control={eventsForm.control}
				name={"drink_package" as Path<T>}
				render={({ field }) => (
					<Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-muted-foreground has-[[aria-checked=true]]:bg-accent">
						<Checkbox
							checked={field.value as boolean}
							onCheckedChange={field.onChange}
							disabled={drinkPackageDisabled}
							className="data-[state=checked]:border-[var(--wavelength-612-color-light)] data-[state=checked]:bg-[var(--wavelength-612-color-light)] data-[state=checked]:text-white"
						/>
						<div className="grid gap-1.5 font-normal">
							<p className="text-sm leading-none font-medium">
								{t(`admin:events.drink_package`)}
							</p>
						</div>
					</Label>
				)}
			/>
			<FormField
				control={eventsForm.control}
				name={"dress_code" as Path<T>}
				render={({ field }) => (
					<FormItem className="lg:col-span-2">
						<FormLabel>{t("admin:events.dress_code")}</FormLabel>
						<FormControl>
							<StyledCreatableSelect
								isClearable
								placeholder={t("admin:events.dress_code_placeholder")}
								{...field}
								value={
									field.value
										? {
												label: String(field.value),
												value: String(field.value),
											}
										: null
								}
								onChange={(options) => {
									const vals = Array.isArray(options)
										? options.map((o) => o.value)
										: options && "value" in options
											? options.value
											: null;
									field.onChange(vals);
								}}
								options={Object.entries(DRESS_CODES).map(([value, label]) => ({
									value: value,
									label: label,
								}))}
							/>
						</FormControl>
					</FormItem>
				)}
			/>
			<hr className="lg:col-span-2 mt-4" />
			<h3 className="lg:col-span-2">{t("admin:events.signup")}</h3>

			<FormField
				control={eventsForm.control}
				name={"max_event_users" as Path<T>}
				render={({ field }) => (
					<FormItem className="lg:col-span-2">
						<FormLabel>{t("admin:events.max_event_users")}</FormLabel>
						<FormControl>
							<Input
								type="number"
								placeholder={t("admin:events.max_event_users")}
								{...field}
								value={(field.value as number) ?? 0}
							/>
						</FormControl>
					</FormItem>
				)}
			/>
			<FormField
				control={eventsForm.control}
				name={"can_signup" as Path<T>}
				render={({ field }) => (
					<Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-muted-foreground has-[[aria-checked=true]]:bg-accent">
						<Checkbox
							checked={field.value as boolean}
							onCheckedChange={(value) => {
								field.onChange(value);
								setSignup(value as boolean);
							}}
							className="data-[state=checked]:border-[var(--wavelength-612-color-light)] data-[state=checked]:bg-[var(--wavelength-612-color-light)] data-[state=checked]:text-white"
						/>
						<div className="grid gap-1.5 font-normal">
							<p className="text-sm leading-none font-medium">
								{t(`admin:events.can_signup`)}
							</p>
						</div>
					</Label>
				)}
			/>
			<FormField
				control={eventsForm.control}
				name={"closed" as Path<T>}
				render={({ field }) => (
					<Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-muted-foreground has-[[aria-checked=true]]:bg-accent">
						<Checkbox
							checked={field.value as boolean}
							onCheckedChange={field.onChange}
							disabled={!signup}
							className="data-[state=checked]:border-[var(--wavelength-612-color-light)] data-[state=checked]:bg-[var(--wavelength-612-color-light)] data-[state=checked]:text-white"
						/>
						<div className="grid gap-1.5 font-normal">
							<p className="text-sm leading-none font-medium">
								{t(`admin:events.closed`)}
							</p>
						</div>
					</Label>
				)}
			/>
			<FormField
				control={eventsForm.control}
				name={"signup_start" as Path<T>}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("admin:events.signup_start")}</FormLabel>
						<AdminChooseDates
							value={field.value as Date}
							placeholder={t("admin:events.pick_date")}
							onChange={(newSignupStart: Date) => {
								field.onChange(newSignupStart);
								const signupEnd = eventsForm.getValues("signup_end" as Path<T>);
								if (
									signupEnd &&
									((signupEnd instanceof Date
										? signupEnd
										: typeof signupEnd === "string" ||
												typeof signupEnd === "number"
											? new Date(signupEnd)
											: null
									)?.getTime() ?? 0) < newSignupStart.getTime()
								) {
									const newSignupEnd = new Date(
										newSignupStart.getTime() + 60 * 60 * 1000,
									);
									eventsForm.setValue(
										"signup_end" as Path<T>,
										newSignupEnd as any,
										{
											shouldDirty: true,
											shouldValidate: true,
										},
									);
								}
							}}
							disabled={!signup}
						/>
					</FormItem>
				)}
			/>

			<FormField
				control={eventsForm.control}
				name={"signup_end" as Path<T>}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("admin:events.signup_end")}</FormLabel>
						<AdminChooseDates
							value={field.value as Date}
							placeholder={t("admin:events.pick_date")}
							onChange={field.onChange}
							disabled={!signup}
						/>
					</FormItem>
				)}
			/>

			<FormField
				control={eventsForm.control}
				name={"priorities" as Path<T>}
				render={({ field }) => (
					<FormItem className="lg:col-span-2 w-full">
						<FormLabel>{t("admin:events.priorities")}</FormLabel>
						<AdminChoosePriorities
							value={(field.value as string[]) ?? []}
							onChange={(value) => field.onChange(value)}
							className="text-sm"
							disabled={!signup}
						/>
					</FormItem>
				)}
			/>

			<hr className="lg:col-span-2 mt-4" />
			<h3 className="lg:col-span-2">{t("admin:events.nollning")}</h3>

			<FormField
				control={eventsForm.control}
				name={"is_nollning_event" as Path<T>}
				render={({ field }) => (
					<Label className="lg:col-span-2 hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-muted-foreground has-[[aria-checked=true]]:bg-accent">
						<Checkbox
							checked={field.value as boolean}
							onCheckedChange={(value) => {
								field.onChange(value);
								setNollning(value as boolean);
							}}
							className="data-[state=checked]:border-[var(--wavelength-612-color-light)] data-[state=checked]:bg-[var(--wavelength-612-color-light)] data-[state=checked]:text-white"
						/>
						<div className="grid gap-1.5 font-normal">
							<p className="text-sm leading-none font-medium">
								{t(`admin:events.is_nollning_event`)}
							</p>
						</div>
					</Label>
				)}
			/>

			<FormField
				control={eventsForm.control}
				name={"mentor_group_types" as Path<T>}
				render={({ field }) => (
					<FormItem className="w-full">
						<FormLabel>{t("admin:events.mentor_group_types")}</FormLabel>

						<AdminChooseMentorGroupTypes
							value={(field.value as string[]) ?? []}
							onChange={(value) => field.onChange(value)}
							className="text-sm"
							disabled={!nollning}
						/>
					</FormItem>
				)}
			/>

			<FormField
				control={eventsForm.control}
				name={"allow_other_mentors" as Path<T>}
				render={({ field }) => (
					<Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-muted-foreground has-[[aria-checked=true]]:bg-accent">
						<Checkbox
							checked={field.value as boolean}
							onCheckedChange={field.onChange}
							className="data-[state=checked]:border-[var(--wavelength-612-color-light)] data-[state=checked]:bg-[var(--wavelength-612-color-light)] data-[state=checked]:text-white"
							disabled={!nollning}
						/>
						<div className="grid gap-1.5 font-normal">
							<p className="text-sm leading-none font-medium">
								{t(`admin:events.allow_other_mentors`)}
							</p>
						</div>
					</Label>
				)}
			/>
		</div>
	);
}
