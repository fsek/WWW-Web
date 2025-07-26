export default function MdxLayout({ children }: { children: React.ReactNode }) {
	// This is a good place to change default prose styles
	// You can make the content expand maximally with max-w-none
	return (
		<div className="prose dark:prose-invert mx-auto max-w-none w-full sm:w-5/6 sm:px-6 md:w-2/3 lg:w-1/2">
			{children}
		</div>
	);
}
