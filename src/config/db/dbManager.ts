import { getResult } from "./utils";
import { nanoid } from "nanoid";

const DB_NAME = "stages";
const DB_VERSION = 1;

type DBInitializer = (this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) => any;

export class DBManager {
  private static readonly initializers = new Set<DBInitializer>();
  readonly id = nanoid();
  private _db?: IDBDatabase;

  static addInitializer(initializer: DBInitializer): () => void {
    this.initializers.add(initializer);
    return () => {
      this.initializers.delete(initializer);
    };
  }

  acquireDB() {
    if (!this._db) throw new DOMException("Database was not initialized", "InvalidStateError");
    return this._db;
  }

  async initialize() {
    const dbRes = indexedDB.open(DB_NAME, DB_VERSION);
    let upgradePromise: Promise<any> | undefined;
    dbRes.addEventListener("upgradeneeded", function (...args) {
      upgradePromise = Promise.all([...DBManager.initializers].map((i) => i.apply(this, args)));
    });
    this._db = await getResult(dbRes);
    await upgradePromise;
    const mgr = this;
    this._db.addEventListener("close", function () {
      if (mgr._db === this) mgr._db = undefined;
    });
  }

  destroy() {
    this._db?.close();
  }
}
