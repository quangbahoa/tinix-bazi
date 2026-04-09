import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ onClose, onSuccess }) => {
    const [mode, setMode] = useState('login'); // login or register
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'login') {
                await login(identifier, password);
            } else {
                await register(identifier, password, name, username, inviteCode);
            }
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleModeSwitch = (newMode) => {
        setMode(newMode);
        setError('');
    };

    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>

                <div className="auth-header">
                    <h2>🔮 {mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}</h2>
                    <p className="auth-subtitle">
                        {mode === 'login'
                            ? 'Đăng nhập để sử dụng dịch vụ tư vấn'
                            : 'Đăng ký nhận ngay 100 Linh Thạch miễn phí'}
                    </p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    {mode === 'register' && (
                        <div className="form-group">
                            <label>Họ tên</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nhập họ tên của bạn"
                                className="glass-input"
                            />
                        </div>
                    )}

                    {mode === 'register' && (
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Chỉ chữ và số (A-Z, a-z, 0-9)"
                                className="glass-input"
                                required
                            />
                        </div>
                    )}

                    {mode === 'register' && (
                        <div className="form-group">
                            <label>Invite Code (debug)</label>
                            <input
                                type="text"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                placeholder="Nhập API key provisioning"
                                className="glass-input"
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>{mode === 'login' ? 'Email hoặc Username' : 'Email'}</label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder={mode === 'login' ? 'email@example.com hoặc username' : 'email@example.com'}
                            className="glass-input"
                            required
                            autoComplete={mode === 'login' ? 'username' : 'email'}
                        />
                    </div>

                    <div className="form-group">
                        <label>Mật khẩu</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ít nhất 6 ký tự"
                            className="glass-input"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-auth-submit"
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : (mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký')}
                    </button>
                </form>

                <div className="auth-footer">
                    {mode === 'login' ? (
                        <p>
                            Chưa có tài khoản?{' '}
                            <button
                                className="btn-link"
                                onClick={() => handleModeSwitch('register')}
                            >
                                Đăng ký ngay
                            </button>
                        </p>
                    ) : (
                        <p>
                            Đã có tài khoản?{' '}
                            <button
                                className="btn-link"
                                onClick={() => handleModeSwitch('login')}
                            >
                                Đăng nhập
                            </button>
                        </p>
                    )}
                </div>

                <div className="auth-bonus">
                    <span className="bonus-icon">💎</span>
                    <span>Đăng ký nhận ngay <strong>100 Linh Thạch</strong></span>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
