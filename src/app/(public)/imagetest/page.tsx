"use client";

import React from "react";
import ImageDisplay from "@/components/ImageDisplay";

export default function ImageTestPage() {
	return (
		<main style={{ padding: 24 }}>
			<h1>ImageDisplay Component Test</h1>
			{/* <section>
				<h2>Small Image (event)</h2>
				<ImageDisplay type="event" imageId={1} alt="Sample 1" size="small" width={128} height={128} />
			</section>
			<section>
				<h2>Medium Image (user)</h2>
				<ImageDisplay type="user" imageId={1} alt="Sample 2" size="medium" width={256} height={256} />
			</section> */}
			<section>
				<h2>Large Image (Centered (news))</h2>
				<div style={{ display: "flex", justifyContent: "center" }}>
					<ImageDisplay
						type="news"
						imageId={99}
						alt="Sample 3"
						size="large"
						width={256}
						height={256}
					/>
				</div>
			</section>
			<section style={{ display: "flex", gap: 16, marginTop: 32 }}>
				<div>
					<h2>Left</h2>
					<ImageDisplay
						type="image"
						imageId={3}
						alt="Sample 4"
						size="small"
						width={128}
						height={128}
					/>
				</div>
				<div>
					<h2>Right</h2>
					<ImageDisplay
						type="image"
						imageId={3}
						alt="Sample 5"
						size="original"
						width={512}
						height={512}
					/>
				</div>
			</section>
		</main>
	);
}
