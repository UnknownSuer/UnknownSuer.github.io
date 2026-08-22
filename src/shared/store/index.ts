import { configureStore } from "@reduxjs/toolkit";
import { leadApi } from "@/shared/api/lead-api";
import { uiReducer } from "@/shared/store/ui-slice";

export const makeStore = () =>
  configureStore({
    reducer: {
      ui: uiReducer,
      [leadApi.reducerPath]: leadApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(leadApi.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
