import { configureStore, PreloadedState } from '@reduxjs/toolkit';
import authSlice from './authSlice';

export const saveToLocalStorage = (state: any) => {
  const serializedState = JSON.stringify(state);
  localStorage.setItem('state', serializedState);
}

export const loadFromLocalStorage = () => {
  const serializedState = localStorage.getItem('state');
  if (serializedState === null) return undefined;
  return JSON.parse(serializedState);
}

export const persistedState = loadFromLocalStorage();

const store = configureStore({
  reducer: {
    auth: authSlice,
  },
  preloadedState: persistedState,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});



store.subscribe(() => saveToLocalStorage(store.getState()));

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
export const setupStore = (preloadedState?: PreloadedState<RootState>) => configureStore({
  reducer: {
    auth: authSlice,
  },
  preloadedState,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});