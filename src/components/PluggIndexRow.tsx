import { cn } from "@/lib/utils";
import stripMarkdown from "@/utils/stripMarkdown";
import Link from "next/link";
import { pluggDisplay, pluggHighlightHover } from "@/utils/pluggStyles";

type PluggIndexRowProps = {
	title: string;
	href: string;
	description: string | null;
	emptyDescriptionText: string;
	// Index key in the left column, e.g. a course code. Pass null to keep the
	// column (so rows stay aligned) when this entry has no code.
	code?: string | null;
};

// One entry in a plugg index list; render inside PluggSection
export default function PluggIndexRow({
	title,
	href,
	description,
	emptyDescriptionText,
	code,
}: PluggIndexRowProps) {
	const previewText = description ? stripMarkdown(description) : "";
	const hasCodeColumn = code !== undefined;

	return (
		<li>
			<Link
				href={href}
				className="group block py-4 outline-none focus-visible:bg-muted/60 md:py-5"
			>
				<span
					className={cn(
						"grid grid-cols-1 gap-x-8 gap-y-1",
						hasCodeColumn
							? "sm:grid-cols-[7.5rem_1fr] lg:grid-cols-[7.5rem_minmax(0,22rem)_1fr]"
							: "lg:grid-cols-[minmax(0,22rem)_1fr]",
					)}
				>
					{hasCodeColumn ? (
						<span
							className={`${pluggDisplay} text-2xl tabular-nums sm:text-3xl`}
						>
							{code || (
								<span aria-hidden="true" className="text-muted-foreground/60">
									-
								</span>
							)}
						</span>
					) : null}
					<span className="text-lg font-semibold leading-snug text-balance sm:self-center">
						<span className={pluggHighlightHover}>{title}</span>
					</span>
					<span
						className={cn(
							"line-clamp-2 text-sm leading-relaxed text-muted-foreground lg:self-center",
							hasCodeColumn && "sm:col-start-2 lg:col-start-3",
						)}
					>
						{previewText || emptyDescriptionText}
					</span>
				</span>
			</Link>
		</li>
	);
}
