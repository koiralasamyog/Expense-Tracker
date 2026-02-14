import { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

const initialState = {
    user: JSON.parse(localStorage.getItem('user')),
    token: localStorage.getItem('token'),
    loading: true,
    error: null,
};

function authReducer(state, action) {
    switch (action.type) {
        case 'AUTH_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                loading: false,
                error: null,
            };
        case 'AUTH_ERROR':
            return {
                ...state,
                user: null,
                token: null,
                loading: false,
                error: action.payload,
            };
        case 'USER_LOADED':
            return {
                ...state,
                user: action.payload,
                loading: false,
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                token: null,
                loading: false,
                error: null,
            };
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        case 'SET_LOADING':
            return { ...state, loading: true };
        default:
            return state;
    }
}

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Load user on mount if token exists
    useEffect(() => {
        const loadUser = async () => {
            if (!state.token) {
                dispatch({ type: 'AUTH_ERROR', payload: null });
                return;
            }
            try {
                const res = await api.get('/auth/me');
                dispatch({ type: 'USER_LOADED', payload: res.data });
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                dispatch({ type: 'AUTH_ERROR', payload: null });
            }
        };
        loadUser();
    }, []);

    const register = async (name, email, password) => {
        dispatch({ type: 'SET_LOADING' });
        try {
            const res = await api.post('/auth/register', { name, email, password });
            const { token, ...user } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
            return true;
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.response?.data?.errors?.[0]?.msg ||
                'Registration failed';
            dispatch({ type: 'AUTH_ERROR', payload: msg });
            return false;
        }
    };

    const login = async (email, password) => {
        dispatch({ type: 'SET_LOADING' });
        try {
            const res = await api.post('/auth/login', { email, password });
            const { token, ...user } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
            return true;
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.response?.data?.errors?.[0]?.msg ||
                'Login failed';
            dispatch({ type: 'AUTH_ERROR', payload: msg });
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
    };

    const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

    return (
        <AuthContext.Provider
            value={{
                user: state.user,
                token: state.token,
                loading: state.loading,
                error: state.error,
                register,
                login,
                logout,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
