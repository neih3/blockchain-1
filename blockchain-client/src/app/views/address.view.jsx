import React, { useRef, useEffect, useState } from 'react';
import { Col, Row, Button, Card, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import apiMethods from '../http-client/api-methods';
import MessageBox from '../helpers/MessageBox';
import { useSelector } from 'react-redux';

const Address = (props) => {
    const currentUserReducer = useSelector((state) => state.currentUserReducer);
    const authorizationReducer = useSelector((state) => state.authorizationReducer);
    const { isAuthenticated } = authorizationReducer;
    const { username, privateKey } = currentUserReducer.currentUser;
    const mountedRef = useRef(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPreData, setIsLoadingPreData] = useState(false);
    const [address, setAddress] = useState('');
    const [uTxO, setUTxO] = useState([]);
    const [balance, setBalance] = useState(0);

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'BTC',
        minimumFractionDigits: 0,
    });
    const loadData = async () => {
        await apiMethods.blockchain
            .getAlluTxOsAddress(props.match.params.address)
            .then((result) => result.data?.unspentTxOuts)
            .then((result) => {
                setIsLoadingPreData(false);
                console.log({ result });
                let calcBalance = 0;
                result.forEach((element) => {
                    calcBalance += element.amount;
                });
                setBalance(calcBalance);
            })
            .catch((err) => {
                setIsLoadingPreData(false);
            });
    };

    useEffect(() => {
        if (!props.match.params.address) return;
        loadData();
        return () => {};
    }, [props.match.params.address]);

    return (
        <Container fluid>
            <Card className="mt-3 text-center">
                <Card.Header>ĐỊA CHỈ</Card.Header>
                <Card.Body>
                    <Card.Title>
                        Địa chỉ: <code>{props.match.params.address}</code>
                    </Card.Title>
                    <Card.Title>
                        Số dư:{' '}
                        <span className="text-primary" style={{ fontSize: 20 }}>
                            {formatter.format(balance)}
                        </span>
                    </Card.Title>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Address;
