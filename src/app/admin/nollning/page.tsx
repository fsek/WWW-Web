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
			<div className="px-12 py-4 space-x-4 space-y-4 w-[1000px]">
				<h3 className="text-3xl py-3 underline underline-offset-4">
					Administrera Nollningar
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
