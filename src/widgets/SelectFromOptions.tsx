import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function SelectFromOptions({
	options,
	value,
	onChange,
	placeholder = "Select an option",
	className = "w-full",
	isDisabled = false,
}: {
	options: { value: string; label?: string }[];
	value?: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	isDisabled?: boolean;
}) {
	return (
		<Select
			value={value}
			onValueChange={(option) => onChange(option ?? "")}
			disabled={isDisabled}
		>
			<SelectTrigger
				className={cn(
					"mt-0 mb-0 transition-all border-border hover:border-ring dark:bg-input/30 dark:border-border dark:hover:border-ring",
					className,
				)}
			>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{options.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label ?? option.value}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
