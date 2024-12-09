import { useState, useEffect } from "react";
import { type NewsRead, NewsService } from "../../../api";
import { Button } from "@/components/ui/button";
import NewsForm from "./NewsForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllNewsOptions } from "@/api/@tanstack/react-query.gen";

const ACCEPTED_IMAGE_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp",
];

export interface NewsItem {
	title: string;
	creator: string;
	dateCreated: string;
	id: number;
}

export default function News() {
	const queryClient = useQueryClient();

	const { data, error, isFetching } = useQuery({
		...getAllNewsOptions(),
	});

	if (isFetching) {
		return <p> Hämtar</p>;
	}

	return (
		<div className="px-8 space-x-4">
			<h3 className="text-xl px-8 py-3 underline underline-offset-4 decoration-sidebar">
				Administrera nyheter
			</h3>
			<p className="py-3">
				Här kan du skapa nyheter & redigera existerande nyheter på hemsidan.
			</p>
			<NewsForm />
			<Button>Redigera nyheter</Button>
			<ul>
				{data?.map((newsItem: NewsRead) => (
					<li key={newsItem.id}>
						<h4>{newsItem.title_sv}</h4>
					</li>
				))}
			</ul>
		</div>
	);
}
