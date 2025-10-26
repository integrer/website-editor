import { IDBRowDAL } from "./row";
import { getResult } from "./utils";
import { DBManager } from "./dbManager";
import { nanoid } from "nanoid";
import { StageDAL, StageModel } from "../types";

export class IDBStageDAL implements StageDAL {
  static readonly tableName = "stages";

  constructor(private readonly tx: IDBTransaction) {}

  static getEntityNames(): string[] {
    return [this.tableName, ...IDBRowDAL.getEntityNames()];
  }

  async getAll(count?: number): Promise<StageModel[]> {
    const req = this.getStore().getAll(null, count);
    return Promise.all(await getResult(req));
  }

  async put(data: StageModel): Promise<StageModel> {
    const req = this.getStore().put(data);
    await getResult(req);
    return data;
  }

  async add(): Promise<StageModel> {
    const id = nanoid();
    const newData = { id };
    const req = this.getStore().add(newData);

    await getResult(req);
    return newData;
  }

  async delete(id: string): Promise<void> {
    await Promise.all([getResult(this.getStore().delete(id)), this.getRowDAL().deleteByStageId(id)]);
  }

  protected getStore() {
    return this.tx.objectStore(IDBStageDAL.tableName);
  }

  private getRowDAL() {
    return new IDBRowDAL(this.tx);
  }
}

DBManager.addInitializer(function initStages() {
  const db = this.result;
  const store = db.createObjectStore(IDBStageDAL.tableName, { keyPath: "id" });
  return new Promise<void>((resolve, reject) => {
    store.transaction.addEventListener("complete", () => {
      (async () => {
        await new IDBStageDAL(db.transaction(IDBStageDAL.getEntityNames(), "readwrite")).add();
        resolve();
      })();
    });
    store.transaction.addEventListener("error", function () {
      reject(store.transaction.error);
    });
  });
});
