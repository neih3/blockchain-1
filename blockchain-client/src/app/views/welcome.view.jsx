import React from 'react';
import './welcome.scss';

const WelcomeView = ({ onCreateWallet, onAlreadyHaveWallet }) => {
    return (
        <div className="welcome-bg">
            <div className="welcome-card">
                <div className="welcome-img">
                    <img src={require('../assets/images/blockchain.jpg')} alt="Web3" />
                </div>
                <h3>Your all access pass to Web3</h3>
                <div className="welcome-desc">
                    A wallet built to be your ultimate gate to Crypto, NFTs, DeFi and so on
                </div>
                <button className="welcome-btn primary" onClick={onCreateWallet}>
                    Create Wallet
                </button>
                <button className="welcome-btn outline" onClick={onAlreadyHaveWallet}>
                    I already have a wallet
                </button>
                <div className="welcome-policy">
                    By continuing, you accept our <a href="#">Terms & Conditions</a> and <a href="#">Privacy Policy</a>.
                </div>
            </div>
        </div>
    );
};

export default WelcomeView;
