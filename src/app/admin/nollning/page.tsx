"use client";

import { getAllNollningOptions } from "@/api/@tanstack/react-query.gen";
import { Accordion } from "@radix-ui/react-accordion";
import { useSuspenseQuery } from "@tanstack/react-query";
import React, { Suspense } from "react";
import CreateNollning from "./createNollning";
import NollningAccordionItem from "./nollningAccordionItem";

const Nollning = () => {
	const { data } = useSuspenseQuery({
		...getAllNollningOptions(),
	});

	return (
		<Suspense fallback={<div>{"Nollningar kunde inte hämtas"}</div>}>
			<div className="px-12 py-4 space-x-4 space-y-4">
				<h3 className="text-3xl py-3 text-primary font-bold">
					Administrera Nollningar
				</h3>
				<CreateNollning />
				<Accordion
					className="w-full border rounded-md"
					type="single" // Only one item can be expanded at a time
					collapsible
					// Open the first item by default
					defaultValue={data.length > 0 ? data[0].id.toString() : undefined}
				>
					{data.sort((a, b) => b.year - a.year).map((nollning) => { // Newer first
						return (
							<NollningAccordionItem key={nollning.id} nollning={nollning} />
						);
					})}
				</Accordion>
			</div>
		</Suspense>
	);
};

export default Nollning;
