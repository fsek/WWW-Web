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

	console.log(checkboxFields);

	// Helper to check if a field exists in the form values
	const hasField = (fieldName: string): boolean => {
		return fieldName in eventsForm.getValues();
	};

	// Determine if we're using start/end or starts_at/ends_at pattern
	const useStartFormat = hasField("start");
	const startFieldName = useStartFormat ? "start" : "starts_at";
	const endFieldName = useStartFormat ? "end" : "ends_at";

	return (
		<>
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
				name={"description_sv" as Path<T>}
				render={({ field }) => (
					<FormItem className="lg:col-span-2">
						<FormLabel>{t("admin:events.description_sv")}</FormLabel>
						<FormControl>
							<Textarea
								placeholder={t("admin:events.description_sv")}
								className="max-h-36"
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
					<FormItem className="lg:col-span-2">
						<FormLabel>{t("admin:events.description_en")}</FormLabel>
						<FormControl>
							<Textarea
								placeholder={t("admin:events.description_en")}
								className="max-h-36"
								{...field}
								value={(field.value as string) ?? ""}
							/>
						</FormControl>
					</FormItem>
				)}
			/>
		</>
	);
}
