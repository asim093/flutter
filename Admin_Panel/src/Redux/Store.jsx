import { configureStore } from "@reduxjs/toolkit";
import rootreducer from "./root-reducer";
import storage from 'redux-persist/lib/storage';
import { persistReducer } from "redux-persist";
import { persistStore } from "redux-persist";

const persistConfig = {
    key: "root",
    storage,
}

const persistedReducer  = persistReducer(persistConfig, rootreducer)

export const store = configureStore({
    reducer: persistedReducer,
})

export const persistor = persistStore(store)