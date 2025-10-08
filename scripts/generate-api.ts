#!/usr/bin/env node
// Works with: node script.js or bun run script.ts

import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { URL } from "node:url";

const OUTPUT_FILE = "openapi.cleaned.json";

function stripPrefixFromOperationIds(doc: any) {
	if (!doc.paths) return;

	for (const pathKey of Object.keys(doc.paths)) {
		const pathItem = doc.paths[pathKey];
		for (const methodKey of Object.keys(pathItem)) {
			const operation = pathItem[methodKey];
			if (
				operation &&
				typeof operation.operationId === "string" &&
				operation.operationId.lastIndexOf("-") !== -1
			) {
				operation.operationId = operation.operationId.slice(
					operation.operationId.lastIndexOf("-") + 1,
				);
			}
		}
	}
}

async function readInput(input: string | URL): Promise<string> {
	if (input instanceof URL) {
		if (input.protocol === "file:") {
			return fs.readFileSync(fileURLToPath(input), "utf8");
		}
		const res = await fetch(input);
		if (!res.ok) {
			throw new Error(`Failed to fetch ${input}: ${res.status}`);
		}
		return await res.text();
	}

	try {
		return fs.readFileSync(input, "utf8");
	} catch {
		// Try to interpret as URL
		const maybeUrl = new URL(input);
		return readInput(maybeUrl);
	}
}

async function runOpenApiTS() {
	const runner = typeof Bun !== "undefined" ? "bunx" : "npx";
	console.log(`🚀 Running openapi-ts via ${runner}...`);

	const proc = spawnSync(runner, ["@hey-api/openapi-ts", "-i", OUTPUT_FILE], {
		stdio: "inherit",
		shell: true,
	});

	if (proc.status !== 0) throw new Error("openapi-ts failed");
	console.log("✅ openapi-ts completed successfully");
}

async function main(input: string | URL) {
	const raw = await readInput(input);
	const doc = JSON.parse(raw);

	stripPrefixFromOperationIds(doc);

	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(doc, null, 2), "utf8");
	console.log(`✅ Cleaned OpenAPI written to ${OUTPUT_FILE}`);

	try {
		await runOpenApiTS();
	} finally {
		try {
			fs.unlinkSync(OUTPUT_FILE);
			console.log(`🧹 Removed temporary file: ${OUTPUT_FILE}`);
		} catch (err) {
			console.warn(`⚠️ Could not remove ${OUTPUT_FILE}:`, err);
		}
	}
}

const arg = process.argv[2] ?? "openapi.json";
const input = (() => {
	try {
		return new URL(arg);
	} catch {
		return arg;
	}
})();

main(input).catch((err) => {
	console.error("❌ Error:", err);
	process.exit(1);
});
