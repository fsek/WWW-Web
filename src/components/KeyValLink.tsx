"use client";

// Like the ruling doc link but more generic.

import { getKeyvalsOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { ReactNode } from "react";

type KeyValLinkKey = `link_${string}`;
type KeyValLinks = Partial<Record<KeyValLinkKey, string>>;

type KeyValLinkProps = {
	linkKey: KeyValLinkKey;
	children?: ReactNode;
	className?: string;
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
	linkKey,
	children,
	className,
}: KeyValLinkProps) {
	const { data } = useQuery({
		...getKeyvalsOptions(),
	});

	const links = (data ?? []).reduce<KeyValLinks>((acc, keyval) => {
		if (keyval.key.startsWith("link_")) {
			acc[keyval.key as KeyValLinkKey] = keyval.value;
		}

		return acc;
	}, {});

	// const primaryHref = getSaferHref(rulingDocs[linkKey]);
	// // Most likely people will be lazy with adding English versions of documents,
	// // so we can try to fall back to the Swedish version if the English one is missing.
	// const fallbackKey = linkKey.endsWith("_en")
	// 	? (docKey.slice(0, -3) as RulingDocKey)
	// 	: null;
	// const fallbackHref = fallbackKey
	// 	? getSaferHref(rulingDocs[fallbackKey])
	// 	: null;
	// const href = primaryHref ?? fallbackHref;
	// // If there's no primary href but there is a fallback
	// const usesSwedishFallback =
	// 	!primaryHref && !!fallbackHref && fallbackHref !== "";
	const href = getSaferHref(links[linkKey]);

	if (!href) {
		return (
			<span className="text-red-700" title={`Saknar nyckel ${linkKey}`}>
				{children}
			</span>
		);
	}

	return (
		<Link
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className={className}
		>
			{children}
			{/* {usesSwedishFallback ? " (in Swedish)" : ""} */}
		</Link>
	);
}
