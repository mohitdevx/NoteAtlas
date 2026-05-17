export interface FileNode {
  name: string;
  type: 'file';
  path: string;
}

export interface FolderNode {
  name: string;
  type: 'folder';
  children: Array<FileNode | FolderNode>;
}

export type SidebarItem = FileNode | FolderNode;
