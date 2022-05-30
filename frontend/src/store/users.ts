import { IUsersWithShare } from "@interfaces/csw";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "store";

const initialState = [{ address: "", share: 0, balance: 0 }] as IUsersWithShare;

const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        setUsers(state, action) {
            //action : { type : "users/createUsers", payload: owners }
            const owners = action.payload;
            const usersOfCSW = owners.map((user: string) => {
                return { address: user, share: null, balance: null };
            });
            return (state = usersOfCSW);
        },
        updateUsersBalance(state, action) {
            //action { type : "users/create", payload: owners }
            const newState = state.map((user) => {
                const { address, share } = user;
                if (address == action.payload.sender) {
                    return {
                        ...user,
                        address: action.payload.sender,
                        share,
                        balance: action.payload.balance,
                    };
                } else {
                    return user;
                }
            });
            return (state = newState);
        },
        updateShareUsers(state, action) {
            /*
            action : 
            { 
                type : "users/updateShareUsers", 
                payload: {
                    address: users.address,
                    share: users.share,
                }
            } 
            */
            return state.map((user) => {
                if (user.address == action.payload.address) {
                    return {
                        ...user,
                        address: action.payload.address,
                        share: action.payload.share,
                    };
                } else {
                    return user;
                }
            });
        },
    },
});

//actions creators
export const { setUsers, updateUsersBalance, updateShareUsers } =
    usersSlice.actions;

export const usersOfCSW = (state: RootState) => state.users;

export default usersSlice.reducer;
