export function createActionCreators(type, payload = undefined, error = false, meta = null) {
    return { type, payload, error, meta };
}
