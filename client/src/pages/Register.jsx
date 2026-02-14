import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState('');
    const { register, user, error, clearError, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate('/', { replace: true });
    }, [user, navigate]);

    useEffect(() => {
        clearError();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (password !== confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        const success = await register(name, email, password);
        if (success) navigate('/', { replace: true });
    };

    const displayError = localError || error;

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="brand">
                        <h1>💰 SpendWise</h1>
                    </div>
                    <h2>Create account</h2>
                    <p className="subtitle">Start tracking your expenses today</p>

                    {displayError && (
                        <div className="alert alert-error">
                            <span>⚠️</span> {displayError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="reg-name">Full Name</label>
                            <input
                                id="reg-name"
                                type="text"
                                className="form-control"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="reg-email">Email</label>
                            <input
                                id="reg-email"
                                type="email"
                                className="form-control"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="reg-password">Password</label>
                                <input
                                    id="reg-password"
                                    type="password"
                                    className="form-control"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="reg-confirm">Confirm</label>
                                <input
                                    id="reg-confirm"
                                    type="password"
                                    className="form-control"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg btn-block"
                            disabled={loading}
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
