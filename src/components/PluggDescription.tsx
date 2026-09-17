import { cn } from "@/lib/utils";
import Markdown from "react-markdown";
import rehypeMathjax from "rehype-mathjax";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

export default function PluggDescription({
	text,
	fallback,
	className,
}: {
	text: string | null | undefined;
	fallback: string;
	className?: string;
}) {
	if (!text?.trim()) {
		return (
			<p className={cn("text-base text-muted-foreground", className)}>
				{fallback}
			</p>
		);
	}

	return (
		<div
			className={cn(
				"prose max-w-[68ch] leading-[1.65] prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-a:text-foreground prose-a:decoration-primary prose-a:decoration-2 prose-a:underline-offset-4 md:prose-lg dark:prose-invert",
				className,
			)}
		>
			<Markdown
				remarkPlugins={[remarkGfm, remarkMath]}
				rehypePlugins={[rehypeMathjax]}
			>
				{text}
			</Markdown>
		</div>
	);
}
