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
		<FormItem className={cn("flex flex-col items-start space-y-0", className)}>
			{/* Ugly hack to properly align checkbox item with other form elements (that have their form labels above).
			div will stay at height 0 on rows containing just checkboxes (i.e. where parent isn't stretched taller than the FormLabel requires),
			and will grow to at most the max-h below (take a deep breath). Should be equivalent to one line of normal FormLabel text.
			Someone with more of a soul could probably find a neater way to fix this. I do not have a soul. */}
			<div className="w-full max-h-[calc(var(--text-sm)+2*var(--spacing)+2px)] basis-0 grow" />{" "}
			<FormLabel
				className="min-h-[38px] w-full flex items-center gap-3 px-3 py-1 rounded-md text-sm font-normal border 
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
