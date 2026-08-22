import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CookieConsent = "unknown" | "all" | "necessary";

interface UiState {
  cookieConsent: CookieConsent;
}

const initialState: UiState = {
  cookieConsent: "unknown",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setCookieConsent(
      state,
      action: PayloadAction<Exclude<CookieConsent, "unknown">>,
    ) {
      state.cookieConsent = action.payload;
    },
  },
});

export const { setCookieConsent } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
