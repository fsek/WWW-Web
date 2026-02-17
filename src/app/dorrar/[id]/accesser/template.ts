// Don't change any formatting, spacing or newlines in this file, we don't know if it will break LU's scraper

export function renderAccesserHtml(renderedItems: string) {
	return `<pre style= "word-wrap: break-word; white-space: pre-wrap;">
${renderedItems}
</pre>
`;
}
