import { message } from 'antd';

const MessageType = {
    Information: 1,
    Success: 2,
    Warning: 3,
    Error: 4,
    Loading: 5,
};

const defaultDuration = 5;

const show = ({ content, messageType, key, onClose }) => {
    switch (messageType) {
        case MessageType.Info: {
            message.info({
                content: content,
                key: key || '',
                duration: defaultDuration,
                onClose,
            });
            break;
        }
        case MessageType.Success: {
            message.success({
                content: content,
                key: key || '',
                duration: defaultDuration,
                onClose,
            });
            break;
        }
        case MessageType.Warning: {
            message.warning({
                content: content,
                key: key || '',
                duration: defaultDuration,
                onClose,
            });
            break;
        }
        case MessageType.Error: {
            message.error({
                content: content || 'ERROR',
                key: key || '',
                duration: defaultDuration,
                onClose,
            });
            break;
        }
        case MessageType.Loading: {
            message.loading({
                content: content || 'Loading...',
                duration: defaultDuration,
                key: key || '',
            });
            break;
        }
        default:
    }
};

export default {
    show,
    MessageType,
};
