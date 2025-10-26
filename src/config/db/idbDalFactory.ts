import { DBManager } from "./dbManager";
import { IDBStageDAL } from "./stage";
import { IDBRowDAL } from "./row";
import { IDBColumnDAL } from "./column";
import { IDBContentDAL } from "./content";
import { DALFactory } from "../types";

export class IdbDalFactory implements DALFactory {
  constructor(private readonly mgr: DBManager) {}

  getStageDAL(readOnly = false) {
    return this.getDAL(IDBStageDAL, readOnly);
  }

  getRowDAL(readOnly = false) {
    return this.getDAL(IDBRowDAL, readOnly);
  }

  getColumnDAL(readOnly = false) {
    return this.getDAL(IDBColumnDAL, readOnly);
  }

  getContentDAL(readOnly = false) {
    return this.getDAL(IDBContentDAL, readOnly);
  }

  protected getDAL<TCtor extends { new (tx: IDBTransaction): any; getEntityNames(): string[] }>(
    Ctor: TCtor,
    readOnly: boolean
  ): InstanceType<TCtor> {
    const storeNames = Ctor.getEntityNames();
    const mode = readOnly ? "readonly" : "readwrite";
    const tx = this.mgr.acquireDB().transaction(storeNames, mode);
    return new Ctor(tx);
  }

  toJSON() {
    return { mgrId: this.mgr.id };
  }
}
