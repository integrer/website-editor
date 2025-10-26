import { IDBColumnDAL } from "./column";
import { cursorToIterable, getResult, nextOrderFrom } from "./utils";
import { DBManager } from "./dbManager";
import { nanoid } from "nanoid";
import { RowAddModel, RowDAL, RowModel } from "../types";

export class IDBRowDAL implements RowDAL {
  static readonly tableName = "rows";
  static readonly stageIdName = "stageId";

  constructor(private readonly tx: IDBTransaction) {}

  static getEntityNames(): string[] {
    return [this.tableName, ...IDBColumnDAL.getEntityNames()];
  }

  async getById(id: string): Promise<RowModel> {
    const req = this.getStore().get(id);
    return await getResult(req);
  }

  async getByStageId(rowId: string, count?: number): Promise<RowModel[]> {
    const req = this.getStageIdIdx().getAll(rowId, count);
    return Promise.all(await getResult(req));
  }

  async add(data: RowAddModel): Promise<RowModel> {
    const id = nanoid();
    const newRow = { ...data, order: data.order ?? (await this.nextOrder(data.stageId)), id };
    const req = this.getStore().add(newRow);
    await getResult(req);
    return newRow;
  }

  async put(data: RowModel): Promise<void> {
    const req = this.getStore().put(data);
    await getResult(req);
  }

  async deleteByStageId(stageId: string, predicate: (id: string) => boolean = () => true): Promise<void> {
    const deletePromises: Promise<void>[] = [];
    const columnDAL = this.getColumnDAL();
    for await (const cur of cursorToIterable(this.getStageIdIdx().openCursor(stageId))) {
      const id = cur.key as string;
      if (predicate(id)) deletePromises.push(getResult(cur.delete()), columnDAL.deleteByRowId(cur.key as string));
    }
    await Promise.all(deletePromises);
  }

  protected async nextOrder(stageId: string): Promise<number> {
    return nextOrderFrom(await this.getByStageId(stageId));
  }

  protected getStore() {
    return this.tx.objectStore(IDBRowDAL.tableName);
  }

  protected getStageIdIdx() {
    return this.getStore().index(IDBRowDAL.stageIdName);
  }

  private getColumnDAL() {
    return new IDBColumnDAL(this.tx);
  }
}

DBManager.addInitializer(function initRow() {
  const db = this.result;
  const store = db.createObjectStore(IDBRowDAL.tableName, { keyPath: "id" });
  store.createIndex(IDBRowDAL.stageIdName, IDBRowDAL.stageIdName, { unique: false });
});
