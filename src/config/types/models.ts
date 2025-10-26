export type Entity<T = unknown> = T & { id: string };

export type NewEntity<T = unknown> = T & { id?: undefined };

type WithPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface StageModel extends Entity {}

export interface RowData {
  stageId: string;
  order: number;
}

export type RowModel = Entity<RowData>;

export type RowAddModel = NewEntity<WithPartial<RowData, "order">>;

export interface ColumnData {
  rowId: string;
  order: number;
}

export type ColumnModel = Entity<ColumnData>;

export type ColumnAddModel = NewEntity<WithPartial<ColumnData, "order">>;

type ConditionalPartial<T, Condition extends boolean> = [Condition] extends [true] ? Partial<T> : T;

type ContentData<IsPartial extends boolean = false> =
  | (ConditionalPartial<ImageData, IsPartial> & { kind: "image" })
  | (ConditionalPartial<TextData, IsPartial> & { kind: "text" });

interface ContentRefs {
  columnId: string;
}

export type ContentAddModel = NewEntity<ContentRefs & ContentData<true>>;

export type ContentModel = Entity<ContentRefs & ContentData>;

export interface ImageData {
  url?: string;
  alt?: string;
}

export interface TextData {
  text: string;
  align: TextAlign;
}

export enum TextAlign {
  left = 1,
  center,
  right,
}
