export default function CouncilsLayout({
	children,
}: { children: React.ReactNode }) {
	// This is a good place to change default prose styles
	// You can make the content expand maximally with max-w-none
	return (
		<div className="prose dark:prose-invert mx-auto max-w-none w-5/6">
			{children}
		</div>
	);
}
