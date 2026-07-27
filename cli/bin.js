#!/usr/bin/env node

// This file runs on end users' own machines via the `poisik` bin entry point
// (cli/package.json), on whatever Node version they happen to have — no
// "type": "module" is declared anywhere, so top-level `import` isn't safe here
// (it depends on Node's auto-detection, default-on only from Node 20.19/22.7+).
// Use require() so this works on any Node version the shebang can run.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- see note above
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports -- see note above
const { execSync } = require('child_process');

const API_BASE = process.env.POISIK_API_URL || 'https://poisik-design-critic.vercel.app';
const API_KEY = process.env.POISIK_API_KEY;

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const target = args[1];
  const flags = args.filter((a) => a.startsWith('--'));

  if (!command || command !== 'analyze' || !target) {
    console.log('Usage: poisik analyze <file|url> [--json] [--open]');
    process.exit(1);
  }

  if (!API_KEY) {
    console.error('Error: POISIK_API_KEY environment variable is not set');
    process.exit(1);
  }

  const isUrl = target.startsWith('http://') || target.startsWith('https://');
  const body = isUrl ? { imageUrl: target } : { imageBase64: fs.readFileSync(target, 'base64') };

  try {
    const response = await fetch(`${API_BASE}/api/v1/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error(`Error (${response.status}): ${err.error || 'Unknown error'}`);
      process.exit(1);
    }

    const result = await response.json();

    if (flags.includes('--json')) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`\n  Overall Score: ${result.overall_score}/100\n`);
      console.log('  Top Issues:');
      result.issues.slice(0, 3).forEach((issue, i) => {
        console.log(`    ${i + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`);
        console.log(`       ${issue.recommendation}`);
        console.log();
      });
    }

    if (flags.includes('--open')) {
      const platform = process.platform;
      const url = `${API_BASE}/en/report/demo`;
      if (platform === 'darwin') execSync(`open ${url}`);
      else if (platform === 'win32') execSync(`start ${url}`);
      else execSync(`xdg-open ${url}`);
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
