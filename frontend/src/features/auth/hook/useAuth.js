import { useDispatch } from "react-redux";
import { register, login, getMe, logout, updateUsername as updateUsernameApi } from "../service/auth.api";
import { setUser, setLoading, setError, updateUsername, setHasSetUsername } from "../auth.slice";
import { resetChat } from "../../chat/chat.slice";


export function useAuth() {


    const dispatch = useDispatch()

    async function handleRegister({ email, username, password }) {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            const data = await register({ email, username, password })
            return true
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Registration failed"))
            return false
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogin({ email, password }) {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            const data = await login({ email, password })
            dispatch(setUser(data.user))
            return true
        } catch (err) {
            dispatch(setError(err.response?.data?.message || "Login failed"))
            return false
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleGetMe() {
        try {
            dispatch(setLoading(true))
            const data = await getMe()
            dispatch(setUser(data.user))
        } catch (err) {
            if (err?.response?.status !== 401 && err?.response?.status !== 403) {
                dispatch(setError(err.response?.data?.message || "Failed to fetch user data"))
            }
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogout() {
        try {
            await logout()
        } catch (err) {
            // proceed with local logout even if API fails
        }
        dispatch(setUser(null))
        dispatch(setError(null))
        dispatch(resetChat())
        return true
    }

    async function handleUpdateUsername(username) {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            const data = await updateUsernameApi({ username });
            dispatch(updateUsername(data.user.username));
            dispatch(setHasSetUsername());
            return { success: true };
        } catch (err) {
            return { 
                success: false, 
                message: err.response?.data?.message || "Failed to update username" 
            };
        } finally {
            dispatch(setLoading(false));
        }
    }

    return {
        handleRegister,
        handleLogin,
        handleGetMe,
        handleLogout,
        handleUpdateUsername,
    }
}