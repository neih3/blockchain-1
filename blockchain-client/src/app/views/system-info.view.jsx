import React, { useState, useEffect } from 'react';
import { blockchainApi } from '../http-client/api-methods';
import './system-info.scss';

const SystemInfoView = () => {
    const [systemData, setSystemData] = useState({
        blocks: [],
        allUTXOs: [],
        transactionPool: [],
        loading: true,
        error: '',
    });

    useEffect(() => {
        loadSystemData();
    }, []);

    const loadSystemData = async () => {
        try {
            setSystemData((prev) => ({ ...prev, loading: true, error: '' }));

            const [blocksResult, utxosResult, poolResult] = await Promise.all([
                blockchainApi.getAllBlocks(),
                blockchainApi.getAlluTxOs(),
                blockchainApi.getTransactionPool(),
            ]);

            setSystemData({
                blocks: blocksResult.data || [],
                allUTXOs: utxosResult.data || [],
                transactionPool: poolResult.data || [],
                loading: false,
                error: '',
            });
        } catch (err) {
            setSystemData((prev) => ({
                ...prev,
                loading: false,
                error: err?.response?.data?.message || 'Lỗi khi tải dữ liệu hệ thống',
            }));
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const { blocks, allUTXOs, transactionPool, loading, error } = systemData;

    const totalCoins = allUTXOs.reduce((sum, utxo) => sum + utxo.amount, 0);
    const totalTransactions = blocks.reduce((sum, block) => sum + (block.data?.length || 0), 0);

    if (loading) {
        return (
            <div className="system-info-view loading-view">
                <div className="loading-spinner">
                    <span>🔄</span>
                    <p>Đang tải thông tin hệ thống...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="system-info-view">
            <div className="system-header">
                <h1>📊 System Information</h1>
                <p>Thông tin tổng quan về blockchain network</p>
                <button className="btn btn-refresh" onClick={loadSystemData}>
                    🔄 Refresh
                </button>
            </div>

            {error && (
                <div className="alert alert-error">
                    <span className="alert-icon">⚠️</span>
                    {error}
                </div>
            )}

            <div className="system-stats">
                <div className="stat-card">
                    <div className="stat-icon">🧱</div>
                    <div className="stat-content">
                        <div className="stat-value">{blocks.length}</div>
                        <div className="stat-label">Total Blocks</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">💎</div>
                    <div className="stat-content">
                        <div className="stat-value">{totalCoins}</div>
                        <div className="stat-label">Total Coins</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-content">
                        <div className="stat-value">{totalTransactions}</div>
                        <div className="stat-label">Total Transactions</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-content">
                        <div className="stat-value">{transactionPool.length}</div>
                        <div className="stat-label">Pending Transactions</div>
                    </div>
                </div>
            </div>

            <div className="system-sections">
                <div className="section">
                    <h2>🧱 Recent Blocks</h2>
                    <div className="blocks-list">
                        {blocks
                            .slice(-5)
                            .reverse()
                            .map((block, index) => (
                                <div key={block.hash} className="block-card">                                    <div className="block-header">
                                        <span className="block-index">#{block.index}</span>
                                        <span className="block-time">
                                            {new Date(
                                                block.timestamp * 1000
                                            ).toLocaleString('vi-VN', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <div className="block-details">
                                        <p>
                                            <strong>Hash:</strong>
                                            <span
                                                className="hash-text clickable"
                                                onClick={() => copyToClipboard(block.hash)}
                                            >
                                                {block.hash}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>Previous Hash:</strong>
                                            <span
                                                className="hash-text clickable"
                                                onClick={() => copyToClipboard(block.previousHash)}
                                            >
                                                {block.previousHash}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>Transactions:</strong>
                                            <span className="highlight">
                                                {block.data?.length || 0}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>Difficulty:</strong>
                                            <span className="highlight">{block.difficulty}</span>
                                        </p>
                                        <p>
                                            <strong>Nonce:</strong>
                                            <span className="highlight">{block.nonce}</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                <div className="section">
                    <h2>💰 All UTXOs</h2>
                    <div className="utxos-summary">
                        <p>
                            Tổng số UTXO trong hệ thống: <strong>{allUTXOs.length}</strong>
                        </p>
                        <p>
                            Tổng giá trị: <strong>{totalCoins} Coins</strong>
                        </p>
                    </div>
                    <div className="utxos-list">
                        {allUTXOs.slice(0, 10).map((utxo, index) => (
                            <div key={index} className="utxo-card">
                                <div className="utxo-amount">{utxo.amount} Coins</div>
                                <div className="utxo-details">
                                    <p>
                                        <strong>TxOut ID:</strong>
                                        <span
                                            className="hash-text clickable"
                                            onClick={() => copyToClipboard(utxo.txOutId)}
                                        >
                                            {utxo.txOutId}
                                        </span>
                                    </p>
                                    <p>
                                        <strong>Address:</strong>
                                        <span
                                            className="hash-text clickable"
                                            onClick={() => copyToClipboard(utxo.address)}
                                        >
                                            {utxo.address}
                                        </span>
                                    </p>
                                    <p>
                                        <strong>Output Index:</strong>
                                        <span className="highlight">{utxo.uTxOutIndex}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                        {allUTXOs.length > 10 && (
                            <div className="more-indicator">
                                <p>... và {allUTXOs.length - 10} UTXO khác</p>
                            </div>
                        )}
                    </div>
                </div>

                {transactionPool.length > 0 && (
                    <div className="section">
                        <h2>⏳ Transaction Pool</h2>
                        <div className="pool-list">
                            {transactionPool.map((tx, index) => (
                                <div key={tx.id} className="transaction-card">
                                    <div className="tx-header">
                                        <span className="tx-index">#{index + 1}</span>
                                        <span className="tx-status">Pending</span>
                                    </div>
                                    <div className="tx-details">
                                        <p>
                                            <strong>ID:</strong>
                                            <span
                                                className="hash-text clickable"
                                                onClick={() => copyToClipboard(tx.id)}
                                            >
                                                {tx.id}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>Inputs:</strong>
                                            <span className="highlight">
                                                {tx.txIns?.length || 0}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>Outputs:</strong>
                                            <span className="highlight">
                                                {tx.txOuts?.length || 0}
                                            </span>
                                        </p>
                                        {tx.txOuts && tx.txOuts.length > 0 && (
                                            <p>
                                                <strong>Total Amount:</strong>
                                                <span className="highlight">
                                                    {tx.txOuts.reduce(
                                                        (sum, out) => sum + out.amount,
                                                        0,
                                                    )}{' '}
                                                    Coins
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemInfoView;
