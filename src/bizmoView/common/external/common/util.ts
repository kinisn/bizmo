// ===== Utility ===== //
export function convertBoolToNumber(
    bool?: boolean,
    defaultBool?: boolean
): number {
    if (bool !== undefined) {
        return bool ? 1 : 0;
    } else {
        return defaultBool ? 1 : 0 ?? 0;
    }
}

export function convertNumberToBool(
    num?: number | string,
    defaultBool?: boolean
): boolean {
    if (num !== undefined) {
        return Number(num) === 1 ? true : false;
    } else {
        return defaultBool ? true : false ?? false;
    }
}
