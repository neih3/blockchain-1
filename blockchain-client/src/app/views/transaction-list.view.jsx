import React, { useEffect, useState } from 'react';
import { Row, Col, Container, Alert } from 'react-bootstrap';

import apiMethods from '../http-client/api-methods';
import TransactionItem from '../components/blockchain/transaction-item';

const TransactionListView = (props) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadData = async () => {
        await apiMethods.blockchain
            .getTransactionPool()
            .then((result) => {
                setIsLoading(false);
                setData(result.data);
            })
            .catch((err) => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        loadData();
        return () => {};
    }, []);

    return (
        <>
            <h5 style={{ textAlignment: 'center' }}>Transaction pool (unconfirmed)</h5>
            {data &&
                data.reverse().map((value, index) => {
                    return <TransactionItem transactionData={value} />;
                })}
            {data.length === 0 && (
                <Alert variant="primary">There is no transaction in pool yet!</Alert>
            )}
        </>
    );
};

export default TransactionListView;
