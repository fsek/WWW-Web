"use client";

import ImageDisplay from "@/components/ImageDisplay";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Fragment } from "react";
import {
	pluggDisplay,
	pluggGraphPaper,
	pluggHighlight,
} from "@/utils/pluggStyles";

export type PluggBreadcrumb = {
	label: string;
	href: string;
};

type PluggHeroProps = {
	title: string;
	// Short identifier set large above the title, e.g. a course code
	code?: string | null;
	// Context line under the breadcrumbs, e.g. the parent program
	context?: string | null;
	imageId: number | null;
	breadcrumbs: Array<PluggBreadcrumb>;
	meta?: Array<string>;
};

export default function PluggHero({
	title,
	code,
	context,
	imageId,
	breadcrumbs,
	meta = [],
}: PluggHeroProps) {
	const heading = (
		<div className="min-w-0">
			{context ? (
				<p className="mb-3 text-base text-muted-foreground md:text-lg">
					{context}
				</p>
			) : null}
			<h1 className="min-w-0">
				{code ? (
					<span
						className={`${pluggDisplay} mb-3 block text-6xl tabular-nums sm:text-7xl md:text-8xl`}
					>
						<span className={pluggHighlight}>{code}</span>
					</span>
				) : null}
				<span
					className={cn(
						"block text-balance",
						code
							? "text-2xl font-semibold leading-tight tracking-tight md:text-4xl"
							: `${pluggDisplay} text-5xl sm:text-6xl md:text-7xl`,
					)}
				>
					{title}
				</span>
			</h1>
		</div>
	);

	return (
		<section className="relative isolate">
			<div
				aria-hidden="true"
				className={`${pluggGraphPaper} absolute inset-0 -z-10 opacity-70`}
			/>

			<div className="mx-auto w-full max-w-6xl px-4 pt-8 md:px-6 md:pt-12">
				<nav aria-label="Breadcrumb">
					<ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
						{breadcrumbs.map((crumb) => (
							<Fragment key={crumb.href}>
								<li>
									<Link
										href={crumb.href}
										className="rounded-sm underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
									>
										{crumb.label}
									</Link>
								</li>
								<li aria-hidden="true">/</li>
							</Fragment>
						))}
						<li
							aria-current="page"
							className="min-w-0 truncate text-foreground"
						>
							{title}
						</li>
					</ol>
				</nav>

				{imageId ? null : (
					<div className="pt-10 pb-8 md:pt-16 md:pb-10">{heading}</div>
				)}
			</div>

			{imageId ? (
				<div className="mx-auto w-full max-w-6xl md:px-6">
					<div className="relative mt-6 aspect-[4/3] overflow-hidden bg-muted sm:aspect-[16/9] md:mt-8 md:rounded-t-md lg:aspect-[12/5]">
						<ImageDisplay
							type="associated_img"
							imageId={imageId}
							alt=""
							className="object-cover"
							size="large"
							sizes="(min-width: 1152px) 1152px, 100vw"
							fill
							priority
						/>
					</div>
					{/* A paper label stuck onto the photo, straddling the divider */}
					<div className="relative border-t-4 border-primary">
						<div className="-mt-12 mr-8 w-fit max-w-3xl bg-background px-4 pt-4 pb-2 sm:-mt-16 md:-mt-20 md:mr-0 md:pr-12 md:pl-0 md:pt-8">
							{heading}
						</div>
					</div>
				</div>
			) : null}

			<div className="mx-auto w-full max-w-6xl px-4 md:px-6">
				<div
					className={cn(
						"flex flex-wrap items-center gap-x-8 gap-y-2 py-3 text-sm text-muted-foreground",
						!imageId && "border-t-4 border-primary",
					)}
				>
					{meta.map((item) => (
						<span key={item} className="tabular-nums">
							{item}
						</span>
					))}
				</div>
			</div>
		</section>
	);
}
