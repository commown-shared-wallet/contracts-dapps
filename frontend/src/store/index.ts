import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./users";

const store = configureStore({
    reducer: { users: usersReducer },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {users: UsersState, events: EventsState}
export type AppDispatch = typeof store.dispatch;

export default store;
