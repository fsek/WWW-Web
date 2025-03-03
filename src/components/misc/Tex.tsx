// prevent this from being exported to the client
// something something javascript bloating
import "server-only";

import "katex/dist/katex.min.css";
import katex from "katex";

export default function Tex({
	tex,
	displayMode,
}: { tex: string; displayMode?: boolean }) {
	const html = katex.renderToString(tex, {
		throwOnError: false,
		displayMode,
	});

	return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
