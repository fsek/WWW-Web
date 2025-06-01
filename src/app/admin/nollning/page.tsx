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
		<Suspense>
			<div className="px-8 space-x-4 space-y-4 w-full">
				<h3 className="text-xl px-8 py-3 underline underline-offset-4 decoration-sidebar">
					Nollningar
				</h3>
				<CreateNollning />
				<Accordion
					className="w-full border rounded-md"
					type="single"
					collapsible
				>
					{data.map((nollning) => {
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
