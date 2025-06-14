import _const from '../assets/const';
import enums from '../enums';
import apiMethods from '../http-client/api-methods';
import MessageBox from './MessageBox';
import _ from 'lodash';

function truncateAddress(value) {
    return _.truncate(value, {
        length: 25,
        omission: '...',
    });
}

function truncateHash(value) {
    return _.truncate(value, {
        length: 18,
        omission: '...',
    });
}

function convertDateTimeWithTimezoneForMySQLFormat(value) {
    return new Date(new Date(value) - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');
}

function checkPhoneIsValid(phoneValue) {
    const value = phoneValue.replace(/\s+/g, '');
    if (value.length < 10 || isNaN(value)) {
        return false;
    } else return true;
}

const checkPhoneIsExistAsMain = async (phoneValue) => {
    // Check phone valid by regex
    if (checkPhoneIsValid(phoneValue) === false) {
        return { flag: enums.PhoneStatus.PHONE_IS_INVALID, data: null };
    }

    const data = await apiMethods.student
        .checkPhoneIsMain(phoneValue)
        .then((result) => result.data?.data)
        .then(async (result) => {
            // Phone number was not used as a main contact
            if (!result) {
                return { flag: enums.PhoneStatus.PHONE_WAS_NOT_USED, data: null };
            }

            // Be user's main contact
            if (result.id) {
                // Not a student main contact
                if (result.user.role !== _const.Role.Student) {
                    return { flag: enums.PhoneStatus.PHONE_USER_IS_NOT_STUDENT, data: null };
                }

                // This phone is another student's main contact
                return await apiMethods.student
                    .getSingleStudent(result.userId)
                    .then((result2) => result2.data.data)
                    .then((result2) => {
                        return {
                            flag: enums.PhoneStatus.PHONE_USER_IS_STUDENT,
                            data: {
                                id: result.id,
                                userId: result.userId,
                                role: result.user.role,
                                name: result.user.name,
                                gender: result.user.gender,
                                contacts: result2.user.contacts.filter(
                                    (t) => t.isMainContact === false,
                                ),
                            },
                        };
                    });
            }
        })
        .catch((err) => {
            MessageBox.show({
                content: 'Please try again!',
                messageType: MessageBox.MessageType.Error,
                key: 'check-phone-exist',
            });
        });
    return data;
};

function ValueInCurrency(value) {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'BTC' }).format(value);
}

export default {
    convertDateTimeWithTimezoneForMySQLFormat,
    checkPhoneIsValid,
    ValueInCurrency,
    checkPhoneIsExistAsMain,
    truncateAddress,
    truncateHash,
};
