import { ImageUp } from "lucide-react";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";

export default function ImageDropzone({
	onDrop,
}: { onDrop: (acceptedFiles: File[]) => void }) {
	const { t } = useTranslation("admin");
	const onDropCallback = useCallback(
		(acceptedFiles: File[]) => {
			onDrop(acceptedFiles);
		},
		[onDrop],
	);
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop: onDropCallback,
	});

	return (
		<div className="p-4" {...getRootProps()}>
			<input {...getInputProps()} />
			<div className="w-full flex justify-center place-items-center h-35 border-3 border-primary rounded-3xl select-none text-3xl bg-primary/20 hover:bg-primary/15 hover:border-primary/70 hover:text-black/80 gap-x-3 cursor-pointer p-2">
				<ImageUp size={40} />
				{isDragActive ? (
					<h3 className="">{t("album.dragndrop_hover")}</h3>
				) : (
					<h3 className="">{t("album.dragndrop")}</h3>
				)}
			</div>
		</div>
	);
}
