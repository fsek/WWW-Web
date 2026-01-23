"use client";

import type { AlbumRead } from "@/api";
import {
	getAlbumImagesOptions,
	getOneAlbumOptions,
} from "@/api/@tanstack/react-query.gen";
import ImageDisplay, { useImageBlobActions } from "@/components/ImageDisplay";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInViewport } from "@/hooks/useInViewport";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Download, Maximize2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
	params: Promise<{ albumId: string }>;
}

// Lazy loaded image component for the gallery grid
function LazyImageCard({
	img,
	idx,
	album,
	onOpen,
}: {
	img: number;
	idx: number;
	album?: AlbumRead;
	onOpen: () => void;
}) {
	const [ref, isInView] = useInViewport<HTMLButtonElement>("200px");

	return (
		<button
			ref={ref}
			type="button"
			className="relative rounded overflow-hidden shadow cursor-pointer p-0 border border-opacity-30 focus:outline-none focus:ring-4 focus:ring-primary"
			onClick={onOpen}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") onOpen();
			}}
		>
			<div className="relative w-full aspect-[4/3]">
				{isInView ? (
					<ImageDisplay
						type="image"
						imageId={img}
						size="medium"
						alt={`Image ${idx + 1} from album ${album?.title_en}`}
						fill
						style={{ objectFit: "cover" }}
					/>
				) : (
					// Placeholder while image is not in view
					<Skeleton className="w-full h-full" />
				)}
			</div>
		</button>
	);
}

export default function AlbumPage({ params }: Props) {
	const resolvedParams = use(params);
	const albumId = Number(resolvedParams.albumId);
	const { t, i18n } = useTranslation();
	const { data: album } = useQuery({
		...getOneAlbumOptions({ path: { album_id: albumId } }),
		refetchOnWindowFocus: false,
	});

	const { data: images = [] } = useQuery({
		...getAlbumImagesOptions({ path: { album_id: albumId } }),
		refetchOnWindowFocus: false,
	});

	// Index of the currently displayed image in the album, not the image id
	const [viewerIndex, setViewerIndex] = useState<number | null>(null);
	const router = useRouter();
	const overlayRef = useRef<HTMLDivElement | null>(null);

	// measure the displayed image to anchor overlays to the real drawn image box
	const imageAreaRef = useRef<HTMLDivElement | null>(null);
	// natural size of the loaded image
	const [imgNatural, setImgNatural] = useState<{ w: number; h: number } | null>(
		null,
	);
	// displayed box (relative to imageAreaRef): top/left/width/height in px
	const [box, setBox] = useState<{
		top: number;
		left: number;
		width: number;
		height: number;
	} | null>(null);

	const currentImageId = viewerIndex != null ? images[viewerIndex] : null;
	const { downloadOriginal, openInNewTabOriginal } = useImageBlobActions(
		"image",
		currentImageId,
	);

	// This is all very complicated logic, but practically necessary for correct positioning of the buttons
	const updateBox = useCallback(() => {
		if (!imageAreaRef.current || !imgNatural) {
			setBox(null);
			return;
		}
		const area = imageAreaRef.current;
		const Wc = area.clientWidth;
		const Hc = area.clientHeight;
		const Wi = imgNatural.w || 1;
		const Hi = imgNatural.h || 1;
		const s = Math.min(Wc / Wi, Hc / Hi);
		const Wd = Wi * s;
		const Hd = Hi * s;
		const left = (Wc - Wd) / 2;
		const top = (Hc - Hd) / 2;
		setBox({ top, left, width: Wd, height: Hd });
	}, [imgNatural]);

	useEffect(() => {
		if (viewerIndex == null) return;
		updateBox();
		const onResize = () => updateBox();
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, [viewerIndex, updateBox]);

	useEffect(() => {
		updateBox();
	}, [updateBox]);

	const openViewer = (idx: number) => {
		setViewerIndex(idx);
		try {
			const url = new URL(window.location.href);
			url.searchParams.set("img", String(images[idx]));
			router.replace(url.toString(), { scroll: false });
		} catch {}
	};

	const closeViewer = useCallback(() => {
		setViewerIndex(null);
		try {
			const url = new URL(window.location.href);
			url.searchParams.delete("img");
			router.replace(url.toString(), { scroll: false });
		} catch {}
	}, [router]);

	// Move to the next image in the viewer, unless already at the last image
	const next = useCallback(
		() =>
			setViewerIndex((i) =>
				i == null ? 0 : i < images.length - 1 ? i + 1 : i,
			),
		[images.length],
	);

	// Move to the previous image in the viewer, unless already at the first image
	const prev = useCallback(
		() => setViewerIndex((i) => (i == null ? 0 : i > 0 ? i - 1 : i)),
		[],
	);

	const handleDownload = () => {
		// Download using blob URL using a method we get from ImageDisplay
		if (currentImageId) {
			downloadOriginal(`image-${currentImageId}.jpg`);
		}
	};

	// Initialize viewer from URL ?img=ID if present
	useEffect(() => {
		try {
			const p = new URL(window.location.href).searchParams.get("img");
			if (p && images.length) {
				const idx = images.findIndex((im) => String(im) === p);
				if (idx >= 0) setViewerIndex(idx);
			}
		} catch {}
	}, [images]);

	// keyboard navigation for viewer
	useEffect(() => {
		if (viewerIndex == null) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === "ArrowLeft") prev();
			else if (e.key === "ArrowRight") next();
			else if (e.key === "Escape") closeViewer();
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [viewerIndex, prev, next, closeViewer]);

	return (
		<div className="px-6 py-6 xl:mx-[4%]">
			{/* back button + title */}
			<div className="flex items-center gap-4 mb-4">
				<Button
					variant="outline"
					onClick={() => {
						const y = album?.year
							? `?year=${encodeURIComponent(String(album.year))}`
							: "";
						router.push(`/gallery${y}`);
					}}
				>
					<ArrowLeft />
				</Button>
				<h2 className="text-3xl font-bold">
					{i18n.language === "sv" ? album?.title_sv : album?.title_en}
				</h2>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
				{/* Album info card first */}
				<div className="col-span-1 sm:col-span-2 md:col-span-1 lg:col-span-1 rounded-lg p-4 shadow-md bg-base-100 border border-opacity-30">
					<div className="text-lg font-semibold mb-2">
						{i18n.language === "sv" ? album?.title_sv : album?.title_en}
					</div>
					<div className="text-sm text-muted-foreground mb-2">
						{album?.year} • {album?.location}
					</div>
					<div className="text-sm mb-2">
						{i18n.language === "sv" ? album?.desc_sv : album?.desc_en}
					</div>
					{/* Photographers: First Last, ... */}
					{album?.photographer?.length ? (
						<div className="text-sm mt-4">
							<span className="font-medium">{t("gallery.photographers")}:</span>{" "}
							{album.photographer
								.map((p) => `${p.user.first_name} ${p.user.last_name}`)
								.join(", ")}
						</div>
					) : null}
				</div>

				{images.map((img, idx) => (
					<LazyImageCard
						key={img}
						img={img}
						idx={idx}
						album={album}
						onOpen={() => openViewer(idx)}
					/>
				))}
			</div>

			{/* Viewer modal (detailed image view) */}
			{viewerIndex != null && (
				<div
					ref={overlayRef}
					onMouseDown={(e) => {
						// close when clicking outside the central image area
						if (e.target === overlayRef.current) closeViewer();
					}}
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
				>
					<div className="relative w-full h-full max-w-5xl max-h-full p-4">
						<div className="h-full w-full flex items-center justify-center pointer-events-none">
							<div
								ref={imageAreaRef}
								className="relative w-full h-[80vh] pointer-events-auto"
							>
								<ImageDisplay
									type="image"
									imageId={images[viewerIndex]}
									size="large"
									alt={`Image ${viewerIndex + 1} from album ${album?.title_en}`}
									style={{ objectFit: "contain" }}
									className="mx-auto"
									fill
									onLoad={(e) => {
										const img = e.currentTarget as HTMLImageElement;
										if (img?.naturalWidth && img?.naturalHeight) {
											setImgNatural({
												w: img.naturalWidth,
												h: img.naturalHeight,
											});
										}
									}}
								/>

								{/* All overlay controls positioned inside the displayed image box */}
								{box && (
									<div
										className="absolute z-20"
										style={{
											top: box.top,
											left: box.left,
											width: box.width,
											height: box.height,
											pointerEvents: "none",
										}}
									>
										{/* action buttons top-right inside image */}
										<div
											className="absolute top-2 right-2 flex gap-2"
											style={{ pointerEvents: "auto" }}
										>
											<button
												type="button"
												onClick={handleDownload}
												className="p-2 rounded-full border border-white/30 bg-base-100/70 backdrop-blur-md shadow-md"
											>
												<Download />
											</button>
											<button
												type="button"
												onClick={() => {
													if (currentImageId) openInNewTabOriginal();
												}}
												className="p-2 rounded-full border border-white/30 bg-base-100/70 backdrop-blur-md shadow-md"
											>
												<Maximize2 />
											</button>
											<button
												type="button"
												onClick={closeViewer}
												className="p-2 rounded-full border border-white/30 bg-base-100/70 backdrop-blur-md shadow-md"
											>
												<X />
											</button>
										</div>

										{/* Prev/Next inside the image left/right, vertically centered */}
										{viewerIndex > 0 && (
											<div
												className="absolute left-2 top-1/2 -translate-y-1/2"
												style={{ pointerEvents: "auto" }}
											>
												<Button
													variant="ghost"
													onClick={prev}
													className="rounded border border-white/30 bg-base-100/70 backdrop-blur-md shadow-md"
												>
													<ArrowLeft />
												</Button>
											</div>
										)}
										{viewerIndex < images.length - 1 && (
											<div
												className="absolute right-2 top-1/2 -translate-y-1/2"
												style={{ pointerEvents: "auto" }}
											>
												<Button
													variant="ghost"
													onClick={next}
													className="rounded border border-white/30 bg-base-100/70 backdrop-blur-md shadow-md"
												>
													<ArrowRight />
												</Button>
											</div>
										)}
									</div>
								)}
							</div>
						</div>

						{/* Carousel of thumbnails */}
						<div className="absolute bottom-6 left-0 right-0 flex justify-center">
							<div className="flex gap-2 overflow-x-auto px-4">
								{(() => {
									const maxThumbs = 3;
									const total = images.length;
									const idx = viewerIndex ?? 0;
									const start = Math.max(0, idx - maxThumbs);
									const end = Math.min(total, idx + maxThumbs + 1);
									const leftHidden = start;
									const rightHidden = total - end;

									const thumbs = [];

									if (leftHidden > 0) {
										thumbs.push(
											<div
												key="left-more"
												className="flex items-center justify-center w-12 text-sm text-white backdrop-blur-2xl rounded"
											>
												+{leftHidden}
											</div>,
										);
									}

									for (let i = start; i < end; ++i) {
										thumbs.push(
											<button
												key={images[i]}
												type="button"
												onClick={() => setViewerIndex(i)}
												className={`w-24 h-16 relative rounded overflow-hidden border-2 ${i === viewerIndex ? "border-primary" : "border-transparent"}`}
											>
												<ImageDisplay
													type="image"
													imageId={images[i]}
													size="small"
													alt={`thumb ${i + 1}`}
													fill
													style={{ objectFit: "cover" }}
												/>
											</button>,
										);
									}

									if (rightHidden > 0) {
										thumbs.push(
											<div
												key="right-more"
												className="flex items-center justify-center w-12 text-sm text-white backdrop-blur-2xl rounded"
											>
												+{rightHidden}
											</div>,
										);
									}

									return thumbs;
								})()}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
