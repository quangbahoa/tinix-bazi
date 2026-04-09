import React from 'react';
import './QuickDivination.css';

const FEATURES = [
    { path: '/laso', label: 'Lá số', icon: '📜' },
    { path: '/phantich', label: 'Phân tích', icon: '🧭' },
    { path: '/xemngay', label: 'Xem ngày', icon: '📅' },
    { path: '/duyenso', label: 'Duyên số', icon: '💞' },
    { path: '/xinque', label: 'Xin quẻ', icon: '🪬' },
    { path: '/tuvan', label: 'Tư vấn', icon: '💬' }
];

const QuickDivination = () => {
    return (
        <div className="quick-divination-container quick-feature-container glass-card">
            <div className="quick-header">
                <h3 className="quick-title">Chức Năng</h3>
                <p className="quick-subtitle">Truy cập nhanh các tiện ích chính</p>
            </div>

            <div className="feature-grid">
                {FEATURES.map((feature) => (
                    <button
                        key={feature.path}
                        type="button"
                        className="feature-card-btn"
                        onClick={() => {
                            window.location.href = feature.path;
                        }}
                    >
                        <span className="feature-card-icon">{feature.icon}</span>
                        <span className="feature-card-label">{feature.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickDivination;
