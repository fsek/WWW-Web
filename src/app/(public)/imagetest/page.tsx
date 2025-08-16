"use client";

import React from "react";
import ImageDisplay from "@/components/ImageDisplay";

export default function ImageTestPage() {
	return (
		<main style={{ padding: 24 }}>
			<h1>ImageDisplay Component Test</h1>
			<section>
				<h2>Small Image</h2>
				<ImageDisplay
					type="event"
					id={1}
					alt="Sample 1"
					width={100}
					height={100}
				/>
			</section>
			<section>
				<h2>Medium Image</h2>
				<ImageDisplay
					type="user"
					id={1}
					alt="Sample 2"
					width={300}
					height={200}
				/>
			</section>
			<section>
				<h2>Large Image (Centered)</h2>
				<div style={{ display: "flex", justifyContent: "center" }}>
					<ImageDisplay
						type="news"
						id={99}
						alt="Sample 3"
						width={600}
						height={400}
					/>
				</div>
			</section>
			<section style={{ display: "flex", gap: 16, marginTop: 32 }}>
				<div>
					<h2>Left</h2>
					<ImageDisplay
						type="image"
						id={1}
						alt="Sample 4"
						width={120}
						height={120}
					/>
				</div>
				<div>
					<h2>Right</h2>
					<ImageDisplay
						type="image"
						id={2}
						alt="Sample 5"
						width={120}
						height={120}
					/>
				</div>
			</section>
		</main>
	);
}
