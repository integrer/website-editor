import { api } from "../api";
import { selectFactoryNotNull } from "../dal";
import {
  ColumnAddModel,
  ContentAddModel,
  ContentModel,
  RowAddModel,
  RowModel,
  StageModel,
} from "../../types";

const errRes = <T>(err: T) => ({ error: err ?? null });

const stageApi = api.injectEndpoints({
  endpoints: (build) => ({
    //// Stages
    ////////////////////////////////
    getFirstStage: build.query({
      queryFn: async (
        _a: void,
        { getState }
      ): Promise<{ error: unknown; data?: undefined } | { data: StageModel; error?: undefined }> => {
        try {
          const factory = selectFactoryNotNull(getState() as any);
          const data = (await factory.getStageDAL(true).getAll(1))[0];
          if (!data) return { error: new TypeError("No stage found.") };
          return { data };
        } catch (e) {
          return errRes(e);
        }
      },
      providesTags: (res) => [{ type: "STAGE", id: res?.id }],
    }),

    //// Rows
    ////////////////////////////////
    getRowsByStageId: build.query({
      queryFn: async (stageId: string, { getState }) => {
        try {
          const factory = selectFactoryNotNull(getState() as any);
          const data = await factory.getRowDAL(true).getByStageId(stageId);
          return { data: [...data].sort((a, b) => a.order - b.order) };
        } catch (e) {
          return errRes(e);
        }
      },
      providesTags: (result, _err, arg) => [
        { type: "STAGE_CHILDREN", id: arg },
        ...(result?.map(({ id }) => ({ type: "ROW" as const, id })) || []),
      ],
    }),
    addRow: build.mutation({
      queryFn: async (model: RowAddModel, { getState }) => {
        try {
          const factory = selectFactoryNotNull(getState() as any);
          const data = await factory.getRowDAL().add(model);
          return { data };
        } catch (e) {
          return errRes(e);
        }
      },
      invalidatesTags: (_res, err, { stageId }) => (err === undefined ? [{ type: "STAGE_CHILDREN", id: stageId }] : []),
    }),
    putRow: build.mutation({
      queryFn: async (model: RowModel, { getState }) => {
        try {
          const factory = selectFactoryNotNull(getState() as any);
          await factory.getRowDAL().put(model);
          return { data: null };
        } catch (e) {
          return errRes(e);
        }
      },
      invalidatesTags: (_res, err, { id, stageId }) =>
        err === undefined
          ? [
              { type: "STAGE_CHILDREN", id: stageId },
              { type: "ROW", id },
            ]
          : [],
    }),

    //// Columns
    ////////////////////////////////
    getColumnById: build.query({
      queryFn: async (id: string, { getState }) => {
        try {
          const factory = selectFactoryNotNull(getState() as any);
          const data = await factory.getColumnDAL(true).get(id);
          return { data };
        } catch (e) {
          return errRes(e);
        }
      },
      providesTags: (res, _err, id) => [{ type: "COLUMN", id }],
    }),
    getColumnsByRowId: build.query({
      queryFn: async (rowId: string, { getState }) => {
        try {
          const factory = selectFactoryNotNull(getState() as any);
          const data = await factory.getColumnDAL(true).getByRowId(rowId);
          return { data: [...data].sort((a, b) => a.order - b.order) };
        } catch (e) {
          return errRes(e);
        }
      },
      providesTags: (result, _err, arg) => [
        { type: "ROW_CHILDREN", id: arg },
        ...(result?.map(({ id }) => ({ type: "COLUMN" as const, id })) || []),
      ],
    }),
    addColumn: build.mutation({
      queryFn: async (model: ColumnAddModel, { getState }) => {
        try {
          const factory = selectFactoryNotNull(getState() as any);
          const data = await factory.getColumnDAL().add(model);
          return { data };
        } catch (e) {
          return errRes(e);
        }
      },
      invalidatesTags: (_res, err, { rowId }) => (err === undefined ? [{ type: "ROW_CHILDREN", id: rowId }] : []),
    }),

    //// Content
    ////////////////////////////////
    getContentByColumnId: build.query({
      queryFn: async (columnId: string, { getState }) => {
        try {
          const factory = selectFactoryNotNull(getState() as any);
          const data: ContentModel | null = (await factory.getContentDAL(true).getByColumnId(columnId, 1))[0] || null;
          return { data };
        } catch (e) {
          return errRes(e);
        }
      },
      providesTags: (res, _err, columnId) => [
        { type: "COLUMN_CHILDREN", id: columnId },
        { type: "CONTENT", id: res?.id },
      ],
    }),
    addContent: build.mutation({
      queryFn: async ({ clean = true, ...model }: ContentAddModel & { clean?: boolean }, { getState }) => {
        try {
          const factory = selectFactoryNotNull(getState() as any);
          const dal = factory.getContentDAL();

          // Ensure there are no other content records left, since we normally don't want more than one content per a column
          if (clean) await dal.deleteByColumnId(model.columnId);

          const data = await dal.add(model);
          return { data };
        } catch (e) {
          return errRes(e);
        }
      },
      invalidatesTags: (_res, err, { columnId }) =>
        err === undefined ? [{ type: "COLUMN_CHILDREN", id: columnId }] : [],
    }),
    putContent: build.mutation({
      queryFn: async (model: ContentModel, { getState }) => {
        try {
          const factory = selectFactoryNotNull(getState() as any);
          const dal = factory.getContentDAL();

          const data = await dal.put(model);
          return { data };
        } catch (e) {
          return errRes(e);
        }
      },
      invalidatesTags: (_res, err, { columnId, id }) =>
        err === undefined
          ? [
              { type: "COLUMN_CHILDREN", id: columnId },
              { type: "CONTENT", id },
            ]
          : [],
    }),
  }),
});

export const {
  useGetFirstStageQuery,
  useGetRowsByStageIdQuery,
  useAddRowMutation,
  useGetColumnByIdQuery,
  useGetColumnsByRowIdQuery,
  useAddColumnMutation,
  useGetContentByColumnIdQuery,
  useAddContentMutation,
  usePutContentMutation,
} = stageApi;
