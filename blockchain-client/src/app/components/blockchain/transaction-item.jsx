import _ from 'lodash';
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import helpers from '../../helpers/index';

const TransactionItem = (props) => {
    const { transactionData } = props;

    const Input = ({ txIns, txOuts }) => {
        return (
            <p>
                {txIns.map((value, index) => (
                    <>
                        {txIns[0].signature !== '' && (
                            <Row>
                                <Col>
                                    <code>{helpers.truncateAddress(txOuts[0].address)}</code>
                                </Col>
                                <Col>{'=>'}</Col>
                                <Col>
                                    <span>{_.sumBy(txOuts, 'amount')}</span>
                                </Col>
                            </Row>
                        )}
                        {txIns[0].signature === '' && (
                            <p>
                                <code>COINBASE (Newly Generated Coins)</code>
                            </p>
                        )}
                    </>
                ))}
            </p>
        );
    };

    const Output = ({ txOuts }) => {
        return (
            <p>
                {txOuts.map((value, index) => (
                    <Row>
                        <Col>
                            <code>{helpers.truncateAddress(value.address)}</code>
                        </Col>
                        <Col>{'=>'}</Col>
                        <Col>
                            <span>{value.amount}</span>
                        </Col>
                    </Row>
                ))}
            </p>
        );
    };

    return (
        <Card style={{ marginTop: 20 }}>
            <Card.Header>
                Hash <Link to={`/transaction/${transactionData.id}`}>{transactionData.id}</Link>
            </Card.Header>
            <Card.Body>
                <Row>
                    <Col>
                        Inputs
                        <Input txIns={transactionData.txIns} txOuts={transactionData.txOuts} />
                    </Col>
                    <Col>
                        Outputs
                        <Output txOuts={transactionData.txOuts} />
                    </Col>
                </Row>
            </Card.Body>
            <Card.Footer></Card.Footer>
        </Card>
    );
};

export default TransactionItem;
