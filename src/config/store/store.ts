import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { stageSlice } from "./stage";
import { api } from "./api";
import { dalSlice } from "./dal";

const notProd = !import.meta.env.PROD;

export const store = configureStore({
  devTools: notProd,
  reducer: combineSlices(api, dalSlice, stageSlice),
  middleware: (getDefaultMw) =>
    getDefaultMw({
      thunk: true,
      actionCreatorCheck: notProd,
      immutableCheck: notProd,
      serializableCheck: false,
    }).concat(api.middleware),
});

export type RootDispatch = typeof store.dispatch;
