import Status from './status.enum';
import CallingStatus from './calling-status.enum';

const PhoneStatus = {
    PHONE_IS_INVALID: 'PHONE_IS_INVALID',
    PHONE_USER_IS_STUDENT: 'PHONE_USER_IS_STUDENT',
    PHONE_USER_IS_NOT_STUDENT: 'PHONE_USER_IS_NOT_STUDENT',
    PHONE_WAS_NOT_USED: 'PHONE_WAS_NOT_USED',
};

export default { Status, CallingStatus, PhoneStatus };
