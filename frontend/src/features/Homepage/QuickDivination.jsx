import React from 'react';
import './QuickDivination.css';

const FEATURES = [
    { id: 'laso', label: 'Lá số', path: '/laso', icon: '📊' },
    { id: 'phantich', label: 'Phân tích', path: '/phantich', icon: '🔍' },
    { id: 'xemngay', label: 'Xem ngày', path: '/xemngay', icon: '📅' },
    { id: 'duyenso', label: 'Duyên số', path: '/duyenso', icon: '💞' },
    { id: 'xinque', label: 'Xin quẻ', path: '/xinque', icon: '🎴' },
    { id: 'tuvan', label: 'Tư vấn', path: '/tuvan', icon: '🧠' }
];

const QuickDivination = () => {
    const goToPath = (path) => {
        window.location.href = path;
    };

    return (
        <div className="quick-divination-container glass-card">
            <div className="quick-header">
                <h3 className="quick-title">Chức Năng</h3>
                <p className="quick-subtitle">Truy cập nhanh các công cụ chính</p>
            </div>

            <div className="quick-feature-grid">
                {FEATURES.map((feature) => (
                    <button
                        key={feature.id}
                        type="button"
                        className="quick-feature-btn"
                        onClick={() => goToPath(feature.path)}
                    >
                        <span className="quick-feature-icon">{feature.icon}</span>
                        <span>{feature.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickDivination;
