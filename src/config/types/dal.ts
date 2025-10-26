import {
  ColumnAddModel,
  ColumnData,
  ColumnModel,
  ContentAddModel,
  ContentModel,
  Entity,
  RowAddModel,
  RowModel,
  StageModel,
} from "./models";

export interface DALFactory {
  getStageDAL(readOnly?: boolean): StageDAL;
  getRowDAL(readOnly?: boolean): RowDAL;
  getColumnDAL(readOnly?: boolean): ColumnDAL;
  getContentDAL(readOnly?: boolean): ContentDAL;
}

export interface StageDAL {
  getAll(count?: number): Promise<StageModel[]>;
  put(model: StageModel): Promise<StageModel>;
  add(): Promise<StageModel>;
  delete(id: string): Promise<void>;
}

export interface RowDAL {
  getById(id: string): Promise<RowModel>;
  getByStageId(rowId: string, count?: number): Promise<RowModel[]>;
  add(model: RowAddModel): Promise<RowModel>;
  put(model: RowModel): Promise<void>;
  deleteByStageId(stageId: string, predicate?: (id: string) => boolean): Promise<void>;
}

export interface ColumnDAL {
  get(id: string): Promise<Entity<ColumnData>>;
  getByRowId(rowId: string, count?: number): Promise<ColumnModel[]>;
  add(model: ColumnAddModel): Promise<ColumnModel>;
  put(model: ColumnModel): Promise<void>;
  deleteByRowId(rowId: string, predicate?: (id: string) => boolean): Promise<void>;
}

export interface ContentDAL {
  getById(id: string): Promise<ContentModel>;
  getByColumnId(columnId: string, count?: number): Promise<ContentModel[]>;
  add(content: ContentAddModel): Promise<ContentModel>;
  put(data: ContentModel): Promise<ContentModel>;
  deleteByColumnId(columnId: string): Promise<void>;
}
