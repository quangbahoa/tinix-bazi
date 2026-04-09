import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GuestLoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(identifier, password);
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="guest-login-page">
            <div className="bazi-bg"></div>
            <div className="guest-login-wrap">
                <div className="auth-modal guest-login-card">
                    <div className="auth-header">
                        <h2>Đăng Nhập</h2>
                        <p className="auth-subtitle">Vui lòng đăng nhập</p>
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="email@example.com hoặc username"
                                className="glass-input"
                                required
                                autoComplete="username"
                            />
                        </div>

                        <div className="form-group">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu"
                                className="glass-input"
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <button type="submit" className="btn-auth-submit" disabled={loading}>
                            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GuestLoginPage;
