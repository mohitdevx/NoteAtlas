import { access, mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const NOTES_DIR = path.join(process.cwd(), 'public', 'notes');
const OUTPUT_FILE = path.join(process.cwd(), 'src', 'notes-index.json');
const MARKDOWN_EXTENSION = /\.md$/i;

const stripMarkdownExtension = (fileName) => fileName.replace(MARKDOWN_EXTENSION, '');

const sortByName = (left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: 'base' });

const createFileNode = (fileName, relativeSegments) => ({
  name: stripMarkdownExtension(fileName),
  type: 'file',
  path: `/notes/${[...relativeSegments, fileName].join('/')}`,
});

const readDirectoryNodes = async (absoluteDir, relativeSegments, rootFiles) => {
  const entries = await readdir(absoluteDir, { withFileTypes: true });
  const visibleEntries = entries
    .filter((entry) => !entry.name.startsWith('.'))
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: 'base' }));

  const folderNodes = [];
  const fileNodes = [];

  for (const entry of visibleEntries) {
    const nextAbsolutePath = path.join(absoluteDir, entry.name);

    if (entry.isDirectory()) {
      const children = await readDirectoryNodes(nextAbsolutePath, [...relativeSegments, entry.name], rootFiles);

      if (children.length > 0) {
        folderNodes.push({
          name: entry.name,
          type: 'folder',
          children,
        });
      }

      continue;
    }

    if (!entry.isFile() || !MARKDOWN_EXTENSION.test(entry.name)) {
      continue;
    }

    const fileNode = createFileNode(entry.name, relativeSegments);

    if (relativeSegments.length === 0) {
      rootFiles.push(fileNode);
    } else {
      fileNodes.push(fileNode);
    }
  }

  return [...folderNodes.sort(sortByName), ...fileNodes.sort(sortByName)];
};

const generateNotesIndex = async () => {
  let notesTree = [];

  try {
    await access(NOTES_DIR);
  } catch {
    await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
    await writeFile(OUTPUT_FILE, `${JSON.stringify([], null, 2)}\n`, 'utf8');
    console.warn(`No notes directory found at ${NOTES_DIR}. Wrote empty index.`);
    return;
  }

  const rootFiles = [];
  const nestedItems = await readDirectoryNodes(NOTES_DIR, [], rootFiles);

  if (rootFiles.length > 0) {
    notesTree.push({
      name: 'Global',
      type: 'folder',
      children: rootFiles.sort(sortByName),
    });
  }

  notesTree = [...notesTree, ...nestedItems];

  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, `${JSON.stringify(notesTree, null, 2)}\n`, 'utf8');

  console.log(`Generated notes index with ${notesTree.length} root items at ${OUTPUT_FILE}`);
};

generateNotesIndex().catch((error) => {
  console.error('Failed to generate notes index:', error);
  process.exitCode = 1;
});
