import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import apiMethods from '../http-client/api-methods';
import MessageBox from '../helpers/MessageBox';
import '../views/transfer.scss';

const TransferView = () => {
    const dispatch = useDispatch();
    const currentUserReducer = useSelector((state) => state.currentUserReducer);
    const authorizationReducer = useSelector((state) => state.authorizationReducer);
    const { isAuthenticated } = authorizationReducer;
    const { address } = currentUserReducer.currentUser || {};
    const [amount, setAmount] = useState('');
    const [toAddress, setToAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [balance, setBalance] = useState('Đang tải...'); // Vietnamese: Loading...
    const [fee, setFee] = useState('Đang tải...'); // Vietnamese: Loading...
    const [token, setToken] = useState('USDT');
    const [showTokenList, setShowTokenList] = useState(false);
    useEffect(() => {
        const fetchBalance = async () => {
            if (isAuthenticated) {
                try {
                    const response = await apiMethods.blockchain.getCurrentBalance();
                    if (response && response.data && typeof response.data.balance !== 'undefined') {
                        setBalance(response.data.balance.toString());
                    } else {
                        setBalance('Không có'); // Vietnamese: N/A
                        console.error('Dữ liệu số dư không đúng định dạng:', response);
                    }
                } catch (error) {
                    console.error('Không thể tải số dư:', error);
                    setBalance('Lỗi'); // Vietnamese: Error
                    MessageBox.show({
                        content: 'Không thể tải số dư. Vui lòng thử lại.', // Vietnamese
                        messageType: MessageBox.MessageType.Error,
                    });
                }
            } else {
                setBalance('0'); // Default if not authenticated
            }
        };

        fetchBalance();
    }, [isAuthenticated]);

    const refreshBalance = async () => {
        if (isAuthenticated) {
            try {
                const response = await apiMethods.blockchain.getCurrentBalance();
                if (response && response.data && typeof response.data.balance !== 'undefined') {
                    setBalance(response.data.balance.toString());
                }
            } catch (error) {
                console.error('Không thể làm mới số dư:', error);
            }
        }
    };

    // Placeholder: handle send transaction
    const handleSend = async () => {
        if (!toAddress || !amount) return;
        setIsLoading(true);
        MessageBox.show({
            content: 'Đang xử lý...', // Vietnamese: Processing...
            messageType: MessageBox.MessageType.Loading,
            key: 'create-wallet',
        });
        await apiMethods.blockchain
            .sendTransaction(toAddress, Number(amount))
            .then(() => {
                MessageBox.show({
                    content: `Gửi giao dịch thành công.`, // Vietnamese
                    messageType: MessageBox.MessageType.Success,
                    key: 'create-wallet',
                });
                // Refresh balance after successful transaction
                refreshBalance();
                // Clear form
                setAmount('');
                setToAddress('');
            })
            .catch((err) => {
                let messageContent = 'Không thể thực hiện giao dịch! Thử lại sau'; // Vietnamese
                if (err.response?.data && err.response?.data?.message) {
                    messageContent = err.response?.data?.message;
                }
                MessageBox.show({
                    content: messageContent,
                    messageType: MessageBox.MessageType.Error,
                    key: 'create-wallet',
                });
            });
        setIsLoading(false);
    };

    return (
        <div className="transfer-mobile-container">
            <div className="transfer-card">
                <div className="transfer-title">Chuyển khoản</div> {/* Vietnamese: Transfer */}
                <div className="transfer-balance-row">
                    <div className="transfer-balance-label">Số dư:</div>{' '}
                    {/* Vietnamese: Balance: */}
                    <div className="transfer-balance-value">{balance}</div>
                </div>
                <div className="transfer-input-group">
                    <input
                        className="transfer-input"
                        type="number"
                        placeholder="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        style={{ marginLeft: 10, minWidth: 60, textAlign: 'right' }}
                    />
                </div>
                <div className="transfer-address">
                    <input
                        className="transfer-input"
                        type="text"
                        placeholder="Địa chỉ người nhận" /* Vietnamese: Recipient address */
                        value={toAddress}
                        onChange={(e) => setToAddress(e.target.value)}
                        style={{
                            width: '100%',
                            background: '#f3f7fe',
                            borderRadius: 12,
                            padding: '10px 14px',
                            border: 'none',
                            marginTop: 8,
                        }}
                    />
                </div>
                <button
                    className="transfer-btn"
                    onClick={handleSend}
                    disabled={isLoading || !amount || !toAddress}
                >
                    {isLoading ? 'Đang gửi...' : 'Chuyển khoản'}{' '}
                    {/* Vietnamese: Sending... / Transfer */}
                </button>
            </div>
        </div>
    );
};

export default TransferView;
