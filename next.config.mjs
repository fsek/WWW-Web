import nextMdx from "@next/mdx";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	// Configure `pageExtensions` to include MDX files
	pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
};

const withMDX = nextMdx({
	extension: /\.(md|mdx)$/,
	options: {
		remarkPlugins: ["remark-gfm", "remark-math"],
		rehypePlugins: [
			[
				"rehype-mathjax/chtml",
				{
					chtml: {
						fontURL:
							"https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2",
					},
				},
			],
		],
	},
});
export default withMDX(nextConfig);
