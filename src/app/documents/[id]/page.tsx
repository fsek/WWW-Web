"use client";

import { use, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDocumentFileByIdOptions } from "@/api/@tanstack/react-query.gen";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";

interface DocumentPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function DocumentPage({ params }: DocumentPageProps) {
	const [hasProcessed, setHasProcessed] = useState(false);
	const [documentUrl, setDocumentUrl] = useState<string | null>(null);
	const resolvedParams = use(params);
	const documentId = Number.parseInt(resolvedParams.id, 10);

	const {
		data: response,
		isLoading,
		error,
	} = useQuery({
		...getDocumentFileByIdOptions({
			path: { document_id: documentId },
		}),
		enabled: !Number.isNaN(documentId),
	});

	// Process document once when data is available
	useEffect(() => {
		if (response && !hasProcessed) {
			processDocument();
			setHasProcessed(true);
		}
	}, [response, hasProcessed]);

	// Clean up the blob URL when component unmounts
	useEffect(() => {
		return () => {
			if (documentUrl) {
				URL.revokeObjectURL(documentUrl);
			}
		};
	}, [documentUrl]);

	async function processDocument() {
		try {
			if (!response) {
				throw new Error("No file data available");
			}

			let blob: Blob;
			if (response instanceof File) {
				const arrayBuffer = await response.arrayBuffer();
				blob = new Blob([arrayBuffer], { type: "application/pdf" });
			} else if (response instanceof Blob) {
				blob = new Blob([response], { type: "application/pdf" });
			} else {
				blob = new Blob([response], { type: "application/pdf" });
			}

			// Create object URL for inline display
			const fileUrl = URL.createObjectURL(blob);
			setDocumentUrl(fileUrl);
		} catch (error) {
			console.error("Error processing document:", error);
		}
	}

	// Handle invalid document ID
	if (Number.isNaN(documentId)) {
		return <LoadingErrorCard error={new Error("Invalid document ID")} />;
	}

	// Show loading or error states
	if (isLoading) {
		return <LoadingErrorCard />;
	}
	if (!response || error) {
		return <LoadingErrorCard error={error || "No document data found"} />;
	}

	// Inline PDF display, no container div
	return documentUrl ? (
		<object
			data={documentUrl}
			type="application/pdf"
			className="w-screen h-screen"
			style={{ position: "absolute", top: 0, left: 0 }}
		>
			<p>
				Your browser does not support embedded PDFs.{" "}
				<a href={documentUrl}>Click here to download the PDF</a>.
			</p>
		</object>
	) : (
		<>
			<h1 className="text-2xl font-bold mb-4">Loading Document...</h1>
			<p className="text-gray-600">
				The document will open in your browser's PDF viewer.
			</p>
		</>
	);
}
