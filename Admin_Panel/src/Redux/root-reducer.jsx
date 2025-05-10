import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./features/User-slice";
const rootreducer = combineReducers({
    user: userReducer,
})

export default rootreducer;