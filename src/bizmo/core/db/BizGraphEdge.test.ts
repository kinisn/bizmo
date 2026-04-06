import { BizGraphEdge } from './BizGraphEdge';

describe('BizGraphEdge のテスト', () => {
    test('初期化', () => {
        const edge = new BizGraphEdge('from_biz_id', 'to_biz_id');
        expect(edge.from).toEqual('from_biz_id');
        expect(edge.to).toEqual('to_biz_id');
        expect(edge.key).toEqual('from_biz_id::to_biz_id');
    });
    describe('createByKey のテスト', () => {
        test('正常なKey', () => {
            const edge = BizGraphEdge.createByKey('from_biz_id::to_biz_id');
            expect(edge.from).toEqual('from_biz_id');
            expect(edge.to).toEqual('to_biz_id');
            expect(edge.key).toEqual('from_biz_id::to_biz_id');
        });
    });
});
