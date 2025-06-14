import React, { useEffect, useState } from 'react';
import { Container, Card, Table } from 'react-bootstrap';
import apiMethods from '../http-client/api-methods';

const TransactionsView = () => {
    const [profile, setProfile] = useState({ history: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiMethods.currentUser.getCurrentUser()
            .then((result) => {
                // The correct user data is in result.data?.data
                setProfile(result.data?.data || {});
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    return (
        <Container className="mt-4">
            <Card>
                <Card.Header>
                    <h5 className="mb-0">Your Transaction History</h5>
                </Card.Header>
                <Card.Body>
                    {isLoading ? (
                        <div>Loading...</div>
                    ) : (
                        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                            <Table striped bordered hover size="sm">
                                <thead>
                                    <tr>
                                        <th>Block</th>
                                        <th>Time</th>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {profile.history && profile.history.length > 0 ? (
                                        profile.history.map((tx, idx) => (
                                            <tr key={tx.txId + idx}>
                                                <td>{tx.blockIndex}</td>
                                                <td>{new Date(tx.timestamp * 1000).toLocaleString()}</td>
                                                <td>{tx.type}</td>
                                                <td>{tx.amount}</td>
                                                <td>{tx.status}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={5}>No transactions found.</td></tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default TransactionsView;
