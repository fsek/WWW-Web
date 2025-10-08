"use client";

import { Suspense, use, useState } from "react";
import {
	useMutation,
	useQueries,
	useQueryClient,
	useSuspenseQueries,
	useSuspenseQuery,
} from "@tanstack/react-query";
import {
	getOneAlbumOptions,
	uploadImageMutation,
	deleteImageMutation,
	getOneAlbumQueryKey,
	removeAlbumPhotographerMutation,
	getAlbumImagesOptions,
} from "@/api/@tanstack/react-query.gen";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import type { AlbumRead } from "@/api";
import { createColumnHelper } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import PhotographerForm from "./PhotographerForm";
import { map } from "zod";
import type { StaticImport } from "next/dist/shared/lib/get-img-props";
import ImageDropzone from "./ImageDropzone";
import { Spinner } from "@/components/Spinner";
import { ArrowLeft, Check, CircleX, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import ImageDisplay from "@/components/ImageDisplay";

interface AlbumPageProps {
	params: Promise<{
		id: string;
	}>;
}

const columnHelper = createColumnHelper<AlbumRead>();
enum STATUS {
	PENDING = 0,
	COMPLETED = 1,
	ERROR = 2,
}

export default function AlbumPage({ params }: AlbumPageProps) {
	const resolvedParams = use(params);
	const albumId = Number.parseInt(resolvedParams.id, 10);
	const { t, i18n } = useTranslation("admin");
	const queryClient = useQueryClient();
	const router = useRouter();

	const [uploads, setUploads] = useState<Map<string, STATUS>>(new Map());

	const {
		data: album,
		error,
		refetch,
		isPending: isAlbumLoading,
	} = useSuspenseQuery({
		...getOneAlbumOptions({ path: { album_id: albumId } }),
		refetchOnWindowFocus: false,
	});

	const {
		data: albumImages,
		error: imagesError,
		refetch: imagesRefetch,
		isPending: isAlbumImagesLoading,
	} = useSuspenseQuery({
		...getAlbumImagesOptions({ path: { album_id: albumId } }),
		refetchOnWindowFocus: false,
	});

	if (Number.isNaN(albumId)) {
		return <LoadingErrorCard error={new Error("Invalid album ID")} />;
	}
	if (error) {
		return <LoadingErrorCard error={error} />;
	}

	const imageUploadMutation = useMutation({
		...uploadImageMutation(),
		onMutate: (request) => {
			if (request.body.file instanceof File) {
				setUploads(
					uploads.set((request.body.file as File).name, STATUS.PENDING),
				);
			}
		},
		onSuccess: (_response, request) => {
			if (request.body.file instanceof File) {
				setUploads(
					uploads.set((request.body.file as File).name, STATUS.COMPLETED),
				);
			}
			refetch({ cancelRefetch: true });
			imagesRefetch({ cancelRefetch: true });
		},
		onError: (_response, request) => {
			setUploads(uploads.set((request.body.file as File).name, STATUS.ERROR));
		},
	});

	const imageDeleteMutation = useMutation({
		...deleteImageMutation(),
		onSuccess: (response) =>
			queryClient.invalidateQueries({
				queryKey: getOneAlbumQueryKey({ path: { album_id: albumId } }),
			}),
	});

	const removePhotographer = useMutation({
		...removeAlbumPhotographerMutation(),
		onSuccess: (response) =>
			queryClient.invalidateQueries({
				queryKey: getOneAlbumQueryKey({ path: { album_id: albumId } }),
			}),
	});

	function handleFileUpload(acceptedFiles: File[]) {
		for (const file of acceptedFiles) {
			//if (file.type === "image/jpeg") {
			imageUploadMutation.mutate({
				body: {
					file: file,
				},
				query: { album_id: albumId },
			});
			//}
		}
	}

	return (
		<Suspense fallback={<LoadingErrorCard isLoading={true} />}>
			<div className="px-8 space-x-4">
				<div className="justify-between w-full flex flex-row">
					<h3 className="text-3xl py-3 font-bold text-primary">
						{t("album.page_title", {
							album: i18n.language === "sv" ? album.title_sv : album.title_en,
						})}
					</h3>
					<Button
						variant="ghost"
						className="flex items-center gap-2"
						onClick={() => router.push("/admin/albums")}
					>
						<ArrowLeft className="w-4 h-4" />
						{t("album.back")}
					</Button>
				</div>
				<PhotographerForm
					album_id={albumId}
					excluded_users={album.photographer.map((p) => p.user.id)}
				/>
				<div className="flex flex-row flex-wrap gap-x-1.5 gap-y-1 p-2">
					{album.photographer.map((p) => (
						<div
							className="pl-2 flex text-primary-foreground text-sm flex-row gap-1 border-1 items-center size-min p-1 rounded-sm bg-primary select-none break-keep whitespace-nowrap"
							key={p.user.id}
						>
							<p>
								{p.user.first_name} {p.user.last_name}
							</p>
							<X
								size={20}
								className="hover:text-destructive cursor-pointer"
								onClick={() =>
									removePhotographer.mutate({
										body: { user_id: p.user.id, album_id: albumId },
									})
								}
							/>
						</div>
					))}
				</div>
				<hr />
				<ImageDropzone onDrop={handleFileUpload} />
				<div className="flex flex-row flex-wrap gap-x-1.5 gap-y-1 p-2">
					{Array.from(uploads).map((value) => (
						<div
							className="flex flex-row gap-2 border-1 size-min p-0.5 rounded-sm border-primary/50 select-none break-keep whitespace-nowrap"
							key={value[0]}
						>
							{value[0]}
							{value[1] === STATUS.PENDING ? (
								<Spinner size={"small"} />
							) : value[1] === STATUS.COMPLETED ? (
								<Check color="green" />
							) : (
								<CircleX color="red" />
							)}
						</div>
					))}
				</div>
				<div className="w-full place-content-center ">
					<div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-2 items-center place-items-center">
						{isAlbumLoading || isAlbumImagesLoading ? (
							<div className="col-span-full">
								<LoadingErrorCard isLoading={true} />
							</div>
						) : (
							albumImages.map((img, index) => {
								return (
									<div
										key={`${albumImages[index]}-${index}`}
										className="relative w-56 h-56"
									>
										<ImageDisplay
											type="image"
											imageId={albumImages[index]}
											size="small"
											style={{ objectFit: "contain" }}
											className=""
											alt={`Album image number ${index}`}
											fill
										/>
										<Button
											className="absolute top-1 right-1"
											variant={"destructive"}
											onClick={() =>
												imageDeleteMutation.mutate({
													path: { id: albumImages[index] },
												})
											}
										>
											<Trash2 />
										</Button>
									</div>
								);
							})
						)}
					</div>
				</div>
			</div>
		</Suspense>
	);
}
