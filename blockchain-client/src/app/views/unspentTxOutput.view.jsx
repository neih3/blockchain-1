import React, { useEffect, useState } from 'react';
import { Row, Col, Container, Card } from 'react-bootstrap';

import apiMethods from '../http-client/api-methods';
import UTxOTable from '../components/blockchain/uTxOTable';

const BlockchainView = (props) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadData = async () => {
        await apiMethods.blockchain
            .getAlluTxOs()
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

    console.log({ data });

    return (
        <>
            <h5 style={{ textAlignment: 'center' }}>All Unspent Transaction Outputs</h5>
            <UTxOTable data={data} />
        </>
    );
};

export default BlockchainView;
