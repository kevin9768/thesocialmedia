import { createSlice } from "@reduxjs/toolkit";
import { AuthState } from "../Types/AuthState";

const initialState: AuthState = {
  username: null,
  error: null,
  loggedIn: false
}


export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      if (action.payload.result === 'success') {
        state.loggedIn = true;
        state.username = action.payload.username;
        state.error = null;
      }
      else {
        state.error = true;
      }

    },
    logout: (state) => {
      state.username = null;
      state.loggedIn = false;
    },
    register: (state, action: any) => {
      if (action.payload.result === 'success') {
        state.loggedIn = true;
        state.username = action.payload.username;
        state.error = null;
      }
      else {
        state.error = true;
      }
    }
  }
});

export const { login, logout, register } = authSlice.actions;

export default authSlice.reducer;

