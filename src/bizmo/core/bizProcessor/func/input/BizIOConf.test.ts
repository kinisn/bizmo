import { BizIOConf } from './BizIOConf';

describe('BizIOConf のテスト', () => {
    describe('初期化 & get', () => {
        test('必須のみ', () => {
            const conf = new BizIOConf('biz_id');
            expect(conf.targetId).toEqual('biz_id');
            expect(conf.relativeTermIndex).toEqual(1);
        });

        test('全パラメータ', () => {
            const conf = new BizIOConf('biz_id', 12);
            expect(conf.targetId).toEqual('biz_id');
            expect(conf.relativeTermIndex).toEqual(12);
        });
    });

    test('set', () => {
        const conf = new BizIOConf('biz_id');
        conf.targetId = 'biz_id_2';
        conf.relativeTermIndex = 123;
        expect(conf.targetId).toEqual('biz_id_2');
        expect(conf.relativeTermIndex).toEqual(123);
    });
});
