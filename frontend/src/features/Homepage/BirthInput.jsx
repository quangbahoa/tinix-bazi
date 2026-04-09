import React, { useMemo, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Select from 'react-select';
import QuickDivination from './QuickDivination';

import DatePicker from './DatePicker';
import Toast from '../../components/Toast';
import UserProfileModal from '../../components/UserProfileModal';
import AuthModal from '../../components/AuthModal';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG } from '../../config/api';
import {
    buildTimeZoneOptions,
    groupTimeZonesByContinent,
    DEFAULT_TIME_ZONE,
    normalizeTimeZone
} from '../../utils/timezoneUtils';

const DEFAULT_FORM_DATA = {
    name: '',
    gender: 'Nam',
    year: 1990,
    month: 6,
    day: 15,
    hour: 10,
    minute: 0,
    calendar: 'solar',
    timeZone: DEFAULT_TIME_ZONE
};

const GENDER_OPTIONS = [
    { value: 'Nam', label: 'Nam Mệnh' },
    { value: 'Nữ', label: 'Nữ Mệnh' }
];

const HOUR_OPTIONS = [
    { value: 0, label: 'Tý (子) • 23:00 - 01:00' },
    { value: 1, label: 'Sửu (丑) • 01:00 - 03:00' },
    { value: 3, label: 'Dần (寅) • 03:00 - 05:00' },
    { value: 5, label: 'Mão (卯) • 05:00 - 07:00' },
    { value: 7, label: 'Thìn (辰) • 07:00 - 09:00' },
    { value: 9, label: 'Tỵ (巳) • 09:00 - 11:00' },
    { value: 11, label: 'Ngọ (午) • 11:00 - 13:00' },
    { value: 13, label: 'Mùi (未) • 13:00 - 15:00' },
    { value: 15, label: 'Thân (申) • 15:00 - 17:00' },
    { value: 17, label: 'Dậu (酉) • 17:00 - 19:00' },
    { value: 19, label: 'Tuất (戌) • 19:00 - 21:00' },
    { value: 21, label: 'Hợi (亥) • 21:00 - 23:00' }
];

const normalizeSearchText = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const BirthInput = ({ onAnalyze, loading, onClearChart }) => {
    const { user, token, isAuthenticated, logout, refreshUser } = useAuth();
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [dailyCardKey, setDailyCardKey] = useState(0); // Force refresh Daily Card
    const hasInitialized = useRef(false);

    const handleLogout = () => {
        logout();
        hasInitialized.current = false;
        sessionStorage.removeItem('homepage_form_initialized');
        window.location.reload();
    };

    // Initialize form data - prefer sessionStorage, then user profile, then defaults
    const [formData, setFormData] = useState(() => {
        const savedForm = sessionStorage.getItem('homepage_form_data');
        if (savedForm) {
            try {
                const parsed = JSON.parse(savedForm);
                return {
                    ...DEFAULT_FORM_DATA,
                    ...parsed,
                    timeZone: normalizeTimeZone(parsed?.timeZone, DEFAULT_TIME_ZONE)
                };
            } catch (e) {
                console.error('Failed to parse saved form data:', e);
            }
        }
        return { ...DEFAULT_FORM_DATA };
    });

    // Save form data to sessionStorage whenever it changes
    useEffect(() => {
        sessionStorage.setItem('homepage_form_data', JSON.stringify(formData));
    }, [formData]);

    // Pre-fill with user's last data if logged in
    // Only runs ONCE per session — never overwrites user-edited data
    useEffect(() => {
        if (isAuthenticated && user?.bazi_data && !hasInitialized.current) {
            hasInitialized.current = true;

            // Skip if already initialized in this browser session (persists across remounts)
            const alreadyInitialized = sessionStorage.getItem('homepage_form_initialized');
            if (alreadyInitialized) return;

            // Only pre-fill if there's no existing form data with a name
            const savedForm = sessionStorage.getItem('homepage_form_data');
            const hasSavedName = savedForm && JSON.parse(savedForm).name;
            if (!hasSavedName) {
                setFormData(prev => ({
                    ...prev,
                    ...user.bazi_data,
                    timeZone: normalizeTimeZone(user?.bazi_data?.timeZone, DEFAULT_TIME_ZONE)
                }));
            }
            sessionStorage.setItem('homepage_form_initialized', 'true');
        }
    }, [isAuthenticated, user]);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [toast, setToast] = useState(null);
    const timeZoneOptions = useMemo(() => buildTimeZoneOptions(), []);
    const selectedTimeZone = normalizeTimeZone(formData.timeZone, DEFAULT_TIME_ZONE);
    const selectedTimeZoneOption = useMemo(
        () => timeZoneOptions.find((item) => item.value === selectedTimeZone) || null,
        [timeZoneOptions, selectedTimeZone]
    );
    const groupedTimeZoneOptions = useMemo(() => (
        groupTimeZonesByContinent(timeZoneOptions).map((group) => ({
            label: group.label,
            options: group.options.map((item) => ({
                value: item.value,
                label: item.label,
                searchText: `${item.countryLabel} ${item.value}`
            }))
        }))
    ), [timeZoneOptions]);
    const selectedGenderOption = useMemo(
        () => GENDER_OPTIONS.find((item) => item.value === formData.gender) || GENDER_OPTIONS[0],
        [formData.gender]
    );
    const selectedHourOption = useMemo(
        () => HOUR_OPTIONS.find((item) => item.value === formData.hour) || HOUR_OPTIONS[0],
        [formData.hour]
    );
    const filterTimeZoneOption = (candidate, rawInput) => {
        const keyword = normalizeSearchText(rawInput);
        if (!keyword) return true;
        const haystack = normalizeSearchText(candidate.data.searchText);
        return haystack.startsWith(keyword) || haystack.includes(` ${keyword}`);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;

        if (['hour'].includes(name)) {
            finalValue = parseInt(value) || 0;
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleDatePickerChange = (date) => {
        setFormData(prev => ({
            ...prev,
            year: date.year,
            month: date.month,
            day: date.day
        }));
    };
    const handleTimeZoneChange = (timeZone) => {
        setFormData(prev => ({ ...prev, timeZone: normalizeTimeZone(timeZone, DEFAULT_TIME_ZONE) }));
    };
    const handleTimeZoneSelect = (option) => {
        handleTimeZoneChange(option?.value || DEFAULT_TIME_ZONE);
    };
    const handleGenderSelect = (option) => {
        setFormData((prev) => ({ ...prev, gender: option?.value || 'Nam' }));
    };
    const handleHourSelect = (option) => {
        setFormData((prev) => ({ ...prev, hour: Number(option?.value ?? 10) }));
    };

    const handleDoiLaSo = () => {
        setShowDatePicker(false);
        setFormData({ ...DEFAULT_FORM_DATA });
        setDailyCardKey((k) => k + 1);
        onClearChart?.();
        setToast({ message: 'Đã xóa form và lá số đã lưu.', type: 'success' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation with toast instead of alert
        if (!formData.year || !formData.month || !formData.day) {
            setToast({ message: "Vui lòng chọn ngày sinh.", type: 'warning' });
            return;
        }

        // Save bazi data to user profile if logged in
        if (isAuthenticated && token) {
            try {
                const res = await fetch(`${API_CONFIG.AUTH}/profile`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        baziData: {
                            year: formData.year,
                            month: formData.month,
                            day: formData.day,
                            hour: formData.hour,
                            minute: formData.minute || 0,
                            gender: formData.gender,
                            calendar: formData.calendar || 'solar',
                            name: formData.name,
                            timeZone: normalizeTimeZone(formData.timeZone, DEFAULT_TIME_ZONE)
                        }
                    })
                });

                if (res.ok) {
                    await refreshUser(); // Update global auth state with new bazi_data
                    setDailyCardKey(prev => prev + 1); // Refresh Daily Card
                }
            } catch (err) {
                console.error('Failed to save bazi data:', err);
            }
        }

        onAnalyze({
            ...formData,
            timeZone: normalizeTimeZone(formData.timeZone, DEFAULT_TIME_ZONE)
        });
    };

    const formatSelectedDate = () => {
        const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const date = new Date(formData.year, formData.month - 1, formData.day);
        const weekday = weekdays[date.getDay()];
        return `${weekday}, ${formData.day}/${formData.month}/${formData.year}`;
    };

    return (
        <div className="input-form-container fade-in">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <header className="branding-header">
                <h2 className="brand-title">VIET LAC SO</h2>
                <p className="brand-tagline">vietlac.com • Khám phá mật mã cuộc đời</p>
            </header>

            {isAuthenticated && user ? (
                <div className="user-info-bar glass-card">
                    <div className="user-greeting">
                        <span className="user-icon">👤</span>
                        <span className="user-name">Xin chào, <strong>{user.name || user.email}</strong></span>
                    </div>
                    <div className="user-actions">
                        <div className="user-credits">
                            <span className="credits-icon">💎</span>
                            <span className="credits-count">{user.credits || 0}</span>
                            <span className="credits-label">Linh Thạch</span>
                        </div>
                        <button
                            className="user-action-btn history-btn"
                            onClick={async () => {
                                // Ensure user's bazi data is in sessionStorage before navigating
                                if (user?.bazi_data && !sessionStorage.getItem('bazi_data')) {
                                    try {
                                        const params = {
                                            name: user.bazi_data.name || user.name || '',
                                            gender: user.bazi_data.gender || 'Nam',
                                            year: user.bazi_data.year,
                                            month: user.bazi_data.month,
                                            day: user.bazi_data.day,
                                            hour: user.bazi_data.hour || 10,
                                            minute: user.bazi_data.minute || 0,
                                            calendar: user.bazi_data.calendar || 'solar',
                                            timeZone: normalizeTimeZone(user?.bazi_data?.timeZone, DEFAULT_TIME_ZONE)
                                        };
                                        const { apiClient } = await import('../../services/apiClient');
                                        const result = await apiClient.analyze(params);
                                        if (result) {
                                            sessionStorage.setItem('bazi_data', JSON.stringify(result));
                                            sessionStorage.setItem('bazi_params', JSON.stringify(params));
                                        }
                                    } catch (e) {
                                        console.error('Failed to load bazi for history:', e);
                                    }
                                }
                                window.location.href = '/tuvan?tab=history';
                            }}
                            title="Lịch sử tư vấn"
                        >
                            📜 Lịch sử
                        </button>
                        <button
                            className="profile-edit-btn"
                            onClick={() => setShowProfileModal(true)}
                            title="Quản lý hồ sơ"
                        >
                            ⚙️
                        </button>
                        <button
                            className="user-action-btn logout-btn"
                            onClick={handleLogout}
                            title="Đăng xuất"
                        >
                            🚪 Thoát
                        </button>
                    </div>
                </div>
            ) : null
            }

            <div className="modular-form-section">
                <div className="modular-form-toolbar">
                    <div className="modular-form-toolbar-left">
                        <h3 className="modular-form-toolbar-heading">Xin Lá Số</h3>
                    </div>
                    <div className="modular-form-toolbar-right">
                        <button
                            type="button"
                            className="premium-button small-btn modular-form-clear-btn"
                            onClick={handleDoiLaSo}
                            disabled={!isAuthenticated}
                            title={
                                isAuthenticated
                                    ? 'Xóa form và gỡ lá số đang lưu để nhập case mới'
                                    : 'Đăng nhập để đổi lá số (xóa form và gỡ lá số đã lưu)'
                            }
                        >
                            Đổi Lá Số
                        </button>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="modular-form glass-card" style={{ position: 'relative' }}>
                {!isAuthenticated && (
                    <button
                        type="button"
                        className="premium-button small-btn"
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            zIndex: 20,
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                            width: 'auto',
                            minWidth: 'unset'
                        }}
                        onClick={() => setShowAuthModal(true)}
                        title="Đăng nhập / Đăng ký"
                    >
                        🔐 Đăng nhập
                    </button>
                )}
                <div className="form-grid">
                    <div className="input-group full-width">
                        <label>Họ và Tên</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Nhập tên của bạn..."
                            className="glass-input"
                        />
                    </div>

                    <div className="input-group">
                        <label>Giới tính</label>
                        <Select
                            classNamePrefix="tz-select"
                            className="tz-react-select"
                            options={GENDER_OPTIONS}
                            value={selectedGenderOption}
                            onChange={handleGenderSelect}
                            isSearchable={false}
                        />
                    </div>

                    <div className="input-group timezone-input-group">
                        <label>Múi giờ</label>
                        <Select
                            classNamePrefix="tz-select"
                            className="tz-react-select"
                            options={groupedTimeZoneOptions}
                            value={selectedTimeZoneOption ? {
                                value: selectedTimeZoneOption.value,
                                label: selectedTimeZoneOption.label
                            } : null}
                            onChange={handleTimeZoneSelect}
                            filterOption={filterTimeZoneOption}
                            placeholder="Tìm múi giờ (VD: Asia/Ho_Chi_Minh)"
                            isSearchable
                            maxMenuHeight={280}
                            noOptionsMessage={() => 'Không tìm thấy múi giờ phù hợp'}
                        />
                    </div>

                    <div className="input-group date-picker-trigger-group">
                        <label>Ngày sinh (Dương lịch)</label>
                        <button
                            type="button"
                            className="glass-input date-picker-trigger"
                            onClick={() => setShowDatePicker(true)}
                        >
                            📅 {formatSelectedDate()}
                        </button>
                        {showDatePicker && (
                            <DatePicker
                                value={formData}
                                onChange={handleDatePickerChange}
                                timeZone={selectedTimeZone}
                                onClose={() => setShowDatePicker(false)}
                            />
                        )}
                    </div>

                    <div className="input-group tooltip-wrapper">
                        <label>Giờ sinh</label>
                        <Select
                            classNamePrefix="tz-select"
                            className="tz-react-select"
                            options={HOUR_OPTIONS}
                            value={selectedHourOption}
                            onChange={handleHourSelect}
                            isSearchable={false}
                        />
                        <small className="input-hint">Ngày giờ sinh được hiểu theo múi giờ đã chọn.</small>
                    </div>
                </div>

                <button type="submit" className={`premium-button start-button ${loading ? 'is-loading' : ''}`} disabled={loading}>
                    {loading ? (
                        <>
                            <span className="btn-spinner">⏳</span>
                            ĐANG PHÂN TÍCH LÁ SỐ...
                        </>
                    ) : 'XEM LÁ SỐ NGAY'}
                </button>


                </form>
            </div>

            <QuickDivination />

            {showProfileModal && createPortal(
                <UserProfileModal
                    isOpen={showProfileModal}
                    onClose={() => setShowProfileModal(false)}
                />,
                document.body
            )}

            {showAuthModal && createPortal(
                <AuthModal
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={() => {
                        setShowAuthModal(false);
                        setToast({ message: "Đăng nhập thành công!", type: 'success' });
                    }}
                />,
                document.body
            )}
        </div >
    );
};

export default BirthInput;
