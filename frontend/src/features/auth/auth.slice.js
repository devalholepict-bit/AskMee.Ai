import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        loading: true,
        error: null,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload
        },
        clearError: (state) => {
            state.error = null
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
        updateUsername: (state, action) => {
            if (state.user) {
                state.user.username = action.payload;
                state.user.hasSetUsername = true;
            }
        },
        setHasSetUsername: (state) => {
            if (state.user) {
                state.user.hasSetUsername = true;
            }
        }
    }
})

export const { setUser, clearError, setLoading, setError, updateUsername, setHasSetUsername } = authSlice.actions
export default authSlice.reducer