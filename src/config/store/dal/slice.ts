import { createSlice } from "../utils";
import { DALFactory } from "../../types";
import { PayloadAction } from "@reduxjs/toolkit";

const name = "dal";

interface DalState {
  factory?: DALFactory;
}

const initialState: DalState = {};

export const dalSlice = createSlice({
  name,
  reducers: {
    setFactory: (state, { payload }: PayloadAction<DALFactory>) => {
      state.factory = payload;
    },
    deleteFactory: (state) => {
      state.factory = undefined;
    },
  },
  selectors: {
    selectFactory: (state) => state.factory,
    selectFactoryNotNull: ({ factory }) => {
      if (!factory) throw new TypeError("Factory not found.");
      return factory;
    },
  },
  initialState,
});

export const { setFactory, deleteFactory } = dalSlice.actions;
export const { selectFactory, selectFactoryNotNull } = dalSlice.selectors;
