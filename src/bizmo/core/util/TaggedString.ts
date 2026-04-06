/**
 * タグを含んだ文字列を変換する関数
 *
 * = 設定時 =
 * type TT = { code: number; message: string };
 * const errorTemplate: TaggedString<TT> = (p: TT) => `[Error] code: ${p.code}, message: ${p.message}`;
 *
 * = 適用時 =
 * const param: TT = {code: 404, message: 'error message text'};
 * const error404Message = errorTemplate(param);
 */
export type TaggedString<T> = (p: T) => string;

/**
 * 準備済みの TaggedString
 * TaggedStringの適用時には、これが生成できる状況であること
 */
export type PreparedTaggedString<T> = {
    text: TaggedString<T>;
    tags: T;
};
