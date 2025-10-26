import { DBManager } from "./dbManager";
import { cursorToIterable, getResult } from "./utils";
import { nanoid } from "nanoid";
import { ContentAddModel, ContentDAL, ContentModel, TextAlign } from "../types";

function withDefaults(model: ContentAddModel, id: string): ContentModel {
  if (model.kind === "text") {
    const { text = "", align = TextAlign.left } = model;
    return { ...model, text, align, id };
  }
  return { ...model, id };
}

export class IDBContentDAL implements ContentDAL {
  static readonly tableName = "content";
  static readonly columnIdName = "columnId";

  constructor(private readonly tx: IDBTransaction) {}

  static getEntityNames(): string[] {
    return [this.tableName];
  }

  async getById(id: string): Promise<ContentModel> {
    const req = this.getStore().get(id);
    return getResult(req);
  }

  async getByColumnId(columnId: string, count?: number): Promise<ContentModel[]> {
    const req = this.getColIdIdx().getAll(columnId, count);
    return getResult(req);
  }

  async add(content: ContentAddModel): Promise<ContentModel> {
    const newContent = withDefaults(content, nanoid());
    const req = this.getStore().add(newContent);
    await getResult(req);
    return newContent;
  }

  async put(data: ContentModel): Promise<ContentModel> {
    const req = this.getStore().put(data);
    await getResult(req);
    return data;
  }

  async deleteByColumnId(columnId: string): Promise<void> {
    const deletePromises: Promise<void>[] = [];
    for await (const cur of cursorToIterable(this.getColIdIdx().openCursor(columnId))) {
      deletePromises.push(getResult(cur.delete()));
    }
    await Promise.all(deletePromises);
  }

  protected getStore() {
    return this.tx.objectStore(IDBContentDAL.tableName);
  }

  protected getColIdIdx() {
    return this.getStore().index(IDBContentDAL.columnIdName);
  }
}

DBManager.addInitializer(function initContent() {
  const db = this.result;
  const store = db.createObjectStore(IDBContentDAL.tableName, { keyPath: "id" });
  store.createIndex(IDBContentDAL.columnIdName, IDBContentDAL.columnIdName, { unique: false });
});
