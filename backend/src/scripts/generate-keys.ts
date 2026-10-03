import { randomInt } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

type Platform = 'steam' | 'epic' | 'xbox' | 'psn' | 'gog';
type OutputFormat = 'csv' | 'tsv';

interface GeneratorOptions {
  platform: Platform;
  count: number;
  productName: string;
  region: string;
  format: OutputFormat;
  output: string;
}

const keyFormats: Record<Platform, number[]> = {
  steam: [5, 5, 5, 5, 5],
  epic: [5, 5, 5, 5],
  xbox: [5, 5, 5, 5, 5],
  psn: [4, 4, 4, 4],
  gog: [4, 4, 4, 4],
};

const platformAliases: Record<string, Platform> = {
  steam: 'steam',
  'epic-games': 'epic',
  epic: 'epic',
  'xbox-microsoft': 'xbox',
  xbox: 'xbox',
  microsoft: 'xbox',
  psn: 'psn',
  playstation: 'psn',
  gog: 'gog',
};

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function parseArguments(argumentsList: string[]): GeneratorOptions {
  const argumentsMap = new Map<string, string>();

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (!argument.startsWith('--')) {
      throw new Error(`Unexpected argument: ${argument}`);
    }

    const [name, inlineValue] = argument.slice(2).split('=', 2);
    const value = inlineValue ?? argumentsList[++index];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${name}`);
    }

    argumentsMap.set(name, value);
  }

  const platform = platformAliases[(argumentsMap.get('platform') ?? 'steam').toLowerCase()];
  const format = (argumentsMap.get('format') ?? 'csv').toLowerCase() as OutputFormat;
  const count = Number(argumentsMap.get('count') ?? 1);

  if (!platform) {
    throw new Error('Unsupported platform. Use steam, epic, xbox, psn, or gog.');
  }
  if (!Number.isInteger(count) || count < 1) {
    throw new Error('--count must be a positive integer.');
  }
  if (format !== 'csv' && format !== 'tsv') {
    throw new Error('--format must be csv or tsv.');
  }

  return {
    platform,
    count,
    productName: argumentsMap.get('product-name') ?? 'MystiGame Standard',
    region: argumentsMap.get('region') ?? 'Global',
    format,
    output: argumentsMap.get('output') ?? `keys.${format}`,
  };
}

function createKey(platform: Platform): string {
  return keyFormats[platform]
    .map((length) => {
      let segment = '';
      for (let index = 0; index < length; index += 1) {
        segment += alphabet[randomInt(alphabet.length)];
      }
      return segment;
    })
    .join('-');
}

function escapeCell(value: string, delimiter: string): string {
  if (delimiter === '\t') {
    return value.replace(/[\r\n\t]/g, ' ');
  }

  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function createDocument(options: GeneratorOptions): string {
  const delimiter = options.format === 'csv' ? ',' : '\t';
  const rows = [
    ['Key', 'Product Name', 'Region'],
    ...Array.from({ length: options.count }, () => [
      createKey(options.platform),
      options.productName,
      options.region,
    ]),
  ];

  return `${rows
    .map((row) => row.map((cell) => escapeCell(cell, delimiter)).join(delimiter))
    .join('\n')}\n`;
}

function printUsage(): void {
  console.log(`Usage: npx ts-node src/scripts/generate-keys.ts [options]

Options:
  --platform <name>       steam, epic, xbox, psn, or gog (default: steam)
  --count <number>        Number of keys to generate (default: 1)
  --product-name <name>   Product name (default: MystiGame Standard)
  --region <name>         Region (default: Global)
  --format <csv|tsv>      Output format (default: csv)
  --output <path>         Output file (default: keys.<format>)
`);
}

async function main(): Promise<void> {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    printUsage();
    return;
  }

  const options = parseArguments(process.argv.slice(2));
  await writeFile(options.output, createDocument(options), 'utf8');
  console.log(`Generated ${options.count} ${options.platform} key(s) in ${options.output}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});