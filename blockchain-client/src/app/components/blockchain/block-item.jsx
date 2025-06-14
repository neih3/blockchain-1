import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { FaReceipt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import helpers from '../../helpers/';

const BlockItem = (props) => {
    const { blockData } = props;
    return (
        <Card style={{ marginTop: 20 }}>
            <Card.Header style={{ display: 'flex' }} className="justify-content-between">
                <span>Block #{blockData.index}</span>
                <Link to={`/block/${blockData.hash}`}>
                    <FaReceipt size={20} />
                </Link>
            </Card.Header>
            <Card.Body>
                <p>
                    Hash: <code>{blockData.hash}</code>
                </p>
                <p>
                    Timestamp: <code>{blockData.timestamp}</code>
                </p>
                <p>Nonce: {blockData.nonce}</p>
                <p>Difficulty: {blockData.difficulty}</p>
            </Card.Body>
            <Card.Footer>
                <span>
                    Previous hash:{' '}
                    <code>
                        {blockData.previousHash !== '' ? blockData.previousHash : 'GENESIS BLOCK'}
                    </code>
                </span>
                <p>
                    Mined by:{' '}
                    <Link to={`/address/${blockData.data[0].txOuts[0].address}`}>
                        <code>{helpers.truncateAddress(blockData.data[0].txOuts[0].address)}</code>
                    </Link>
                </p>
            </Card.Footer>
        </Card>
    );
};

export default BlockItem;
