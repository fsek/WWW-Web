"use client";

import { getKeyvalsOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { ReactNode } from "react";

type RulingDocKey = `ruling_doc_${string}`;
type RulingDocs = Partial<Record<RulingDocKey, string>>;

type RulingDocLinkProps = {
	docKey: RulingDocKey;
	children: ReactNode;
};

function getSaferHref(rawHref?: string): string | null {
	if (!rawHref) {
		return null;
	}

	try {
		// fsektionen.se here is just a dummy url to make relative URLs work.
		const parsedUrl = new URL(rawHref, "https://fsektionen.se");
		const isSafeProtocol =
			parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:";

		if (!isSafeProtocol) {
			return null;
		}

		return rawHref;
	} catch {
		return null;
	}
}

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

	const primaryHref = getSaferHref(rulingDocs[docKey]);
	// Most likely people will be lazy with adding English versions of documents,
	// so we can try to fall back to the Swedish version if the English one is missing.
	const fallbackKey = docKey.endsWith("_en")
		? (docKey.slice(0, -3) as RulingDocKey)
		: null;
	const fallbackHref = fallbackKey
		? getSaferHref(rulingDocs[fallbackKey])
		: null;
	const href = primaryHref ?? fallbackHref;
	// If there's no primary href but there is a fallback
	const usesSwedishFallback =
		!primaryHref && !!fallbackHref && fallbackHref !== "";

	if (!href) {
		return (
			<span className="text-red-700" title={`Saknar nyckel ${docKey}`}>
				{children}
			</span>
		);
	}

	return (
		<Link href={href} target="_blank" rel="noopener noreferrer">
			{children}
			{usesSwedishFallback ? " (in Swedish)" : ""}
		</Link>
	);
}
