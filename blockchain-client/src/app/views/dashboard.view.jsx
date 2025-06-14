import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import apiMethods from '../http-client/api-methods';
import MessageBox from '../helpers/MessageBox';
import actionCreators from '../redux/action-creators';
import { useSelector, useDispatch } from 'react-redux';
import './dashboard.scss';

const Dashboard = (props) => {
    const dispatch = useDispatch();
    const currentUserReducer = useSelector((state) => state.currentUserReducer);
    const authorizationReducer = useSelector((state) => state.authorizationReducer);
    const { isAuthenticated } = authorizationReducer;
    const { username, privateKey, address, publicKey } = currentUserReducer.currentUser;
    const mountedRef = useRef(true);
    const [balance, setBalance] = useState('');
    const [copySuccess, setCopySuccess] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [profileImage, setProfileImage] = useState(null);
    const [userInfo, setUserInfo] = useState(null);

    // Function to get greeting based on current time
    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) {
            return 'Chào buổi sáng'; // Good morning
        } else if (hour < 18) {
            return 'Chào buổi chiều'; // Good afternoon
        } else {
            return 'Chào buổi tối'; // Good evening
        }
    };

    // Function to format current date and time
    const formatDateTime = () => {
        return currentTime.toLocaleString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []); // Load user info and profile image from server
    const loadUserInfo = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            const result = await apiMethods.currentUser.getCurrentUser();
            const userData = result.data;
            setUserInfo(userData);

            // Set profile image from server if available, otherwise fallback to localStorage
            if (userData.avatarUrl) {
                setProfileImage(userData.avatarUrl);
            } else {
                const savedImage = localStorage.getItem('profileImage');
                setProfileImage(savedImage);
            }
        } catch (error) {
            // Fallback to localStorage if API fails
            const savedImage = localStorage.getItem('profileImage');
            setProfileImage(savedImage);
        }
    }, [isAuthenticated]);

    // Load profile image from localStorage and listen for changes
    useEffect(() => {
        loadUserInfo();

        // Listen for storage changes to update image when changed in profile
        const handleStorageChange = (e) => {
            if (e.key === 'profileImage') {
                setProfileImage(e.newValue);
            }
        };

        // Listen for custom avatar updated event
        const handleAvatarUpdate = (e) => {
            setProfileImage(e.detail.avatarUrl);
            loadUserInfo(); // Reload user info
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('avatarUpdated', handleAvatarUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('avatarUpdated', handleAvatarUpdate);
        };
    }, [loadUserInfo]);

    // Also check for image updates when component mounts or focus changes
    useEffect(() => {
        const checkForImageUpdate = () => {
            loadUserInfo(); // Reload user info from server
        };

        window.addEventListener('focus', checkForImageUpdate);

        return () => {
            window.removeEventListener('focus', checkForImageUpdate);
        };
    }, [loadUserInfo]);

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'BTC',
        minimumFractionDigits: 0,
    });
    const loadData = useCallback(async () => {
        if (isAuthenticated === false) return;
        await apiMethods.blockchain
            .getCurrentBalance()
            .then((result) => result.data.balance)
            .then((result) => {
                setBalance(formatter.format(result));
            })
            .catch((err) => {
                // Handle error silently
            });
    }, [isAuthenticated, formatter]);
    useEffect(() => {
        loadData();
        return () => {
            mountedRef.current = false;
        };
    }, [loadData]);
    const mineBlockHandle = async () => {
        MessageBox.show({
            content: 'Loading...',
            messageType: MessageBox.MessageType.Loading,
            key: 'mine-block',
        });

        await apiMethods.blockchain
            .mineBlock()
            .then((result) => {
                MessageBox.show({
                    content: `Mined successfully.`,
                    messageType: MessageBox.MessageType.Success,
                    key: 'mine-block',
                });
                loadData();
            })
            .catch((err) => {
                let messageContent = 'Cannot create at the moment! Try again later';
                if (err.response?.data && err.response?.data?.message) {
                    messageContent = err.response?.data?.message;
                }

                MessageBox.show({
                    content: messageContent,
                    messageType: MessageBox.MessageType.Error,
                    key: 'mine-block',
                });
            });
    };
    const mineFromPoolHandle = async () => {
        MessageBox.show({
            content: 'Mining from pool...',
            messageType: MessageBox.MessageType.Loading,
            key: 'mine-from-pool',
        });
        await apiMethods.blockchain
            .mineFromPool()
            .then((result) => {
                MessageBox.show({
                    content: result.data?.message || 'Block mined from pool!',
                    messageType: MessageBox.MessageType.Success,
                    key: 'mine-from-pool',
                });
                loadData();
            })
            .catch((err) => {
                let messageContent = 'Could not mine block from pool.';
                if (err.response?.data) {
                    messageContent =
                        typeof err.response.data === 'string'
                            ? err.response.data
                            : err.response.data.message || JSON.stringify(err.response.data);
                }
                MessageBox.show({
                    content: messageContent,
                    messageType: MessageBox.MessageType.Error,
                    key: 'mine-from-pool',
                });
            });
    };
    const handleCopyAddress = () => {
        const value = address || publicKey || privateKey || '';
        if (value) {
            navigator.clipboard.writeText(value).then(() => {
                setCopySuccess('Copied!');
                setTimeout(() => setCopySuccess(''), 1200);
            });
        }
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            dispatch(actionCreators.authorization.signOut());
        }
    };

    return (
        <div className="dashboard-figma-container">
            {/* Header với gradient */}
            <div className="dashboard-header">
                {' '}
                <div className="dashboard-user-info">
                    <img
                        className="dashboard-avatar-figma"
                        src={profileImage || require('../assets/images/avatar.png')}
                        alt="avatar"
                    />{' '}
                    <div>
                        <div className="dashboard-greeting">{getGreeting()}</div>
                        <div className="dashboard-username">
                            {userInfo?.username || username || 'User'}
                        </div>
                        <div className="dashboard-datetime">{formatDateTime()}</div>
                    </div>
                </div>
                <button className="dashboard-logout-btn" onClick={handleLogout}>
                    <FiLogOut />
                </button>
            </div>
            {/* Balance Card */}
            <div className="dashboard-balance-card">
                <div className="dashboard-balance-label">Total Balance</div>
                <div className="dashboard-balance-amount">{balance || '$0.00'}</div>
            </div>{' '}
            {/* Action Buttons */}
            <div className="dashboard-actions">
                <div className="dashboard-actions-grid">
                    {' '}
                    <Link to="/transfer" className="dashboard-action-btn">
                        <div className="dashboard-action-icon send">↑</div>
                        <div className="dashboard-action-text">Send</div>
                    </Link>
                    <button className="dashboard-action-btn" onClick={mineBlockHandle}>
                        <div className="dashboard-action-icon mine">⛏</div>
                        <div className="dashboard-action-text">Mine</div>
                    </button>
                    <button className="dashboard-action-btn" onClick={mineFromPoolHandle}>
                        <div className="dashboard-action-icon receive">
                            <span role="img" aria-label="mine pool">
                                🏊
                            </span>
                        </div>
                        <div className="dashboard-action-text">Mine Pool</div>
                    </button>
                </div>
            </div>
            {/* Quick Links Section */}
            <div className="dashboard-section">
                <div className="dashboard-section-title">Quick Tools</div>
                <div className="dashboard-quick-links">
                    {' '}
                    <Link to="/advanced" className="dashboard-quick-link">
                        <div className="quick-link-icon">🔧</div>
                        <div className="quick-link-text">
                            <div className="quick-link-title">Advanced Tools</div>
                            <div className="quick-link-desc">Mining, UTXOs</div>
                        </div>
                    </Link>
                    <Link to="/system-info" className="dashboard-quick-link">
                        <div className="quick-link-icon">📊</div>
                        <div className="quick-link-text">
                            <div className="quick-link-title">System Info</div>
                            <div className="quick-link-desc">Blockchain stats, blocks, network</div>
                        </div>
                    </Link>
                    <Link to="/blockchain" className="dashboard-quick-link">
                        <div className="quick-link-icon">🧱</div>
                        <div className="quick-link-text">
                            <div className="quick-link-title">All Blocks</div>
                            <div className="quick-link-desc">View entire blockchain</div>
                        </div>
                    </Link>
                    <Link to="/transaction-pool" className="dashboard-quick-link">
                        <div className="quick-link-icon">⏳</div>
                        <div className="quick-link-text">
                            <div className="quick-link-title">Transaction Pool</div>
                            <div className="quick-link-desc">Pending transactions</div>
                        </div>
                    </Link>
                </div>
            </div>
            {/* Address Section */}
            <div className="dashboard-recent">
                <div className="dashboard-section-title">Your Address</div>
                <div className="dashboard-address-card">
                    <div className="dashboard-address-title">Wallet Address</div>
                    <div className="dashboard-address-value">
                        {address || publicKey || privateKey || 'No address available'}
                    </div>
                    <button className="dashboard-copy-btn" onClick={handleCopyAddress}>
                        {copySuccess || 'Copy Address'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
