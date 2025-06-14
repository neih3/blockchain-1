const ClassTypes = ['Pre', 'IE4', 'IE5', '1vs1-', 'Waiting'];
const ClassPlaces = ['T-', 'G-'];
const DateFormatType = 'DD/MM/YYYY';
const ClassTimeFormatType = 'HH:mm';

const GenderEnum = {
    Female: 0,
    Male: 1,
    Other: 2,
};

const Role = {
    Admin: 'Admin',
    Employee: 'Employee',
    TA: 'TA',
    Teacher: 'Teacher',
    Student: 'Student',
    Parent: 'Parent',
};

const FormLayout = {
    labelCol: {
        span: 4,
        style: { textAlign: 'left' },
    },
    wrapperCol: {
        span: 20,
    },
};

export default {
    FormLayout,
    ClassTypes,
    ClassPlaces,
    DateFormatType,
    ClassTimeFormatType,
    GenderEnum,
    Role,
};
