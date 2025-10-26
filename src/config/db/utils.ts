export async function getResult<T>(req: IDBRequest<T>): Promise<T> {
  if (req.readyState === "done") {
    try {
      return req.result;
    } catch {
      throw req.error;
    }
  }

  return new Promise<T>((resolve, reject) => {
    req.addEventListener("success", handleSuccess, { once: true });
    req.addEventListener("error", handleError, { once: true });

    function dispose() {
      req.removeEventListener("success", handleSuccess);
      req.removeEventListener("error", handleError);
    }

    function handleSuccess(this: IDBRequest<T>) {
      dispose();
      resolve(this.result);
    }

    function handleError(this: IDBRequest<T>) {
      dispose();
      reject(this.error);
    }
  });
}

export async function* cursorToIterable<TCur extends IDBCursor>(req: IDBRequest<TCur | null>) {
  while (true) {
    const cursor = await getResult(req);
    if (!cursor) return;
    const key: IDBValidKey | undefined = yield cursor;
    cursor.continue(key);
  }
}

export const nextOrderFrom = (orderAwares: { order: number }[]) =>
  orderAwares.reduce((pevOrder, { order }) => Math.max(pevOrder, order), 0) + 1;
