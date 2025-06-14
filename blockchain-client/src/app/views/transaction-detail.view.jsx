import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table } from 'react-bootstrap';
import { Link, Redirect } from 'react-router-dom';
import helpers from '../helpers/index';
import apiMethods from '../http-client/api-methods';
import _ from 'lodash';
import './view.scss';

const TransactionDetail = (props) => {
    const [transactionData, setTransactionData] = useState([]);
    const [isLoadingPreData, setIsLoadingPreData] = useState(true);
    const [isCoinbaseTx, setIsCoinbaseTx] = useState(false);

    const loadData = async () => {
        await apiMethods.blockchain
            .getTransactionDetail(props.match.params.transactionId)
            .then((result) => result.data)
            .then((result) => {
                setTransactionData(result);
                if (result.txIns[0].signature === '') {
                    setIsCoinbaseTx(true);
                }
            })
            .catch((err) => {});
        setIsLoadingPreData(false);
    };

    useEffect(() => {
        if (!props.match.params.transactionId) return;
        loadData();
        return () => {};
    }, [props.match.params.transactionId]);

    const Input = ({ txIns }) => {
        return (
            <p className="view">
                <h4 className="text-center">TX INPUTS</h4>
                {txIns.map((value, index) => (
                    <Table responsive="sm" key={index}>
                        <tbody className="transaction">
                            <tr>
                                <td>Index</td>
                                <td>{index}</td>
                            </tr>
                            {!isCoinbaseTx && (
                                <>
                                    <tr>
                                        <td>Address</td>
                                        <td>
                                            <Link to={`/address/${value.address}`}>
                                                {value.address}
                                            </Link>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Signature</td>
                                        <td>
                                            <code>{value.signature}</code>
                                        </td>
                                    </tr>
                                </>
                            )}
                            {isCoinbaseTx && (
                                <tr>
                                    <td>Signature</td>
                                    <td>
                                        <code>COINBASE (Newly Generated Coins)</code>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                ))}
            </p>
        );
    };

    const Output = ({ txOuts }) => {
        return (
            <p className="view">
                <h4 className="text-center">TX OUTPUTS</h4>
                {txOuts.map((value, index) => (
                    <Table className="transaction" responsive="sm" key={index}>
                        <tbody>
                            <tr>
                                <td>Index</td>
                                <td>{index}</td>
                            </tr>
                            <tr>
                                <td>Address</td>
                                <td>
                                    <Link to={`/address/${value.address}`}>
                                        {value.address}
                                    </Link>
                                </td>
                            </tr>
                            <tr>
                                <td>Amount</td>
                                <td>{value.amount}</td>
                            </tr>
                        </tbody>
                    </Table>
                ))}
            </p>
        );
    };

    const Detail = () => {
        return (
            <p className="view">
                <h3 className="text-center">TRANSACTION DETAILS</h3>
                <Table responsive="sm">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Hash</td>
                            <td>
                                <code>{props.match.params.transactionId}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Status</td>
                            <td>Confirmed</td>
                        </tr>
                        <tr>
                            <td>Total Inputs</td>
                            <td>{_.sumBy(transactionData.txOuts, 'amount')}</td>
                        </tr>
                        <tr>
                            <td>Total Outputs</td>
                            <td>{_.sumBy(transactionData.txOuts, 'amount')}</td>
                        </tr>
                        <tr>
                            <td>Fee</td>
                            <td>0</td>
                        </tr>
                    </tbody>
                </Table>
            </p>
        );
    };

    return (
        <>
            {transactionData && isLoadingPreData === false && (
                <>
                    <Detail />
                    <hr />
                    <Input txIns={transactionData.txIns} txOuts={transactionData.txOuts}></Input>
                    <hr />
                    <Output txOuts={transactionData.txOuts}></Output>
                    <hr />
                </>
            )}
            {!transactionData && isLoadingPreData === false && <Redirect to="/404" />}
        </>
    );
};

export default TransactionDetail;
