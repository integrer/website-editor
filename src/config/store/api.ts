import { createApi } from "@reduxjs/toolkit/query/react";
import { fakeBaseQuery } from "@reduxjs/toolkit/query";

const tagTypes = ["STAGE", "STAGE_CHILDREN", "ROW", "ROW_CHILDREN", "COLUMN", "COLUMN_CHILDREN", "CONTENT"] as const

export const api = createApi({
  baseQuery: fakeBaseQuery<unknown>(),
  endpoints: () => ({}),
  tagTypes,
});
