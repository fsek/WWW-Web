"use client";

import type React from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getImageStreamOptions,
	getImageOptions,
	getNewsImageOptions,
	getNewsImageStreamOptions,
} from "@/api/@tanstack/react-query.gen";
import Image from "next/image";
import type { ImageProps as NextImageProps } from "next/image";
import { Skeleton } from "./ui/skeleton";

export type ImageKind = "image" | "news" | "event" | "user";
export type ImageSize = "small" | "medium" | "large" | "original";

export interface ImageDisplayProps extends Omit<NextImageProps, "src" | "id"> {
	type: ImageKind;
	imageId: number;
	size?: ImageSize;
}

// Helpers to get original blob and actions using stream routes
export function useImageBlobActions(type: ImageKind, imageId?: number | null) {
	const queryClient = useQueryClient();

	// Build the stream query options for the original image
	const buildStreamOptions = useCallback(() => {
		const devMode = process.env.NEXT_PUBLIC_ENV === "development";
		if (!imageId) return null;
		switch (type) {
			case "news":
				if (devMode) {
					return getNewsImageStreamOptions({ path: { news_id: imageId } });
				}
				return getNewsImageOptions({
					path: { news_id: imageId, size: "original" },
				});
			// case "event":
			// case "user":
			default:
				if (devMode) {
					return getImageStreamOptions({ path: { img_id: imageId } });
				}
				return getImageOptions({ path: { img_id: imageId, size: "original" } });
		}
	}, [type, imageId]);

	// Fetch original as Blob and return a fresh object URL
	const getOriginalAsBlobUrl = useCallback(async () => {
		const opts = buildStreamOptions();
		if (!opts) throw new Error("No imageId provided");
		// Use the generated route queryFn to ensure auth and correct routing
		const data = await (queryClient.fetchQuery as any)(opts);

		let blob: Blob | null = null;
		if (typeof Blob !== "undefined" && data instanceof Blob) {
			blob = data;
		} else if (
			data &&
			(typeof (data as any).byteLength === "number" ||
				ArrayBuffer.isView(data as any))
		) {
			blob = new Blob([data as any]);
		} else {
			// Stream routes should return a Blob; if not, fail early (no direct fetch/URL allowed)
			throw new Error("Unexpected image response type for stream route");
		}

		const url = URL.createObjectURL(blob);
		return { blob, url };
	}, [buildStreamOptions, queryClient]);

	// Open original in a new tab
	const openInNewTabOriginal = useCallback(async () => {
		const { url } = await getOriginalAsBlobUrl();
		window.open(url, "_blank", "noopener,noreferrer");
		// Revoke after a short delay to avoid revoking before the browser reads it
		// 10 seconds should be more than enough
		setTimeout(() => URL.revokeObjectURL(url), 10_000);
	}, [getOriginalAsBlobUrl]);

	// Download original
	const downloadOriginal = useCallback(
		async (filename?: string) => {
			const { url } = await getOriginalAsBlobUrl();
			const a = document.createElement("a");
			a.href = url;
			a.download = filename ?? `image-${imageId ?? "original"}.jpg`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			setTimeout(() => URL.revokeObjectURL(url), 10_000);
		},
		[getOriginalAsBlobUrl, imageId],
	);

	return { getOriginalAsBlobUrl, openInNewTabOriginal, downloadOriginal };
}

export default function ImageDisplay({
	type,
	imageId,
	size = "original",
	alt,
	className,
	style,
	loading,
	draggable,
	onClick,
	onLoad,
	onError,
	...imgProps
}: ImageDisplayProps) {
	const [src, setSrc] = useState<string | undefined>(undefined);
	const lastBlobUrlRef = useRef<string | undefined>(undefined);

	const devMode = process.env.NEXT_PUBLIC_ENV === "development";

	// Build query options using the generated helpers so auth & backend behavior are correct

	let queryOptions;
	switch (type) {
		case "news":
			if (devMode) {
				queryOptions = {
					...getNewsImageStreamOptions({ path: { news_id: imageId } }),
					enabled: !!imageId,
				};
			} else {
				queryOptions = {
					...getNewsImageOptions({
						path: { news_id: imageId, size: size },
					}),
					enabled: !!imageId,
				};
			}
			break;
		// case "event":
		// case "user":
		default:
			if (devMode) {
				queryOptions = {
					...getImageStreamOptions({ path: { img_id: imageId } }),
					enabled: !!imageId,
				};
			} else {
				queryOptions = {
					...getImageOptions({
						path: { img_id: imageId, size: size },
					}),
					enabled: !!imageId,
				};
			}
			break;
	}

	// Use unknown generic and cast options to any because generated helpers provide queryFn & keys
	const query = useQuery<unknown>(queryOptions as any);

	// Convert various possible response types to an image src (string or object URL)
	useEffect(() => {
		// Cleanup previous object URL
		if (lastBlobUrlRef.current) {
			URL.revokeObjectURL(lastBlobUrlRef.current);
			lastBlobUrlRef.current = undefined;
		}
		setSrc(undefined);

		if (!query.data) return;

		const data = query.data as unknown;

		// If backend returned a direct URL string, use it directly
		if (typeof data === "string") {
			setSrc(data);
			return;
		}

		// If data is a Blob
		if (typeof Blob !== "undefined" && data instanceof Blob) {
			const url = URL.createObjectURL(data);
			lastBlobUrlRef.current = url;
			setSrc(url);
			return;
		}

		// If data looks like ArrayBuffer / typed array, wrap into Blob
		if (
			data &&
			(typeof (data as any).byteLength === "number" ||
				ArrayBuffer.isView(data as any))
		) {
			try {
				const blob = new Blob([data as any]);
				const url = URL.createObjectURL(blob);
				lastBlobUrlRef.current = url;
				setSrc(url);
				return;
			} catch {
				// fallthrough to error handling below
			}
		}

		// Unknown data shape — mark no src
		setSrc(undefined);
	}, [query.data]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (lastBlobUrlRef.current) {
				URL.revokeObjectURL(lastBlobUrlRef.current);
				lastBlobUrlRef.current = undefined;
			}
		};
	}, []);

	// Show nothing while loading or if there is no usable src
	if (query.isLoading || !src) return <Skeleton />;
	if (query.isError) return <p>{alt ?? `${type} ${imageId}`}</p>;

	return (
		<Image
			src={src}
			alt={alt ?? `${type} ${imageId}`}
			className={className}
			style={style}
			loading={loading}
			draggable={draggable}
			onClick={onClick}
			onLoad={onLoad}
			onError={onError}
			{...imgProps}
		/>
	);
}
