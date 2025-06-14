import React, { useState, useEffect } from 'react';
import { authApi, blockchainApi } from '../http-client/api-methods';
import './advanced.scss';

const AdvancedView = () => {
    const [activeTab, setActiveTab] = useState('utxos');
    const [myUTXOs, setMyUTXOs] = useState([]);
    const [publicAddress, setPublicAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Mine Transaction State
    const [mineTransactionData, setMineTransactionData] = useState({
        address: '',
        amount: 0,
    });    // Raw Block State
    const [rawBlockData, setRawBlockData] = useState('');

    useEffect(() => {
        loadInitialData();
    }, []);    const loadInitialData = async () => {
        try {
            setLoading(true);

            // Load public address
            const addressResult = await blockchainApi.getPublicAddress();
            setPublicAddress(addressResult.data.address);

            // Load my UTXOs
            const utxosResult = await blockchainApi.getMyUnspentTransactionOutputs();
            setMyUTXOs(utxosResult.data);
        } catch (err) {
            setError(err?.response?.data?.message || 'Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleMineTransaction = async () => {
        if (!mineTransactionData.address || mineTransactionData.amount <= 0) {
            setError('Vui lòng nhập địa chỉ và số tiền hợp lệ');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const result = await blockchainApi.mineTransaction(
                mineTransactionData.address,
                mineTransactionData.amount,
            );

            setSuccess(`Mine transaction thành công! Block #${result.data.index} đã được tạo`);
            setMineTransactionData({ address: '', amount: 0 });

            // Reload UTXOs
            const utxosResult = await blockchainApi.getMyUnspentTransactionOutputs();
            setMyUTXOs(utxosResult.data);
        } catch (err) {
            setError(
                err?.response?.data?.message || err?.response?.data || 'Lỗi khi mine transaction',
            );
        } finally {
            setLoading(false);
        }
    };

    const handleMineRawBlock = async () => {
        if (!rawBlockData.trim()) {
            setError('Vui lòng nhập dữ liệu cho raw block');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const result = await blockchainApi.mineRawBlockWithData(rawBlockData);
            setSuccess(`Mine raw block thành công! Block #${result.data.index} đã được tạo`);
            setRawBlockData('');
        } catch (err) {
            setError(
                err?.response?.data?.message || err?.response?.data || 'Lỗi khi mine raw block',
            );
        } finally {
            setLoading(false);
        }    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setSuccess('Đã copy vào clipboard!');
        setTimeout(() => setSuccess(''), 2000);
    };

    return (
        <div className="advanced-view">
            <div className="advanced-header">
                <h1>🔧 Advanced Tools</h1>
                <p>Công cụ nâng cao cho blockchain và quản lý tài khoản</p>
            </div>

            {error && (
                <div className="alert alert-error">
                    <span className="alert-icon">⚠️</span>
                    {error}
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    <span className="alert-icon">✅</span>
                    {success}
                </div>
            )}            <div className="advanced-tabs">
                <button
                    className={`tab-button ${activeTab === 'utxos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('utxos')}
                >
                    My UTXOs
                </button>
                <button
                    className={`tab-button ${activeTab === 'mining' ? 'active' : ''}`}
                    onClick={() => setActiveTab('mining')}
                >
                    Advanced Mining
                </button>
                <button
                    className={`tab-button ${activeTab === 'account' ? 'active' : ''}`}
                    onClick={() => setActiveTab('account')}
                >
                    Account Info
                </button>
            </div>

            <div className="advanced-content">
                {activeTab === 'utxos' && (
                    <div className="utxos-section">
                        <h2>🔗 My Unspent Transaction Outputs</h2>
                        {loading ? (
                            <div className="loading">Loading UTXOs...</div>
                        ) : (
                            <div className="utxos-list">
                                {myUTXOs.length === 0 ? (
                                    <div className="empty-state">
                                        <span>💰</span>
                                        <p>Chưa có UTXO nào</p>
                                    </div>
                                ) : (
                                    myUTXOs.map((utxo, index) => (
                                        <div key={index} className="utxo-card">
                                            <div className="utxo-header">
                                                <span className="utxo-amount">
                                                    {utxo.amount} Coins
                                                </span>
                                                <span className="utxo-index">
                                                    Output #{utxo.uTxOutIndex}
                                                </span>
                                            </div>
                                            <div className="utxo-details">
                                                <p>
                                                    <strong>TxOut ID:</strong>
                                                    <span
                                                        className="hash-text clickable"
                                                        onClick={() =>
                                                            copyToClipboard(utxo.txOutId)
                                                        }
                                                    >
                                                        {utxo.txOutId}
                                                    </span>
                                                </p>
                                                <p>
                                                    <strong>Address:</strong>
                                                    <span
                                                        className="hash-text clickable"
                                                        onClick={() =>
                                                            copyToClipboard(utxo.address)
                                                        }
                                                    >
                                                        {utxo.address}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'mining' && (
                    <div className="mining-section">
                        <div className="mining-card">
                            <h3>⛏️ Mine Transaction</h3>
                            <p>Mine một transaction cụ thể và nhận coinbase reward</p>
                            <div className="form-group">
                                <label>Địa chỉ nhận:</label>
                                <input
                                    type="text"
                                    value={mineTransactionData.address}
                                    onChange={(e) =>
                                        setMineTransactionData({
                                            ...mineTransactionData,
                                            address: e.target.value,
                                        })
                                    }
                                    placeholder="Nhập địa chỉ ví..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Số tiền:</label>
                                <input
                                    type="number"
                                    value={mineTransactionData.amount}
                                    onChange={(e) =>
                                        setMineTransactionData({
                                            ...mineTransactionData,
                                            amount: parseFloat(e.target.value) || 0,
                                        })
                                    }
                                    placeholder="Nhập số tiền..."
                                />
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={handleMineTransaction}
                                disabled={loading}
                            >
                                {loading ? 'Mining...' : 'Mine Transaction'}
                            </button>
                        </div>

                        <div className="mining-card">
                            <h3>🏗️ Mine Raw Block</h3>
                            <p>Mine một block với dữ liệu tùy chỉnh</p>
                            <div className="form-group">
                                <label>Block Data:</label>
                                <textarea
                                    value={rawBlockData}
                                    onChange={(e) => setRawBlockData(e.target.value)}
                                    placeholder="Nhập dữ liệu cho block (JSON, text, v.v.)..."
                                    rows="4"
                                />
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={handleMineRawBlock}
                                disabled={loading}
                            >
                                {loading ? 'Mining...' : 'Mine Raw Block'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'account' && (
                    <div className="account-section">
                        <h2>👤 Account Information</h2>
                        <div className="account-card">
                            <div className="account-field">
                                <label>Public Address:</label>
                                <div className="field-value">
                                    <span className="hash-text">{publicAddress}</span>
                                    <button
                                        className="btn btn-copy"
                                        onClick={() => copyToClipboard(publicAddress)}
                                    >
                                        📋
                                    </button>
                                </div>
                            </div>
                            <div className="account-stats">
                                <div className="stat-item">
                                    <span className="stat-label">Total UTXOs:</span>
                                    <span className="stat-value">{myUTXOs.length}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Total Value:</span>
                                    <span className="stat-value">
                                        {myUTXOs.reduce((sum, utxo) => sum + utxo.amount, 0)} Coins
                                    </span>
                                </div>
                            </div>
                        </div>                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvancedView;
