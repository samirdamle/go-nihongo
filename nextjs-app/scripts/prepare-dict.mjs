#!/usr/bin/env node
/**
 * Download jmdict-simplified English JSON into go-nihongo/data/jmdict-eng.json
 *
 * Usage:
 *   npm run dict:prepare
 *   DICT_VARIANT=eng npm run dict:prepare         # full English (larger)
 *   DICT_VARIANT=eng-common npm run dict:prepare  # default (common words)
 *
 * Requires network. Data is gitignored — run on deploy/dev machines.
 *
 * Attribution: JMdict © EDRDG — https://www.edrdg.org/edrdg/licence.html
 * Format: https://github.com/scriptin/jmdict-simplified
 */

import { createWriteStream, mkdirSync } from "node:fs";
import { unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");
const outFile = path.join(dataDir, "jmdict-eng.json");

const variant = (process.env.DICT_VARIANT || "eng-common").toLowerCase();
const assetPrefix =
  variant === "eng" ? "jmdict-eng-" : "jmdict-eng-common-";

async function main() {
  mkdirSync(dataDir, { recursive: true });

  console.log("Fetching latest jmdict-simplified release metadata…");
  const releaseRes = await fetch(
    "https://api.github.com/repos/scriptin/jmdict-simplified/releases/latest",
    { headers: { Accept: "application/vnd.github+json" } },
  );
  if (!releaseRes.ok) {
    throw new Error(
      `GitHub API ${releaseRes.status}: ${await releaseRes.text()}`,
    );
  }
  const release = await releaseRes.json();
  const asset = (release.assets || []).find(
    (a) =>
      typeof a.name === "string" &&
      a.name.startsWith(assetPrefix) &&
      a.name.endsWith(".json.tgz") &&
      !a.name.includes("examples"),
  );
  if (!asset) {
    throw new Error(
      `No asset matching ${assetPrefix}*.json.tgz in release ${release.tag_name}`,
    );
  }

  console.log(`Downloading ${asset.name} (${asset.size} bytes)…`);
  const tmpTgz = path.join(dataDir, asset.name);
  const dl = await fetch(asset.browser_download_url);
  if (!dl.ok || !dl.body) {
    throw new Error(`Download failed: ${dl.status}`);
  }
  await pipeline(Readable.fromWeb(dl.body), createWriteStream(tmpTgz));

  console.log(`Extracting to ${outFile}…`);
  const jsonBuf = execFileSync("tar", ["-xzf", tmpTgz, "-O"]);
  await writeFile(outFile, jsonBuf);
  await unlink(tmpTgz).catch(() => {});

  const head = jsonBuf.toString("utf8").slice(0, 200);
  if (!head.includes("words")) {
    throw new Error("Extracted file does not look like jmdict-simplified JSON");
  }

  console.log(`Wrote ${outFile}`);
  console.log(`Variant: ${variant}  Release: ${release.tag_name}`);
  console.log(
    "Attribution: JMdict data © Electronic Dictionary Research and Development Group",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
