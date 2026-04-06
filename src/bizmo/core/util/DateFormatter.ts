/**
 * date から YYYY年MM月 形式表記の文字列を生成する。
 * @param {Date} date
 * @param {string} separator
 * @return {string}
 */
export function formatToYYYYMM(date: Date): string {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

/**
 * date から YYYYMMDD 形式表記の文字列を生成する。
 * @param {Date} date
 * @param {string} separator
 * @return {string}
 */
export function formatToYYYYMMDD(date: Date, separator: string = '-'): string {
    return `${date.getFullYear()}${separator}${(
        '00' +
        (date.getMonth() + 1)
    ).slice(-2)}${separator}${('00' + date.getDate()).slice(-2)}`;
}
export default formatToYYYYMMDD;
