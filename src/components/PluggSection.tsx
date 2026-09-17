import type { ReactNode } from "react";
import { pluggDisplay } from "@/utils/pluggStyles";

export default function PluggSection({
	title,
	count,
	emptyText,
	children,
}: {
	title: string;
	count: number;
	emptyText: string;
	children: ReactNode;
}) {
	return (
		<section>
			<h2 className={`${pluggDisplay} pb-4 text-4xl md:text-5xl`}>{title}</h2>

			{count === 0 ? (
				<p className="border-y border-border py-6 text-muted-foreground">
					{emptyText}
				</p>
			) : (
				<ul className="divide-y divide-border border-y border-foreground/80">
					{children}
				</ul>
			)}
		</section>
	);
}
