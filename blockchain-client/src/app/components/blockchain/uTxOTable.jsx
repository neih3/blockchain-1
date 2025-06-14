import React, { useState } from 'react';
import { Table, Typography } from 'antd';
import { Link } from 'react-router-dom';
import helpers from '../../helpers';

const { Text } = Typography;

const UTxOTable = (props) => {
    const { data } = props;

    return (
        <React.Fragment>
            <Table dataSource={data} rowKey="id">
                <Table.Column title="TxIndex" dataIndex="txOutIndex" key="txOutIndex" />
                <Table.Column
                    title="TxId"
                    dataIndex="txOutId"
                    key="txOutId"
                    render={(value, record, index) => {
                        return <span>{helpers.truncateHash(value)}</span>;
                    }}
                />
                <Table.Column title="Amount" dataIndex="amount" key="amount" />
                <Table.Column
                    title="Address"
                    dataIndex="address"
                    width={30}
                    key="address"
                    render={(value, record, index) => {
                        return (
                            <Link to={`/address/${value}`}>{helpers.truncateAddress(value)}</Link>
                        );
                    }}
                />
            </Table>
        </React.Fragment>
    );
};

export default UTxOTable;
