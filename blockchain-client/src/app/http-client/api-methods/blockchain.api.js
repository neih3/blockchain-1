import httpClient from '../config/http-client';
import axios from 'axios';

const getAllBlocks = () => {
    return httpClient
        .get('/blocks')
        .then((result) => {
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(err));
};

const getCurrentBalance = () => {
    return httpClient
        .get('/balance')
        .then((result) => {
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(err));
};

const getAlluTxOs = () => {
    return httpClient
        .get('/unspentTransactionOutputs')
        .then((result) => {
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(err));
};

const mineBlock = () => {
    return httpClient
        .post('/mineBlock')
        .then((result) => {
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(err));
};

const mineRawBlock = () => {
    return httpClient
        .post('/mineRawBlock')
        .then((result) => {
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(err));
};

const sendTransaction = (address, amount) => {
    return httpClient
        .post('/sendTransaction', { address, amount })
        .then((result) => {
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(err));
};

const getAlluTxOsAddress = (address) => {
    return httpClient
        .get(`/address/${address}`)
        .then((result) => {
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(err));
};

const getTransactionPool = (address) => {
    return httpClient
        .get(`/transactionPool`)
        .then((result) => {
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(err));
};

const getTransactionDetail = (transactionId) => {
    return httpClient
        .get(`/transaction/${transactionId}`)
        .then((result) => {
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(err));
};

const getBlockDetail = (blockHash) => {
    return httpClient
        .get(`/block/${blockHash}`)
        .then((result) => {
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(err));
};

const mineFromPool = () => {
    return httpClient
        .post('/mineFromPool')
        .then((result) => Promise.resolve(result))
        .catch((err) => Promise.reject(err));
};

const getMyUnspentTransactionOutputs = () => {
    return httpClient
        .get('/myUnspentTransactionOutputs')
        .then((result) => {
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(err));
};

const getPublicAddress = () => {
    return httpClient
        .get('/address')
        .then((result) => {
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(err));
};

const mineTransaction = (address, amount) => {
    return httpClient
        .post('/mineTransaction', { address, amount })
        .then((result) => {
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(err));
};

const mineRawBlockWithData = (data) => {
    return httpClient
        .post('/mineRawBlock', { data })
        .then((result) => {
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(err));
};

export default {
    getAllBlocks,
    mineRawBlock,
    mineBlock,
    getAlluTxOs,
    getCurrentBalance,
    sendTransaction,
    getAlluTxOsAddress,
    getTransactionPool,
    getTransactionDetail,
    getBlockDetail,
    mineFromPool,
    getMyUnspentTransactionOutputs,
    getPublicAddress,
    mineTransaction,
    mineRawBlockWithData,
};
