"use client";

import { cn } from "@/lib/utils";
import type { JSX, ReactElement } from "react";

interface AdminFormSectionDividerProps {
	title: string | ReactElement;
	className?: string;
}

export function AdminFormSectionDivider({
	title,
	className = undefined,
}: AdminFormSectionDividerProps) {
	return (
		<div
			className={cn(
				"mt-3 flex gap-4 items-center whitespace-nowrap",
				className,
			)}
		>
			{typeof title === "string" ? <h3>{title}</h3> : title}
			<hr className="w-full border-t-border dark:border-border" />
		</div>
	);
}
