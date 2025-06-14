import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiLock, FiKey, FiArrowLeft, FiCheck } from 'react-icons/fi';
import apiMethods from '../http-client/api-methods';
import MessageBox from '../helpers/MessageBox';
import './auth.scss';

const ForgotPasswordView = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password, 3: Success
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateEmail = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is not valid';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateReset = () => {
        const newErrors = {};

        if (!formData.otp.trim()) {
            newErrors.otp = 'OTP is required';
        } else if (formData.otp.length !== 6) {
            newErrors.otp = 'OTP must be 6 digits';
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (validateEmail()) {
            setIsLoading(true);
            try {
                await apiMethods.authorization.requestResetPassword(formData.email);
                setStep(2);
                MessageBox.show({
                    content: 'OTP has been sent to your email!',
                    messageType: MessageBox.MessageType.Success,
                    key: 'forgot-password',
                });
            } catch (err) {
                MessageBox.show({
                    content: err.response?.data?.message || 'Failed to send OTP!',
                    messageType: MessageBox.MessageType.Error,
                    key: 'forgot-password',
                });
            }
            setIsLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        if (validateReset()) {
            setIsLoading(true);
            try {
                await apiMethods.authorization.resetPassword({
                    email: formData.email,
                    otp: formData.otp,
                    newPassword: formData.newPassword,
                });
                setStep(3);
                MessageBox.show({
                    content: 'Password reset successfully!',
                    messageType: MessageBox.MessageType.Success,
                    key: 'forgot-password',
                });
            } catch (err) {
                MessageBox.show({
                    content: err.response?.data?.message || 'Failed to reset password!',
                    messageType: MessageBox.MessageType.Error,
                    key: 'forgot-password',
                });
            }
            setIsLoading(false);
        }
    };

    const renderEmailStep = () => (
        <>
            <div className="auth-header">
                <div className="auth-logo">
                    <div className="logo-icon">🔗</div>
                    <h1>BlockChain</h1>
                </div>
                <h2>Forgot Password?</h2>
                <p>Enter your email address and we'll send you a code to reset your password</p>
            </div>

            <form className="auth-form" onSubmit={handleEmailSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-wrapper">
                        <FiMail className="input-icon" />
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                            className={errors.email ? 'error' : ''}
                        />
                    </div>
                    {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                    {isLoading ? <div className="loading-spinner"></div> : 'Send Reset Code'}
                </button>
            </form>
        </>
    );

    const renderResetStep = () => (
        <>
            <div className="auth-header">
                <button className="back-btn" onClick={() => setStep(1)} type="button">
                    <FiArrowLeft />
                </button>
                <div className="auth-logo">
                    <div className="logo-icon">🔗</div>
                    <h1>BlockChain</h1>
                </div>
                <h2>Reset Password</h2>
                <p>Enter the 6-digit code sent to {formData.email}</p>
            </div>

            <form className="auth-form" onSubmit={handleResetSubmit}>
                <div className="form-group">
                    <label htmlFor="otp">Verification Code</label>
                    <div className="input-wrapper">
                        <FiKey className="input-icon" />
                        <input
                            type="text"
                            id="otp"
                            name="otp"
                            value={formData.otp}
                            onChange={handleInputChange}
                            placeholder="Enter 6-digit code"
                            maxLength="6"
                            className={errors.otp ? 'error' : ''}
                        />
                    </div>
                    {errors.otp && <span className="error-message">{errors.otp}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <div className="input-wrapper">
                        <FiLock className="input-icon" />
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            placeholder="Enter new password"
                            className={errors.newPassword ? 'error' : ''}
                        />
                    </div>
                    {errors.newPassword && (
                        <span className="error-message">{errors.newPassword}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <div className="input-wrapper">
                        <FiLock className="input-icon" />
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm new password"
                            className={errors.confirmPassword ? 'error' : ''}
                        />
                    </div>
                    {errors.confirmPassword && (
                        <span className="error-message">{errors.confirmPassword}</span>
                    )}
                </div>

                <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                    {isLoading ? <div className="loading-spinner"></div> : 'Reset Password'}
                </button>
            </form>
        </>
    );

    const renderSuccessStep = () => (
        <>
            <div className="auth-header">
                <div className="success-icon">
                    <FiCheck />
                </div>
                <h2>Password Reset Successful!</h2>
                <p>
                    Your password has been successfully reset. You can now sign in with your new
                    password.
                </p>
            </div>

            <div className="auth-form">
                <Link
                    to="/login"
                    className="auth-submit-btn"
                    style={{ textDecoration: 'none', textAlign: 'center' }}
                >
                    Sign In Now
                </Link>
            </div>
        </>
    );

    return (
        <div className="auth-container">
            <div className="auth-card">
                {step === 1 && renderEmailStep()}
                {step === 2 && renderResetStep()}
                {step === 3 && renderSuccessStep()}

                <div className="auth-footer">
                    <p>
                        Remember your password?{' '}
                        <Link to="/login" className="auth-link">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordView;
