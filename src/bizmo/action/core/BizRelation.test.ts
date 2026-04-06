import { BizRelation } from './BizRelation';

describe('BizRelation のテスト', () => {
    describe('init', () => {
        test('default', () => {
            const relation = new BizRelation({
                fromBizIOId: 'fromActorId',
                toBizIOId: 'toActorId',
            });
            expect(relation.fromBizIOId).toBe('fromActorId');
            expect(relation.toBizIOId).toBe('toActorId');
            expect(relation.relationId).not.toBeUndefined();
        });

        test('with param', () => {
            const relation = new BizRelation({
                fromBizIOId: 'fromActorId',
                toBizIOId: 'toActorId',
                relationId: 'relationId',
            });
            expect(relation.fromBizIOId).toBe('fromActorId');
            expect(relation.toBizIOId).toBe('toActorId');
            expect(relation.relationId).toBe('relationId');
        });
    });
});
