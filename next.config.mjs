import nextMdx from "@next/mdx";

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
						// Font required, see https://www.npmjs.com/package/rehype-mathjax
						fontURL:
							"https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2",
						scale: 1.3,
					},
				},
			],
		],
	},
});
export default withMDX(nextConfig);
