import authorization from './authorization.api';
import currentUser from './currentUser.api';
import blockchain from './blockchain.api';

export default { authorization, currentUser, blockchain };
export const authApi = authorization;
export const blockchainApi = blockchain;
