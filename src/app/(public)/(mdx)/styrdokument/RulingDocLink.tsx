"use client";

import { getKeyvalsOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";

type RulingDocKey = `ruling_doc_${string}`;
type RulingDocs = Partial<Record<RulingDocKey, string>>;

type RulingDocLinkProps = {
	docKey: RulingDocKey;
	children: ReactNode;
};

export default function RulingDocLink({
	docKey,
	children,
}: RulingDocLinkProps) {
	const { data } = useQuery({
		...getKeyvalsOptions(),
	});

	const rulingDocs = (data ?? []).reduce<RulingDocs>((acc, keyval) => {
		if (keyval.key.startsWith("ruling_doc_")) {
			acc[keyval.key as RulingDocKey] = keyval.value;
		}

		return acc;
	}, {});

	const href = rulingDocs[docKey];

	if (!href) {
		return <>{children}</>;
	}

	return (
		<a href={href} target="_blank" rel="noopener noreferrer">
			{children}
		</a>
	);
}
