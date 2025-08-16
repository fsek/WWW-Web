"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	getImageStreamOptions,
	getImageOptions,
	getNewsImageOptions,
	getNewsImageStreamOptions,
} from "@/api/@tanstack/react-query.gen";

export type ImageKind = "image" | "news" | "event" | "user";

export interface ImageDisplayProps
	extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
	type: ImageKind;
	id: number;
}

export default function ImageDisplay({
	type,
	id,
	alt,
	width,
	height,
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

	// Consider multiple env vars; default to non-production as "dev mode"
	const devMode =
		(process.env.NEXT_PUBLIC_APP_ENV ||
			process.env.ENV ||
			process.env.NODE_ENV) !== "production";

	// Build query options using the generated helpers so auth & backend behavior are correct

	let queryOptions;
	switch (type) {
		case "news":
			if (devMode) {
				queryOptions = {
					...getNewsImageStreamOptions({ path: { news_id: id } }),
					enabled: !!id,
				};
			} else {
				queryOptions = {
					...getNewsImageOptions({ path: { news_id: id } }),
					enabled: !!id,
				};
			}
			break;
		// case "event":
		// case "user":
		default:
			if (devMode) {
				queryOptions = {
					...getImageStreamOptions({ path: { img_id: id } }),
					enabled: !!id,
				};
			} else {
				queryOptions = {
					...getImageOptions({ path: { img_id: id } }),
					enabled: !!id,
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
	if (query.isLoading || !src) return null;
	if (query.isError) return null;

	return (
		<img
			src={src}
			alt={alt ?? `${type} ${id}`}
			width={width}
			height={height}
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
