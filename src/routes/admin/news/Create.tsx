import { useState } from "react";
import { NewsService, type NewsRead } from "../../../api";

export function Create() {
	return NewsItem();
}

export function Edit(newsItem: NewsRead) {
	return NewsItem(newsItem);
}

function NewsItem(newsItem?: NewsRead) {
	const [news, setNews] = useState({
		...(newsItem || { title_sv: "", content_sv: "" }),
	});
	return (
		<form
			action=""
			onSubmit={(event) => {
				event.preventDefault();
				if (!newsItem) {
					NewsService.createNews({
						body: { title_en: "", content_en: "", ...news! },
					});
				} else {
					NewsService.updateNews({
						body: { ...news },
						path: { news_id: newsItem.id! },
					});
				}
			}}
		>
			<label htmlFor="titleSwe">Titel (SV)</label>
			<input
				type="text"
				name="titleSwe"
				value={news.title_sv}
				onChange={(c) =>
					setNews((prev) => ({ ...prev, title_sv: c.target.value }))
				}
			/>
			<input
				type="text"
				name="contentSwe"
				value={news.content_sv}
				onChange={(c) =>
					setNews((prev) => ({ ...prev, content_sv: c.target.value }))
				}
			/>
			<button type="submit" formAction="submit">Spara</button>
		</form>
	);
}
