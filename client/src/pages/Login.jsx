import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, user, error, clearError, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate('/', { replace: true });
    }, [user, navigate]);

    useEffect(() => {
        clearError();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) navigate('/', { replace: true });
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="brand">
                        <h1>💰 SpendWise</h1>
                    </div>
                    <h2>Welcome back</h2>
                    <p className="subtitle">Sign in to manage your expenses</p>

                    {error && (
                        <div className="alert alert-error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="login-email">Email</label>
                            <input
                                id="login-email"
                                type="email"
                                className="form-control"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="login-password">Password</label>
                            <input
                                id="login-password"
                                type="password"
                                className="form-control"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg btn-block"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Don&apos;t have an account? <Link to="/register">Create one</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
