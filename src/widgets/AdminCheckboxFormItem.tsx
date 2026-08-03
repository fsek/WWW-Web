"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
	FormControl,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

interface AdminCheckboxFormItemProps {
	label: string;
	checked: boolean | undefined;
	onCheckedChange: (value: boolean) => void;
	className?: string;
	disabled?: boolean;
}

export function AdminCheckboxFormItem({
	label,
	checked,
	onCheckedChange,
	className = undefined,
	disabled = false,
}: AdminCheckboxFormItemProps) {
	return (
		<FormItem className={cn("flex", className)}>
			<FormLabel
				className="min-h-[38px] w-full self-end flex items-center gap-3 px-3 py-1 rounded-md text-sm font-normal border 
 bg-background text-foreground
 border-border hover:border-ring dark:bg-input/30 dark:border-border dark:hover:border-ring shadow-xs
 has-aria-checked:border-muted-foreground has-aria-checked:bg-accent dark:has-aria-checked:bg-accent
 has-disabled:opacity-50 has-disabled:pointer-events-none
 cursor-pointer
 transition-all"
			>
				<FormControl>
					<Checkbox
						checked={checked}
						onCheckedChange={onCheckedChange}
						disabled={disabled}
						className="border-muted-foreground disabled:opacity-100 data-[state=checked]:border-(--wavelength-612-color-light) data-[state=checked]:bg-(--wavelength-612-color-light) data-[state=checked]:text-white dark:data-[state=checked]:text-primary-foreground"
					/>
				</FormControl>
				<span>{label}</span>
			</FormLabel>

			<FormMessage />
		</FormItem>
	);
}

// <FormLabel className="min-h-[38px] w-full self-end flex items-center gap-3 px-3 py-1 rounded-md hover:bg-accent/50 border has-aria-checked:border-muted-foreground has-aria-checked:bg-accent text-sm leading-none font-medium">
