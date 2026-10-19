import Link from "next/link";

type FLinkProps = {
	children?: string;
	to?: string;
};

export function FLink({ children = "", to = undefined }: FLinkProps) {
	return (
		<Link
			className="underline text-primary hover:text-foreground transition-colors"
			href={to || children}
			target="_blank"
		>
			{children}
		</Link>
	);
}

export function FMail({ children = "", to = undefined }: FLinkProps) {
	return <FLink to={`mailto:${to || children}`}>{children}</FLink>;
}
