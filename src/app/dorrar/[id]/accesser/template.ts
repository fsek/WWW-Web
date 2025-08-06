// Don't change any formatting, spacing or newlines in this file, we don't know if it will break LU's scraper

export function renderAccesserHtml(renderedItems: string) {
	return `<html><head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8"></head><body><pre style="word-wrap: break-word; white-space: pre-wrap;">${renderedItems}
</pre>
</body></html>`;
}
