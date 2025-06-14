import React, { useEffect, useState, useRef } from 'react'; // Thêm useRef
import { FiLogOut, FiKey, FiUpload, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi'; // Thêm FiUpload, FiTrash2
import { useSelector, useDispatch } from 'react-redux';
import actionCreators from '../redux/action-creators';
import apiMethods from '../http-client/api-methods';
import axios from 'axios';
import '../views/profile.scss';

const ProfileView = () => {
    const dispatch = useDispatch();
    const currentUserReducer = useSelector((state) => state.currentUserReducer);
    const { username, publicKey, balance } = currentUserReducer.currentUser || {};
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false); // Combined state for upload/delete operations
    const fileInputRef = useRef(null); // Ref cho input file

    // Change Password Modal
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    useEffect(() => {
        // Tạo preview URL khi avatarFile thay đổi (khi người dùng chọn file mới)
        if (avatarFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(avatarFile);
        } else if (!profile?.avatarUrl && !avatarFile) {
            // Nếu không có avatar từ server và không có file mới được chọn, dùng ảnh mặc định
            setAvatarPreview(require('../assets/images/avatar.png'));
        }
        // Nếu có profile.avatarUrl, nó sẽ được set trong loadProfile
    }, [avatarFile, profile?.avatarUrl]);

    const loadProfile = () => {
        setLoading(true);
        apiMethods.currentUser
            .getCurrentUser()
            .then((result) => {
                const userData = result.data?.data;
                setProfile(userData);
                if (userData?.avatarUrl) {
                    // Nối REACT_APP_API_URL nếu avatarUrl là đường dẫn tương đối
                    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
                    setAvatarPreview(`${baseUrl}${userData.avatarUrl}`);
                } else {
                    setAvatarPreview(require('../assets/images/avatar.png'));
                }
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to load profile');
                setLoading(false);
            });
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setAvatarFile(file);
            // Preview sẽ tự động cập nhật nhờ useEffect [avatarFile]
        }
    };

    const handleUploadAvatar = async () => {
        if (!avatarFile) {
            setError('Vui lòng chọn một file ảnh.');
            return;
        }
        setIsUploading(true);
        setError('');
        setSuccess('');
        try {
            const formData = new FormData();
            formData.append('avatar', avatarFile);
            // Giả sử uploadAvatar được định nghĩa trong authorization.api.js
            // const response = await apiMethods.authorization.uploadAvatar(formData);
            // const newAvatarUrl = response.data.data.avatarUrl;
            // setProfile(prev => ({...prev, avatarUrl: newAvatarUrl, avatarFilename: response.data.data.avatarFilename }));
            // if (newAvatarUrl) {
            //      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
            //      setAvatarPreview(`${baseUrl}${newAvatarUrl}`);
            // }
            // setSuccess("Tải ảnh đại diện thành công!");
            // setAvatarFile(null);
            // if(fileInputRef.current) fileInputRef.current.value = null;
            const baseUrl =
                process.env.REACT_APP_API_URL || 'https://blockchain-1-three.vercel.app';
            const token = localStorage.getItem('token');
            const response = await axios.post(`${baseUrl}/api/upload/avatar`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            const newAvatarUrl = response.data.data.avatarUrl;
            setProfile((prev) => ({
                ...prev,
                avatarUrl: newAvatarUrl,
                avatarFilename: response.data.data.avatarFilename,
            }));
            if (newAvatarUrl) {
                const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
                setAvatarPreview(`${baseUrl}${newAvatarUrl}`);
            }
            setSuccess('Tải ảnh đại diện thành công!');
            setAvatarFile(null);
            if (fileInputRef.current) fileInputRef.current.value = null;
        } catch (err) {
            setError(err?.response?.data?.message || 'Lỗi khi tải ảnh đại diện.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteAvatar = async () => {
        // Kiểm tra xem có avatarFilename hoặc avatarUrl không để biết có ảnh để xóa không
        if (!profile?.avatarFilename && !profile?.avatarUrl) {
            setError('Không có ảnh đại diện để xóa.');
            return;
        }
        if (window.confirm('Bạn có chắc muốn xóa ảnh đại diện hiện tại không?')) {
            setIsUploading(true);
            setError('');
            setSuccess('');
            try {
                await apiMethods.currentUser.deleteAvatar();
                setProfile((prev) => ({ ...prev, avatarUrl: null, avatarFilename: null }));
                setAvatarPreview(require('../assets/images/avatar.png'));
                setSuccess('Xóa ảnh đại diện thành công!');
            } catch (err) {
                setError(err?.response?.data?.message || 'Lỗi khi xóa ảnh đại diện.');
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            dispatch(actionCreators.authorization.signOut());
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Mật khẩu mới không khớp!');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự!');
            return;
        }

        try {
            setChangingPassword(true);
            setError('');

            await apiMethods.authorization.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });

            setSuccess('Đổi mật khẩu thành công!');
            setShowChangePassword(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err?.response?.data?.message || 'Lỗi khi đổi mật khẩu!');
        } finally {
            setChangingPassword(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setSuccess('Đã copy vào clipboard!');
        setTimeout(() => setSuccess(''), 2000);
    };

    if (loading)
        return (
            <div className="profile-mobile-container">
                <div className="loading-state">
                    <span>🔄</span>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    if (error && !profile)
        return (
            <div className="profile-mobile-container">
                <div className="error-state">
                    <span>⚠️</span>
                    <p>{error}</p>
                    <button onClick={loadProfile} className="retry-btn">
                        Retry
                    </button>
                </div>
            </div>
        );
    if (!profile) return null;

    return (
        <div className="profile-mobile-container">
            {success && (
                <div className="alert alert-success">
                    <span className="alert-icon">✅</span>
                    {success}
                </div>
            )}

            {error && (
                <div className="alert alert-error">
                    <span className="alert-icon">⚠️</span>
                    {error}
                </div>
            )}

            <div className="profile-card">
                <div className="avatar-section">
                    <img
                        className="profile-avatar"
                        src={avatarPreview || require('../assets/images/avatar.png')} // Fallback nếu avatarPreview null
                        alt="avatar"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                    />
                    <div className="avatar-actions">
                        <button
                            className="btn-icon"
                            onClick={() => fileInputRef.current && fileInputRef.current.click()}
                            disabled={isUploading}
                        >
                            <FiUpload /> {avatarFile ? 'Đổi ảnh' : 'Chọn ảnh'}
                        </button>
                        {avatarFile && (
                            <button
                                className="btn-icon btn-green"
                                onClick={handleUploadAvatar}
                                disabled={isUploading}
                            >
                                {isUploading ? 'Đang xử lý...' : 'Tải lên'}
                            </button>
                        )}
                        {/* Hiển thị nút xóa chỉ khi có avatarUrl hoặc avatarFilename trong profile */}
                        {(profile?.avatarUrl || profile?.avatarFilename) && !avatarFile && (
                            <button
                                className="btn-icon btn-red"
                                onClick={handleDeleteAvatar}
                                disabled={isUploading}
                            >
                                <FiTrash2 /> {isUploading ? 'Đang xử lý...' : 'Xóa ảnh'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="profile-username">{profile.username}</div>
                <div className="profile-balance">Balance: {profile.balance} Coins</div>

                <div className="profile-stats">
                    <div className="stat-item">
                        <div className="stat-value">{profile.history?.length || 0}</div>
                        <div className="stat-label">Transactions</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{profile.latestReceived?.length || 0}</div>
                        <div className="stat-label">Recent Received</div>
                    </div>
                </div>

                <div className="profile-info-section">
                    <div className="profile-info-row">
                        <span className="info-label">Created at:</span>
                        <span className="info-value">
                            {new Date(profile.createdAt).toLocaleString()}
                        </span>
                    </div>
                    <div className="profile-info-row">
                        <span className="info-label">Role:</span>
                        <span className="info-value">{profile.role || 'User'}</span>
                    </div>
                </div>

                <div className="profile-key-section">
                    <div className="profile-info-row">
                        <span className="info-label">Public Key:</span>
                        <button
                            className="copy-btn"
                            onClick={() => copyToClipboard(profile.publicKey)}
                        >
                            📋
                        </button>
                    </div>
                    <div className="profile-key">{profile.publicKey}</div>
                </div>

                {profile.latestReceived && profile.latestReceived.length > 0 && (
                    <div className="recent-transactions">
                        <h3>Recent Received Transactions</h3>
                        {profile.latestReceived.map((tx, index) => (
                            <div key={index} className="transaction-item">
                                <div className="tx-info">
                                    <div className="tx-amount">+{tx.amount} Coins</div>
                                    <div className="tx-time">
                                        {new Date(tx.timestamp).toLocaleString()}
                                    </div>
                                </div>
                                <div className="tx-status">{tx.status}</div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="profile-actions">
                    <button className="profile-btn" onClick={() => setShowChangePassword(true)}>
                        <FiKey style={{ marginRight: '8px' }} />
                        Đổi mật khẩu
                    </button>
                    <button className="profile-btn logout-btn" onClick={handleLogout}>
                        <FiLogOut style={{ marginRight: '8px' }} />
                        Logout
                    </button>
                </div>
            </div>

            {/* Change Password Modal */}
            {showChangePassword && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Đổi mật khẩu</h3>
                            <button
                                className="close-btn"
                                onClick={() => setShowChangePassword(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Mật khẩu hiện tại:</label>
                                <div className="password-input">
                                    <input
                                        type={showPasswords.current ? 'text' : 'password'}
                                        value={passwordData.currentPassword}
                                        onChange={(e) =>
                                            setPasswordData({
                                                ...passwordData,
                                                currentPassword: e.target.value,
                                            })
                                        }
                                        placeholder="Nhập mật khẩu hiện tại..."
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowPasswords({
                                                ...showPasswords,
                                                current: !showPasswords.current,
                                            })
                                        }
                                    >
                                        {showPasswords.current ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Mật khẩu mới:</label>
                                <div className="password-input">
                                    <input
                                        type={showPasswords.new ? 'text' : 'password'}
                                        value={passwordData.newPassword}
                                        onChange={(e) =>
                                            setPasswordData({
                                                ...passwordData,
                                                newPassword: e.target.value,
                                            })
                                        }
                                        placeholder="Nhập mật khẩu mới..."
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowPasswords({
                                                ...showPasswords,
                                                new: !showPasswords.new,
                                            })
                                        }
                                    >
                                        {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Xác nhận mật khẩu mới:</label>
                                <div className="password-input">
                                    <input
                                        type={showPasswords.confirm ? 'text' : 'password'}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) =>
                                            setPasswordData({
                                                ...passwordData,
                                                confirmPassword: e.target.value,
                                            })
                                        }
                                        placeholder="Nhập lại mật khẩu mới..."
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowPasswords({
                                                ...showPasswords,
                                                confirm: !showPasswords.confirm,
                                            })
                                        }
                                    >
                                        {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowChangePassword(false)}
                                disabled={changingPassword}
                            >
                                Hủy
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleChangePassword}
                                disabled={
                                    changingPassword ||
                                    !passwordData.currentPassword ||
                                    !passwordData.newPassword ||
                                    !passwordData.confirmPassword
                                }
                            >
                                {changingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileView;
