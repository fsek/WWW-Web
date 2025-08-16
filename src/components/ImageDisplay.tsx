"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

export type ImageKind = "image" | "news" | "event" | "user";

export type ImgGetImageData = {
	path: {
		img_id: number;
	};
};

export type NewsGetNewsImageData = {
	path: {
		news_id: number; 
	};
};

export interface ImageDisplayProps
	extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
	type: ImageKind;
	id: number;
}

/**
 * Base image display component.
 * - Chooses the correct backend route based on type, id and environment.
 * - Avoids stream endpoints in production for backend optimizations.
 * - For authorized images (non-news), fetches with credentials and renders a Blob URL.
 * - No styling; width/height and other <img> attributes are supported via props.
 */
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
	const [hasError, setHasError] = useState(false);
	const [blobUrl, setBlobUrl] = useState<string | undefined>(undefined);
	const lastBlobUrlRef = useRef<string | undefined>(undefined);

	// Consider multiple env vars; default to non-production as "dev mode"
	const devMode =
		(process.env.NEXT_PUBLIC_APP_ENV ||
			process.env.ENV ||
			process.env.NODE_ENV) !== "production";

	const baseUrl =
		process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

	// Build the canonical endpoint once (stream in dev, non-stream in prod)
	const endpoint = useMemo(() => {
		if (!id) return undefined;

		if (devMode) {
			switch (type) {
				case "news":
					return `${baseUrl}/news/${id}/image/stream`;
				case "event":
					return `${baseUrl}/events/${id}/image/stream`;
				case "user":
					return `${baseUrl}/users/${id}/image/stream`;
				default:
					return `${baseUrl}/img/stream/${id}`;
			}
		} else {
			switch (type) {
				case "news":
					return `${baseUrl}/news/${id}/image`;
				case "event":
					return `${baseUrl}/events/${id}/image`;
				case "user":
					return `${baseUrl}/users/${id}/image`;
				default:
					return `${baseUrl}/img/${id}`;
			}
		}
	}, [baseUrl, devMode, id, type]);

	// For protected resources (non-news), fetch as Blob with credentials
	useEffect(() => {
		setHasError(false);

		// Clean up any old object URL
		if (lastBlobUrlRef.current) {
			URL.revokeObjectURL(lastBlobUrlRef.current);
			lastBlobUrlRef.current = undefined;
		}
		setBlobUrl(undefined);

		if (!endpoint || !id) return;

		// News images are public; use direct src
		const needsAuth = type !== "news";
		if (!needsAuth) return;

		const ac = new AbortController();
		(async () => {
			try {
				const res = await fetch(endpoint, {
					method: "GET",
					credentials: "include",
					headers: {
						Accept: "image/*",
					},
					signal: ac.signal,
				});
				if (!res.ok) {
					throw new Error(`Image fetch failed: ${res.status}`);
				}
				const blob = await res.blob();
				const url = URL.createObjectURL(blob);
				lastBlobUrlRef.current = url;
				setBlobUrl(url);
			} catch (_e) {
				if (!ac.signal.aborted) {
					setHasError(true);
				}
			}
		})();

		return () => {
			ac.abort();
			if (lastBlobUrlRef.current) {
				URL.revokeObjectURL(lastBlobUrlRef.current);
				lastBlobUrlRef.current = undefined;
			}
		};
	}, [endpoint, id, type]);

	if ((!endpoint && !blobUrl) || hasError) {
		return null;
	}

	// Prefer fetched Blob URL for protected images; otherwise use endpoint directly
	const src = blobUrl ?? endpoint;

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
			onError={(e) => {
				setHasError(true);
				onError?.(e);
			}}
			{...imgProps}
		/>
	);
}
