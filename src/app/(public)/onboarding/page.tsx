"use client";

import { useState, useEffect } from "react";
import programData from "./onboarding-program.json";
import CustomTitle from "@/components/CustomTitle";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Label } from "@/components/ui/label";

type ChecklistItem = {
	id: string;
	title: string;
	description: string;
	task: string;
};

type ChecklistPage = {
	title: string;
	items: ChecklistItem[];
};

type ProgramData = {
	title: string;
	pages: ChecklistPage[];
	completionMessage: string;
};

const STORAGE_KEY = "onboarding_progress";

export default function OnboardingPage() {
	const [mounted, setMounted] = useState(false);
	const [currentPage, setCurrentPage] = useState(0);
	const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

	const program: ProgramData = programData;

	useEffect(() => {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				setCheckedItems(parsed.checkedItems || {});
				setCurrentPage(parsed.currentPage || 0);
			} catch (e) {
				console.error("Failed to load progress", e);
			}
		}
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) return;
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ checkedItems, currentPage }),
		);
	}, [checkedItems, currentPage, mounted]);

	if (!mounted) return null;

	const isComplete = currentPage >= program.pages.length;

	const handleCheck = (id: string) => {
		setCheckedItems((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	const handleNext = () => {
		if (currentPage < program.pages.length) {
			setCurrentPage((prev) => prev + 1);
		}
	};

	const handlePrevious = () => {
		if (currentPage > 0) {
			setCurrentPage((prev) => prev - 1);
		}
	};

	const handleReset = () => {
		if (confirm("Are you sure you want to reset your progress?")) {
			setCheckedItems({});
			setCurrentPage(0);
			localStorage.removeItem(STORAGE_KEY);
		}
	};

	if (isComplete) {
		return (
			<div className="max-w-3xl mx-auto">
				<div className="flex flex-col items-center justify-center h-full space-y-6 p-8">
					<CustomTitle text="All Done!" size={3} />
					<p className="text-xl text-center">{program.completionMessage}</p>
					<Button
						variant="destructive"
						onClick={handleReset}
						className="text-sm"
					>
						Reset Progress
					</Button>
				</div>
			</div>
		);
	}

	const pageData = program.pages[currentPage];
	const allChecked = pageData.items.every((item) => checkedItems[item.id]);

	return (
		<div className="max-w-3xl mx-auto py-10 px-6">
			<div className="mb-8">
				<CustomTitle text={program.title} size={3} className="mb-2" />
				<div className="text-sm text-muted-foreground">
					Page {currentPage + 1} of {program.pages.length}: {pageData.title}
				</div>
				<div className="w-full bg-secondary h-2 rounded-full mt-4">
					<div
						className="bg-primary h-2 rounded-full transition-all duration-300"
						style={{
							width: `${(currentPage / program.pages.length) * 100}%`,
						}}
					/>
				</div>
			</div>

			<div className="space-y-6">
				{pageData.items.map((item) => (
					<div
						key={item.id}
						className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
					>
						<div className="flex items-start gap-4">
							<div className="flex-1">
								<label
									htmlFor={item.id}
									className="block font-medium text-lg cursor-pointer select-none"
								>
									{item.title}
								</label>
								<div className="text-muted-foreground mt-1 prose dark:prose-invert">
									<Markdown remarkPlugins={[remarkGfm]}>
										{item.description}
									</Markdown>
								</div>
								<Label
									htmlFor={item.id}
									className="flex items-center gap-2 mt-3 text-sm font-medium text-foreground bg-muted/30 p-4 rounded cursor-pointer select-none"
								>
									<span className="flex items-center">
										<Checkbox
											id={item.id}
											checked={!!checkedItems[item.id]}
											onCheckedChange={() => handleCheck(item.id)}
											className="w-5 h-5"
										/>
									</span>
									<span>
										<Markdown remarkPlugins={[remarkGfm]}>
											{`${item.task}`}
										</Markdown>
									</span>
								</Label>
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="mt-8 flex flex-row justify-between">
				<Button
					onClick={handlePrevious}
					disabled={currentPage === 0 || currentPage === program.pages.length}
					className="px-6 py-3 rounded-lg font-medium transition-colors"
				>
					{"Previous Page"}
				</Button>
				<Button
					onClick={handleNext}
					disabled={!allChecked}
					className="px-6 py-3 rounded-lg font-medium transition-colors"
				>
					{currentPage === program.pages.length - 1 ? "Finish" : "Next Page"}
				</Button>
			</div>
		</div>
	);
}
