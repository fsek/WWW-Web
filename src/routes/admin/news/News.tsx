import { useState, useEffect } from "react";
import { type NewsRead, NewsService } from "../../../api";
import { Button } from "@/components/ui/button";
import { Textarea} from "@/components/ui/textarea";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { DialogTitle } from "@radix-ui/react-dialog";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export interface NewsItem {
	title: string;
	creator: string;
	dateCreated: string;
	id: number;
}

const newsSchema = z.object({
	title_sv: z.string().min(2),
	title_en: z.string().min(2),
	text_sv: z.string().min(2),
	text_en: z.string().min(2),
	picture: z.any().optional(),
})



export default function News() {
	const [news, setNews] = useState<Array<NewsRead>>([]);
	const [loading, setLoading] = useState(true);
	const newsForm = useForm<z.infer<typeof newsSchema>>({
		resolver: zodResolver(newsSchema),
	});
	const [open, setOpen] = useState(false);
	const [submitEnabled, setSubmitEnabled] = useState(true);

	function onSubmit(values: z.infer<typeof newsSchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.
		setSubmitEnabled(false)
		console.log(values)
		new Promise((resolve) => setTimeout(resolve, 5000)).then(() => {
			setOpen(false);
			setSubmitEnabled(true);
		})
	}

	useEffect(() => {
		// Fetch news data when the component mounts
		const fetchNews = async () => {
			try {
				const response = await NewsService.getAllNews();
				setNews(response.data || []);
			} catch (error) {
				console.error("Error fetching news:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchNews();
	}, []);

	if (loading) {
		return <p className="text-center text-gray-600">Loading...</p>;
	}



	return (<div>
		<h3>Administrera nyheter</h3>
		<p>Här kan du skapa nyheter & redigera existerande nyheter på hemsidan.</p>

		<Button onClick={() => {
			newsForm.reset();
			setOpen(true);
			setSubmitEnabled(true);
		}}>Skapa nyhet</Button>
		<Button>Redigera nyheter</Button>

		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="min-w-fit lg:max-w-7xl">
				<DialogHeader>
					<DialogTitle>Skapa nyhet</DialogTitle>
				</DialogHeader>
				<hr/>
				<Form {...newsForm}>
					<form onSubmit={newsForm.handleSubmit(onSubmit)} className="grid lg:grid-cols-2 gap-x-4 gap-y-3">
					<FormField
						control={newsForm.control}
						name="title_sv"
						render={({field}) => (
						<FormItem >
							<FormLabel>Titel (sv)</FormLabel>
							<FormControl>
								<Input placeholder="Titel" {...field}/>
							</FormControl>
						</FormItem>
					)}/>
					<FormField
						control={newsForm.control}
						name="title_en"
						render={({field}) => (
						<FormItem >
							<FormLabel>Titel (en)</FormLabel>
							<FormControl>
								<Input placeholder="Title" {...field}/>
							</FormControl>
						</FormItem>
					)}/>
					
					<FormField
						control={newsForm.control}
						name="text_sv"
						render={({field}) => (
						<FormItem >
							<FormLabel>Text (sv)</FormLabel>
							<FormControl>
								<Textarea placeholder="Text" className="h-48" {...field}/>
							</FormControl>
						</FormItem>
					)}/>
					<FormField
						control={newsForm.control}
						name="text_en"
						render={({field}) => (
						<FormItem >
							<FormLabel>Text (en)</FormLabel>
							<FormControl>
								<Textarea placeholder="Text" className="h-48" {...field}/>
							</FormControl>
						</FormItem>
					)}/>
					<FormField
						control={newsForm.control}
						name="picture"
						render={({field}) => (
						<FormItem className="lg:col-span-2">
							<FormLabel>Bild</FormLabel>
							<FormControl>
								<Input id="picture" type="file" {...field}/>
							</FormControl>
						</FormItem>
					)}/>
					<div className="lg:col-span-2 lg:grid-cols-subgrid space-x-2">
					<Button variant="outline" className="min-w-fit w-32">Förhandsgranska</Button>
					<Button type="submit" disabled={!submitEnabled} className="min-w-fit w-32">Publicera</Button>
					</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
		</div>
	);
}
