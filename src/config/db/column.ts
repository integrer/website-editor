import { IDBContentDAL } from "./content";
import { cursorToIterable, getResult, nextOrderFrom } from "./utils";
import { DBManager } from "./dbManager";
import { nanoid } from "nanoid";
import { ColumnAddModel, ColumnDAL, ColumnModel } from "../types";

export class IDBColumnDAL implements ColumnDAL {
  static readonly tableName = "columns";
  static readonly rowIdName = "rowId";

  constructor(private readonly tx: IDBTransaction) {}

  static getEntityNames(): string[] {
    return [this.tableName, ...IDBContentDAL.getEntityNames()];
  }

  async get(id: string): Promise<ColumnModel> {
    return getResult(this.getStore().get(id));
  }

  async getByRowId(rowId: string, count?: number): Promise<ColumnModel[]> {
    const req = this.getStore().index(IDBColumnDAL.rowIdName).getAll(rowId, count);
    return Promise.all(await getResult(req));
  }

  async add(data: ColumnAddModel): Promise<ColumnModel> {
    const id = nanoid();
    const column = { ...data, order: data.order ?? (await this.nextOrder(data.rowId)), id };
    await getResult(this.getStore().add(column));
    return column;
  }

  async put(data: ColumnModel): Promise<void> {
    await getResult(this.getStore().put(data));
  }

  async deleteByRowId(rowId: string, predicate: (id: string) => boolean = () => true): Promise<void> {
    const deletePromises: Promise<void>[] = [];
    const contentDAL = this.getContentDAL();
    for await (const cur of cursorToIterable(this.getStore().index(IDBColumnDAL.rowIdName).openCursor(rowId))) {
      const id = cur.key as string;
      if (predicate(id)) deletePromises.push(getResult(cur.delete()), contentDAL.deleteByColumnId(cur.key as string));
    }
    await Promise.all(deletePromises);
  }

  protected async nextOrder(rowId: string): Promise<number> {
    return nextOrderFrom(await this.getByRowId(rowId));
  }

  protected getStore() {
    return this.tx.objectStore(IDBColumnDAL.tableName);
  }

  private getContentDAL() {
    return new IDBContentDAL(this.tx);
  }
}

DBManager.addInitializer(function initColumn() {
  const db = this.result;
  const store = db.createObjectStore(IDBColumnDAL.tableName, { keyPath: "id" });
  store.createIndex(IDBColumnDAL.rowIdName, IDBColumnDAL.rowIdName, { unique: false });
});
