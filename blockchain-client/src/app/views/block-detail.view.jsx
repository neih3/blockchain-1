import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table } from 'react-bootstrap';
import { Link, Redirect } from 'react-router-dom';
import helpers from '../helpers/index';
import apiMethods from '../http-client/api-methods';
import _ from 'lodash';
import './view.scss';
import TransactionItem from '../components/blockchain/transaction-item';

const BlockDetail = (props) => {
    const [blockData, setBlockData] = useState('');
    const [isLoadingPreData, setIsLoadingPreData] = useState(true);

    const loadData = async () => {
        await apiMethods.blockchain
            .getBlockDetail(props.match.params.blockHash)
            .then((result) => result.data)
            .then((result) => {
                setBlockData(result);
            })
            .catch((err) => {});
        setIsLoadingPreData(false);
    };

    useEffect(() => {
        if (!props.match.params.blockHash) return;
        loadData();
        return () => {};
    }, [props.match.params.blockHash]);

    const TransactionList = ({ txOuts }) => {
        return (
            <p className="view">
                <h4 className="text-center">BLOCK TRANSACTIONS</h4>
                {blockData.data.map((value, index) => {
                    return <TransactionItem transactionData={value} />;
                })}
            </p>
        );
    };

    const Detail = () => {
        return (
            <p className="view">
                <h3 className="text-center">BLOCK DETAILS</h3>
                <Table responsive="sm">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Index</td>
                            <td>{blockData.index}</td>
                        </tr>
                        <tr>
                            <td>Hash</td>
                            <td>
                                <code>{props.match.params.blockHash}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Status</td>
                            <td>Confirmed</td>
                        </tr>
                        <tr>
                            <td>Nonce</td>
                            <td>{blockData.nonce}</td>
                        </tr>
                        <tr>
                            <td>Difficulty</td>
                            <td>{blockData.difficulty}</td>
                        </tr>
                        <tr>
                            <td>Previous hash</td>
                            <td>
                                <code>{blockData.previousHash || 'GENESIS BLOCK'}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Time</td>
                            <td>{new Date(blockData.timestamp * 1000).toGMTString()}</td>
                        </tr>
                    </tbody>
                </Table>
            </p>
        );
    };

    return (
        <>
            {blockData && isLoadingPreData === false && (
                <>
                    <Detail />
                    <hr />
                    {/* {/* <Input txIns={blockData.txIns} txOuts={blockData.txOuts}></Input>
                    <hr /> */}
                    <TransactionList txOuts={blockData.txOuts}></TransactionList>
                    <hr />
                </>
            )}
            {!blockData && isLoadingPreData === false && <Redirect to="/404" />}
        </>
    );
};

export default BlockDetail;
