import { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "../utils";

export type SelectedData = { kind: "stage" } | { kind: "row" | "column"; id: string };

export interface StageState {
  selected: SelectedData;
}

const initialState: StageState = { selected: { kind: "stage" } };

const name = "stages";

const getNextDistinctState = (prevState: SelectedData, newState: SelectedData) =>
  prevState !== newState &&
  (prevState.kind !== newState.kind ||
    (prevState.kind !== "stage" && prevState.id !== (newState as Extract<SelectedData, { id: string }>).id))
    ? newState
    : prevState;

export const stageSlice = createSlice({
  initialState,
  name,
  reducers: {
    selectRow: (state: StageState, { payload: id }: PayloadAction<string>) => {
      state.selected = getNextDistinctState(state.selected, { kind: "row", id });
    },
    selectColumn: (state: StageState, { payload: id }: PayloadAction<string>) => {
      state.selected = getNextDistinctState(state.selected, { kind: "column", id });
    },
    select: (state, { payload }: PayloadAction<SelectedData>) => {
      state.selected = getNextDistinctState(state.selected, payload);
    },
  },
  selectors: {
    getSelected: (state) => state.selected,
  },
});

export const { selectRow, selectColumn, select } = stageSlice.actions;
export const { getSelected } = stageSlice.selectors;
