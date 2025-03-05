import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex items-center justify-center min-h-screen bg-background text-foreground">
			<section className="text-center">
				<h1 className="mb-4 text-7xl font-extrabold tracking-tight lg:text-9xl text-primary">
					404
				</h1>
				<p className="mb-4 text-3xl font-bold md:text-4xl">Ånej!</p>
				<p className="mb-4 text-lg font-light text-muted-foreground">
					Sidan hittades inte. Om du tror att något är fel,{" "}
					<a
						href="mailto:spindelman@fsektionen.se"
						className="inline-flex text-forange hover:bg-primary hover:text-white"
					>
						kontakta din lokala spindelman
					</a>
					.
				</p>
				<p className="mb-4 text-lg font-light text-muted-foreground">
					<i>"Ett sätt är ju att inte göra det alls och ge upp."</i> - TP{" "}
				</p>
				<Link
					href="/"
					className="inline-flex text-white bg-primary hover:bg-primary/80 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-primary-900"
				>
					Tillbaka till hemsidan
				</Link>
			</section>
		</div>
	);
}
