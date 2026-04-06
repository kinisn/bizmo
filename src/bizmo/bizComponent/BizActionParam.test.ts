import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { MonetaryBizIO } from 'bizmo/core/bizIO/single/BizIOs';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import { BizActionLocalParam, BizActionParam } from './BizActionParam';
import { BizComponentGroupType } from './BizComponent';

describe('BizActionParam のテスト', () => {
    let timetable: Timetable;
    let db: BizDatabase<any, BizComponentGroupType>;

    let hyperMG: HyperParamManager;
    let actionParam1: BizActionParam;
    let actionParam2: BizActionParam;

    beforeEach(() => {
        timetable = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 3,
        });
        db = new BizDatabase();
        hyperMG = new HyperParamManager();
        actionParam1 = new BizActionParam({ timetable, db, hyperMG });
        actionParam2 = new BizActionParam({
            timetable,
            db,
            hyperMG,
            initData: new Map([
                [
                    BizActionParam.GLOBAL_PARAM,
                    new CollectionBizIO({
                        timetable,
                        db,
                        hyperMG,
                        name: 'global',
                    }),
                ],
                [
                    BizActionParam.LOCAL_PARAM,
                    new BizActionLocalParam({
                        timetable,
                        db,
                        hyperMG,
                        name: 'local',
                    }),
                ],
            ]),
        });
    });

    describe('init', () => {
        test('default', () => {
            expect(actionParam1.timetable).toBe(timetable);
            expect(actionParam1.db).toBe(db);
            expect(actionParam1.children.length).toBe(2);

            // global
            expect(actionParam1.globalParam.timetable).toBe(timetable);
            expect(actionParam1.globalParam.db).toBe(db);
            expect(actionParam1.globalParam.name).toEqual('GLOBAL_PARAM');

            // local

            expect(actionParam1.localParam.timetable).toBe(timetable);
            expect(actionParam1.localParam.db).toBe(db);
            expect(actionParam1.localParam.name).toEqual('LOCAL_PARAM');
            expect(actionParam1.localParam.children.length).toBe(0);
        });

        test('with param', () => {
            expect(actionParam2.timetable).toBe(timetable);
            expect(actionParam2.db).toBe(db);
            expect(actionParam2.children.length).toBe(2);

            // global
            expect(actionParam2.globalParam.timetable).toBe(timetable);
            expect(actionParam2.globalParam.db).toBe(db);
            expect(actionParam2.globalParam.name).toEqual('global');

            // local
            expect(actionParam2.localParam.timetable).toBe(timetable);
            expect(actionParam2.localParam.db).toBe(db);
            expect(actionParam2.localParam.name).toEqual('local');
            expect(actionParam2.localParam.children.length).toBe(0);
        });
    });

    test('get_allocated_local_param', () => {
        const actionID1 = 'action_id_1';
        const actionID2 = 'action_id_2';

        // 初回取得
        let parm1 = actionParam2.localParam.getAllocatedLocalParam(actionID1);
        expect(parm1?.children.length).toBe(0);
        expect(parm1?.name).toBe('action_id_1');

        let parm2 = actionParam2.localParam.getAllocatedLocalParam(actionID2);
        expect(parm2?.children.length).toBe(0);
        expect(parm2?.name).toBe('action_id_2');

        // 設定
        parm1?.appendChild(new MonetaryBizIO({ timetable, db, name: 'var_1' }));
        expect(parm1?.children.length).toBe(1);

        // ２回め
        parm1 = actionParam2.localParam.getAllocatedLocalParam(actionID1);
        expect(parm1?.children.length).toBe(1);
        parm2 = actionParam2.localParam.getAllocatedLocalParam(actionID2);
        expect(parm2?.children.length).toBe(0);
    });
});
