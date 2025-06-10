export interface Memo {
  id: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
  isArchived?: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface HeatmapValue {
  date: string;
  count: number;
}
