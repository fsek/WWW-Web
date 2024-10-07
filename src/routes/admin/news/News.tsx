import "../Admin.css";
import { Create } from "./Create";
import { type NewsRead, NewsService } from "../../../api";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const news: Array<NewsRead> = await NewsService.getAllNews().then((val) => val.data!);
//const news: NewsItem[] = [{title: "Ny app", creator: "Cajsa", dateCreated: "32/3-2025"}]
export interface NewsItem {
	title: string;
	creator: string;
	dateCreated: string;
	id: number;
}

export default function News() {
	return (
		<div className="content">
			<h1>Administrera nyheter</h1>
			<p>
				Här kan du skapa nyheter & redigera existerande nyheter på hemsidan.
			</p>
			<button type="button">Skapa nyhet</button>
			<button type="button">Redigera nyheter</button>
			<h2>Senaste nyheter</h2>
			<table>
				<tr>
					<th>Titel</th>
					<th>Skapare</th>
					<th>Datum skapad</th>
					<th>Redigera</th>
				</tr>
				{news.map((news, index) => {
					return (
						<tr key={index.toString()}>
							<td>{news.title_sv}</td>
							<td>{news.author_id}</td>
							<td>{news.created_at.toISOString()}</td>
							<td>
								<button type="button">Redigera</button>
							</td>
						</tr>
					);
				})}
			</table>
			<Create />
		</div>
	);
}
