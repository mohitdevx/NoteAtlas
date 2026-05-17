import { useEffect, useMemo, useState } from 'react';
import NoteViewer from './NoteViewer';
import notesIndex from './notes-index.json';
import type { FolderNode, SidebarItem } from './types';

const sidebarItems = notesIndex as SidebarItem[];

const getFolderKey = (parentKey: string, folderName: string): string =>
  parentKey.length > 0 ? `${parentKey}/${folderName}` : folderName;

const findFirstFilePath = (items: SidebarItem[]): string | null => {
  for (const item of items) {
    if (item.type === 'file') {
      return item.path;
    }

    const nestedPath = findFirstFilePath(item.children);
    if (nestedPath !== null) {
      return nestedPath;
    }
  }

  return null;
};

const markAncestorFolders = (
  items: SidebarItem[],
  targetPath: string,
  parentFolderKey: string,
  expandedFolders: Set<string>,
): boolean => {
  let containsTarget = false;

  for (const item of items) {
    if (item.type === 'file') {
      if (item.path === targetPath) {
        containsTarget = true;
      }
      continue;
    }

    const folderKey = getFolderKey(parentFolderKey, item.name);
    const folderContainsTarget = markAncestorFolders(item.children, targetPath, folderKey, expandedFolders);

    if (folderContainsTarget) {
      expandedFolders.add(folderKey);
      containsTarget = true;
    }
  }

  return containsTarget;
};

interface SidebarTreeProps {
  items: SidebarItem[];
  depth: number;
  parentFolderKey: string;
  expandedFolders: Set<string>;
  selectedPath: string | null;
  onToggleFolder: (folderKey: string) => void;
  onSelectFile: (path: string) => void;
}

const SidebarTree = ({
  items,
  depth,
  parentFolderKey,
  expandedFolders,
  selectedPath,
  onToggleFolder,
  onSelectFile,
}: SidebarTreeProps) => (
  <ul className="space-y-1">
    {items.map((item) => {
      if (item.type === 'folder') {
        return (
          <SidebarFolderItem
            key={getFolderKey(parentFolderKey, item.name)}
            folder={item}
            depth={depth}
            parentFolderKey={parentFolderKey}
            expandedFolders={expandedFolders}
            selectedPath={selectedPath}
            onToggleFolder={onToggleFolder}
            onSelectFile={onSelectFile}
          />
        );
      }

      const isSelected = selectedPath === item.path;

      return (
        <li key={item.path}>
          <button
            type="button"
            onClick={() => onSelectFile(item.path)}
            className={`flex w-full items-center gap-2 rounded-md py-1.5 pr-2 text-left transition ${
              isSelected ? 'bg-brand-muted text-brand' : 'text-txt-main hover:bg-surface-muted'
            }`}
            style={{ paddingLeft: `${depth * 0.85 + 0.75}rem` }}
          >
            <i className="ri-file-text-line text-txt-muted" aria-hidden />
            <span className="truncate">{item.name}</span>
          </button>
        </li>
      );
    })}
  </ul>
);

interface SidebarFolderItemProps {
  folder: FolderNode;
  depth: number;
  parentFolderKey: string;
  expandedFolders: Set<string>;
  selectedPath: string | null;
  onToggleFolder: (folderKey: string) => void;
  onSelectFile: (path: string) => void;
}

interface BrandLockupProps {
  compact?: boolean;
}

const BrandLockup = ({ compact = false }: BrandLockupProps) => (
  <div className="leading-tight">
    <p className={`${compact ? 'text-base' : 'text-2xl'} font-serif font-semibold tracking-tight text-brand`}>Notes Atlas</p>
    <p className={`${compact ? 'text-[0.68rem]' : 'text-xs'} font-sans uppercase tracking-[0.12em] text-txt-muted`}>
      by mohitdevx
    </p>
  </div>
);

const SidebarFolderItem = ({
  folder,
  depth,
  parentFolderKey,
  expandedFolders,
  selectedPath,
  onToggleFolder,
  onSelectFile,
}: SidebarFolderItemProps) => {
  const folderKey = getFolderKey(parentFolderKey, folder.name);
  const isExpanded = expandedFolders.has(folderKey);

  return (
    <li>
      <button
        type="button"
        onClick={() => onToggleFolder(folderKey)}
        className="flex w-full items-center gap-2 rounded-md py-1.5 pr-2 text-left text-txt-main transition hover:bg-surface-muted"
        style={{ paddingLeft: `${depth * 0.85 + 0.75}rem` }}
      >
        <i className={isExpanded ? 'ri-folder-open-fill text-brand' : 'ri-folder-shared-line text-brand'} aria-hidden />
        <span className="truncate">{folder.name}</span>
      </button>

      {isExpanded ? (
        <div className="mt-1">
          <SidebarTree
            items={folder.children}
            depth={depth + 1}
            parentFolderKey={folderKey}
            expandedFolders={expandedFolders}
            selectedPath={selectedPath}
            onToggleFolder={onToggleFolder}
            onSelectFile={onSelectFile}
          />
        </div>
      ) : null}
    </li>
  );
};

const App = () => {
  const sidebarWidthClass = 'md:w-[22rem]';
  const firstFilePath = useMemo(() => findFirstFilePath(sidebarItems), []);
  const [selectedPath, setSelectedPath] = useState<string | null>(firstFilePath);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    const savedPreference = window.localStorage.getItem('notes-theme');
    if (savedPreference === 'dark') {
      return true;
    }

    if (savedPreference === 'light') {
      return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    const initialExpanded = new Set<string>();

    if (firstFilePath !== null) {
      markAncestorFolders(sidebarItems, firstFilePath, '', initialExpanded);
    }

    return initialExpanded;
  });

  const toggleFolder = (folderKey: string): void => {
    setExpandedFolders((previous) => {
      const next = new Set(previous);

      if (next.has(folderKey)) {
        next.delete(folderKey);
      } else {
        next.add(folderKey);
      }

      return next;
    });
  };

  const selectFile = (path: string): void => {
    setSelectedPath(path);
    setExpandedFolders((previous) => {
      const next = new Set(previous);
      markAncestorFolders(sidebarItems, path, '', next);
      return next;
    });

    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.classList.toggle('dark', isDark);
    window.localStorage.setItem('notes-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <div>
      <div className="min-h-screen bg-canvas font-sans text-txt-main transition-colors">
        <div className="fixed inset-x-0 top-0 z-20 border-b border-line bg-surface px-4 py-3 md:hidden">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsSidebarOpen((previous) => !previous)}
              className="rounded-md border border-line bg-surface-muted px-2.5 py-1.5 text-txt-main transition hover:bg-brand-muted"
              aria-label="Toggle sidebar"
            >
              <i className={isSidebarOpen ? 'ri-close-line' : 'ri-menu-line'} aria-hidden />
            </button>
            <BrandLockup compact />
            <button
              type="button"
              onClick={() => setIsDark((previous) => !previous)}
              className="rounded-md border border-line bg-surface-muted px-2.5 py-1.5 text-brand transition hover:bg-brand-muted"
              aria-label="Toggle theme"
            >
              <i className={isDark ? 'ri-sun-line' : 'ri-moon-clear-line'} aria-hidden />
            </button>
          </div>
        </div>

        {isSidebarOpen ? (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-surface-muted opacity-70 md:hidden"
            aria-label="Close sidebar backdrop"
          />
        ) : null}

        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[22rem] max-w-[88vw] border-r border-line bg-surface transition-transform duration-300 ${sidebarWidthClass} ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
        >
          <div className="flex h-full flex-col">
            <div className="hidden items-center justify-between border-b border-line px-4 py-4 md:flex">
              <BrandLockup />
              <button
                type="button"
                onClick={() => setIsDark((previous) => !previous)}
                className="rounded-md border border-line bg-surface-muted px-2.5 py-1.5 text-brand transition hover:bg-brand-muted"
                aria-label="Toggle theme"
              >
                <i className={isDark ? 'ri-sun-line' : 'ri-moon-clear-line'} aria-hidden />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto border-t border-line p-3 md:border-t-0">
              {sidebarItems.length > 0 ? (
                <SidebarTree
                  items={sidebarItems}
                  depth={0}
                  parentFolderKey=""
                  expandedFolders={expandedFolders}
                  selectedPath={selectedPath}
                  onToggleFolder={toggleFolder}
                  onSelectFile={selectFile}
                />
              ) : (
                <p className="rounded-md bg-surface-muted px-3 py-2 text-sm text-txt-muted">
                  No markdown files were indexed yet. Add notes to `public/notes` and restart.
                </p>
              )}
            </div>
          </div>
        </aside>

        <main className="min-h-screen bg-canvas p-4 pb-28 pt-20 md:ml-[22rem] md:p-8 md:pb-12 md:pt-8">
          <NoteViewer notePath={selectedPath} isDark={isDark} />
        </main>
      </div>
    </div>
  );
};

export default App;
