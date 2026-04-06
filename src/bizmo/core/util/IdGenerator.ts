import { v4 } from 'uuid';

/**
 * ID生成器
 */
export class IDGenerator {
    /**
     * ユニークなIDを生成する
     * uuid v4 の文字列を利用しているため衝突しない
     * @return {string}
     */
    public static generateId(): string {
        return v4();
    }
}
