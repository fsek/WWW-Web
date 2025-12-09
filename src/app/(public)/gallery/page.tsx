"use client";

import { useMemo, useState, useEffect } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
	getAlbumsOptions,
	getAlbumImagesOptions,
} from "@/api/@tanstack/react-query.gen";
import type { AlbumRead } from "@/api";
import { SelectFromOptions } from "@/widgets/SelectFromOptions";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ImageDisplay from "@/components/ImageDisplay";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";

export default function GalleryIndexPage() {
	const { i18n, t } = useTranslation("main");
	const { data: unsortedAlbums, isLoading } = useQuery({
		...getAlbumsOptions(),
		refetchOnWindowFocus: false,
	});

	const albums = useMemo(() => {
		return unsortedAlbums?.sort((a, b) =>
			String(b.date).localeCompare(String(a.date)),
		);
	}, [unsortedAlbums]);

	console.log(unsortedAlbums);
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	// start with URL param if present (may be sanitized below)
	const paramYear = searchParams?.get("year") ?? undefined;
	const [selectedYear, setSelectedYear] = useState<string | undefined>(
		paramYear ?? undefined,
	);

	const years = useMemo(() => {
		const set = new Set<number>();
		for (const a of albums ?? []) set.add(a.year);
		return Array.from(set).sort((a, b) => b - a);
	}, [albums]);

	useEffect(() => {
		// sanitize paramYear against available years; if invalid remove selection
		if (!paramYear) {
			// If no year param, auto-select current year if available
			const currentYear = new Date().getFullYear();
			if (years.length && years.includes(currentYear)) {
				setSelectedYear(String(currentYear));
				router.replace(`${pathname}?year=${encodeURIComponent(currentYear)}`);
			} else {
				setSelectedYear(undefined);
			}
			return;
		}
		if (years.length && years.includes(Number(paramYear))) {
			setSelectedYear(paramYear);
		} else {
			setSelectedYear(undefined);
		}
		// we only need to run when years or paramYear changes
	}, [paramYear, years, pathname, router]);

	const yearOptions = years.map((y) => ({
		value: String(y),
		label: String(y),
	}));

	const filtered = useMemo(() => {
		if (!albums) return [];
		// don't show anything until a year is selected
		if (!selectedYear) return [];
		return albums.filter((a) => String(a.year) === selectedYear);
	}, [albums, selectedYear]);

	// Get the image ids for the filtered albums and use those
	const albumImageQueries = useQueries({
		queries: filtered.map((album) => ({
			...getAlbumImagesOptions({ path: { album_id: album.id } }),
			refetchOnWindowFocus: false,
			enabled: !!selectedYear,
		})),
	});

	// persist selection to URL
	const onYearChange = (v: string | null) => {
		const newYear = v || undefined;
		setSelectedYear(newYear);
		if (newYear) {
			router.replace(`${pathname}?year=${encodeURIComponent(newYear)}`);
		} else {
			router.replace(pathname);
		}
	};

	if (isLoading) return <LoadingErrorCard />;

	return (
		<div className="px-6 py-6 xl:mx-[4%]">
			<h2 className="text-3xl font-bold mb-4">{t("gallery.title")}</h2>

			<div className="max-w-sm mb-6">
				<SelectFromOptions
					options={yearOptions}
					value={selectedYear}
					onChange={(v) => onYearChange(v)}
					placeholder={t("gallery.select_year")}
				/>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
				{filtered.map((album, idx) => {
					const bgImageId = albumImageQueries[idx]?.data?.[0];

					return (
						<Link
							key={album.id}
							href={`/gallery/${album.id}`}
							className="relative group block overflow-hidden rounded-lg shadow-lg bg-base-100 border border-opacity-30"
						>
							<div className="relative w-full aspect-[4/3]">
								{bgImageId && (
									<div className="absolute inset-0">
										<ImageDisplay
											type="image"
											imageId={bgImageId}
											size="medium"
											alt={album.title_en}
											className="w-full h-full object-cover"
											style={{ objectFit: "cover" }}
											fill
										/>
									</div>
								)}
								<div className="absolute inset-0 flex items-end p-4 bg-black/5 group-hover:bg-black/20 transition-colors">
									<div className="w-full h-fit bg-card/10 p-2 rounded-lg backdrop-blur-sm border-1 border-white/20">
										<div className="text-primary font-semibold text-lg">
											{i18n.language === "sv" ? album.title_sv : album.title_en}
										</div>
										{bgImageId ? (
											<div className="text-sm text-white">
												{new Date(album.date).toLocaleDateString()} •{" "}
												{album.location}
											</div>
										) : (
											<div className="text-sm text-card-foreground">
												{new Date(album.date).toLocaleDateString()} •{" "}
												{album.location}
											</div>
										)}
									</div>
								</div>
							</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
