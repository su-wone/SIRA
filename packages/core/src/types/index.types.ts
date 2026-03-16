export interface IndexEntry {
  id: string;
  title: string;
  status: string;
  assignee?: string;
  priority: string;
  area?: string;
  epic_id?: string;
  story_id?: string;
  related_files: string[];
  tags: string[];
  start_date?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  /** Relative path to the .md file from project root */
  file_path: string;
  /** File modification time (ISO string) for incremental updates */
  file_mtime: string;
}

export interface IndexFile {
  version: string;
  generated_at: string;
  entries: IndexEntry[];
}
