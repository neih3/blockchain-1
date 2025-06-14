import React, { useState } from 'react';
import { Card, Container, Alert, Spinner } from 'react-bootstrap';
import { Form, Input, Button as AntButton, message } from 'antd';
import apiMethods from '../http-client/api-methods';
import { useHistory } from 'react-router-dom';

const ChangePasswordView = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [form] = Form.useForm();
    const history = useHistory();

    const handleFinish = async (values) => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await apiMethods.authorization.changePassword({
                oldPassword: values.oldPassword,
                newPassword: values.newPassword,
            });
            setSuccess('Đổi mật khẩu thành công!');
            message.success('Đổi mật khẩu thành công!');
            setTimeout(() => history.push('/profile'), 1200);
        } catch (err) {
            setError(err?.response?.data?.message || 'Đổi mật khẩu thất bại!');
        }
        setLoading(false);
    };

    return (
        <Container style={{ maxWidth: 500, marginTop: 40 }}>
            <Card className="text-center">
                <Card.Header>Đổi mật khẩu</Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleFinish}
                        style={{ marginTop: 20 }}
                    >
                        <Form.Item
                            label="Mật khẩu cũ"
                            name="oldPassword"
                            rules={[{ required: true, message: 'Nhập mật khẩu cũ!' }]}
                        >
                            <Input.Password autoComplete="current-password" />
                        </Form.Item>
                        <Form.Item
                            label="Mật khẩu mới"
                            name="newPassword"
                            rules={[{ required: true, message: 'Nhập mật khẩu mới!' }]}
                        >
                            <Input.Password autoComplete="new-password" />
                        </Form.Item>
                        <Form.Item>
                            <AntButton type="primary" htmlType="submit" loading={loading} block>
                                Đổi mật khẩu
                            </AntButton>
                        </Form.Item>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ChangePasswordView;
