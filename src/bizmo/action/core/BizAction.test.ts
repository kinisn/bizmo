import {
    BizComponent,
    BizComponentGroupType,
} from 'bizmo/bizComponent/BizComponent';
import { CollaboratorBizActors } from 'bizmo/bizComponent/bizActors/CollaboratorBizActors';
import { UserLifeCycleBizActors } from 'bizmo/bizComponent/bizActors/user/UserLifeCycleBizActors';
import { AmountBizIO, MonetaryBizIO } from 'bizmo/core/bizIO/single/BizIOs';
import { BizValue } from 'bizmo/core/bizIO/value/BizValue';
import { BizFunction } from 'bizmo/core/bizProcessor/func/BizFunction';
import { BizIOConf } from 'bizmo/core/bizProcessor/func/input/BizIOConf';
import { SystemInput } from 'bizmo/core/bizProcessor/func/input/SystemInput';
import {
    BizProcOutput,
    BizProcOutputMode,
} from 'bizmo/core/bizProcessor/output/BizProcOutput';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import i18n from 'i18n/configs';
import { BizActionType } from '../BizActionType';
import { BizAction } from './BizAction';
import { BizRelation } from './BizRelation';

describe('BizAction', () => {
    let timetable: Timetable;
    let db: BizDatabase<any, BizComponentGroupType>;
    let hyperMG: HyperParamManager;
    let bizComponent: BizComponent;
    let collab1: CollaboratorBizActors;
    let amount1: AmountBizIO;
    let collaboratorsMonetaryValueIO: MonetaryBizIO;
    let users: UserLifeCycleBizActors;
    let usersAmountIO: AmountBizIO;
    let companyAmountIO: AmountBizIO;
    let func1: BizFunction;
    let func2: BizFunction;
    let func3: BizFunction;
    let sysInputs: Array<Decimal>;

    // action
    let action1: BizAction;
    let action2: BizAction;
    let relation1: BizRelation;

    beforeEach(() => {
        i18n.changeLanguage('test');

        timetable = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 3,
        });
        timetable.currentIndex = 1;
        db = new BizDatabase<any, BizComponentGroupType>();
        hyperMG = new HyperParamManager();

        // BizComponent
        bizComponent = new BizComponent({ timetable, db, hyperMG });

        bizComponent.collaborators.setName('COLLABORATORS');
        bizComponent.company.setName('COMPANY');
        bizComponent.userLifeCycles.setName('USERS');

        collab1 = bizComponent.collaborators.addSeedCollaborator('COLLAB_1')!;
        amount1 = collab1.addSeedAmountIO('AMOUNT')!;
        amount1.setHistory([
            new BizValue(new Date(2020, 1, 1), new Decimal(10)),
            new BizValue(new Date(2020, 2, 1), new Decimal(20)),
            new BizValue(new Date(2020, 3, 1), new Decimal(30)),
        ]);
        collaboratorsMonetaryValueIO =
            collab1.addSeedMonetaryIO('MONETARY_VALUE')!;
        collaboratorsMonetaryValueIO.setHistory([
            new BizValue(new Date(2020, 1, 1), new Decimal(100)),
            new BizValue(new Date(2020, 2, 1), new Decimal(200)),
            new BizValue(new Date(2020, 3, 1), new Decimal(300)),
        ]);

        users = bizComponent.userLifeCycles.selectUsersLifeCycle()!;
        usersAmountIO = users.addSeedAmountIO('AMOUNT')!;
        users.addSeedMonetaryIO('MONETARY_VALUE')!;
        companyAmountIO = bizComponent.company.addSeedAmountIO('AMOUNT')!;
        bizComponent.company.addSeedMonetaryIO('MONETARY_VALUE')!;

        func1 = new BizFunction({
            code: 'if(gt(10,1),54,0)',
            funcId: 'func_1',
        }); //   54
        func2 = new BizFunction({
            code: 'if(lt(10,1),0,32)',
            funcId: 'func_2',
        }); //   32
        func3 = new BizFunction({
            code:
                'bizio0 * 1000000000000 + bizio1 * 10000000000 + ' +
                'res0 * 100000000 + res1 * 1000000 + ' +
                'sys3 * 10000 + sys4 * 100',
            orderedBizIOConf: [
                new BizIOConf(amount1.id, 0),
                new BizIOConf(amount1.id, 1),
            ],
            funcId: 'func_3',
        });
        sysInputs = new SystemInput(
            timetable.currentIndex,
            timetable.currentDate
        ).inputs;

        // BizAction
        action1 = new BizAction({ timetable, db, hyperMG });
        action1.setPriorityAt(timetable.currentDate, new Decimal(1));

        relation1 = new BizRelation({
            fromBizIOId: users.id,
            toBizIOId: bizComponent.company.id,
            relationId: 'RELATION',
        });
        action2 = new BizAction({
            timetable,
            db,
            hyperMG,
            name: 'ACTION_NAME',
            actionId: 'ACTION_ID',
            orderedFunctions: [func1, func2, func3],
            outputs: [
                new BizProcOutput({
                    parentId: bizComponent.company.id,
                    outputBizId: companyAmountIO.id,
                    outputFuncId: func1.funcId,
                    outputId: 'OUTPUT_ID_2',
                }),
                new BizProcOutput({
                    parentId: users.id,
                    outputBizId: usersAmountIO.id,
                    outputFuncId: func3.funcId,
                    outputId: 'OUTPUT_ID_1',
                }),
            ],
            relations: new Map([[relation1.relationId, relation1]]),
        });
        action2.setPriorityAt(timetable.currentDate, new Decimal(1));
    });

    describe('init', () => {
        test('default', () => {
            expect(action1.name).toBe('BizAction');
            expect(action1.timetable).toBe(timetable);
            expect(action1.db).toBe(db);
            expect(action1.actionId).not.toBeUndefined();
            expect(action1.relations.size).toBe(0);
            expect(action1.actionType).toBe(BizActionType.GENERAL);
            expect(action1.priorities).toEqual([
                new Decimal('NaN'),
                new Decimal(1),
                new Decimal(1),
            ]);
        });

        test('with param', () => {
            expect(action2.name).toBe('ACTION_NAME');
            expect(action2.timetable).toBe(timetable);
            expect(action2.db).toBe(db);
            expect(action2.actionId).toBe('ACTION_ID');
            expect(action2.relations.size).toBe(1);
            expect(action2.actionType).toBe(BizActionType.GENERAL);
            expect(action2.priorities).toEqual([
                new Decimal('NaN'),
                new Decimal(1),
                new Decimal(1),
            ]);

            expect(action2.relations).toEqual(
                new Map<string, BizRelation>([
                    [
                        'RELATION',
                        new BizRelation({
                            fromBizIOId: users.id,
                            toBizIOId: bizComponent.company.id,
                            relationId: 'RELATION',
                        }),
                    ],
                ])
            );
        });
    });

    test('check setting param', () => {
        expect(amount1.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(10)),
            new BizValue(new Date(2020, 2, 1), new Decimal(20)),
            new BizValue(new Date(2020, 3, 1), new Decimal(30)),
        ]);
        expect(collaboratorsMonetaryValueIO.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(100)),
            new BizValue(new Date(2020, 2, 1), new Decimal(200)),
            new BizValue(new Date(2020, 3, 1), new Decimal(300)),
        ]);

        expect(bizComponent.exportAsTable()).toEqual([
            [
                'BizComponent:COLLABORATORS:COLLAB_1:AMOUNT',
                new Decimal('10'),
                new Decimal('20'),
                new Decimal('30'),
            ],
            [
                'BizComponent:COLLABORATORS:COLLAB_1:MONETARY_VALUE',
                new Decimal('100'),
                new Decimal('200'),
                new Decimal('300'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:流動資産:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:流動資産:現金及び預金:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:流動資産:現金及び預金',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:流動資産:売掛金:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:流動資産:売掛金',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:流動資産:たな卸資産:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:流動資産:たな卸資産:商品及び製品:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:流動資産:たな卸資産:商品及び製品',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:流動資産:たな卸資産:原料及び材料:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:流動資産:たな卸資産:原料及び材料',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:流動資産:たな卸資産:仕掛品及び半成工事:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:流動資産:たな卸資産:仕掛品及び半成工事',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:流動資産:たな卸資産',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:流動資産',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:固定資産:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:固定資産:有形固定資産:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:固定資産:有形固定資産:建物及び附属設備:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:固定資産:有形固定資産:建物及び附属設備',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:固定資産:有形固定資産',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:固定資産:無形固定資産:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:固定資産:無形固定資産:ソフトウエア:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:固定資産:無形固定資産:ソフトウエア',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:固定資産:無形固定資産:ソフトウエア仮勘定:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:固定資産:無形固定資産:ソフトウエア仮勘定',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:固定資産:無形固定資産',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:固定資産',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:投資その他の資産:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産:投資その他の資産',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:資産',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:負債:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:負債:流動負債:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:負債:流動負債:買掛金:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:負債:流動負債:買掛金',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:負債:流動負債:未払金及び未払費用:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:負債:流動負債:未払金及び未払費用',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:負債:流動負債',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:負債:固定負債:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:負債:固定負債:社債:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:負債:固定負債:社債',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:負債:固定負債:長期借入金:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:負債:固定負債:長期借入金',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:負債:固定負債',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:負債',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:純資産:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:純資産:株主資本:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:純資産:株主資本:資本金:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:純資産:株主資本:資本金',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:純資産:株主資本:資本剰余金:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:純資産:株主資本:資本剰余金',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:純資産:株主資本:利益剰余金:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:純資産:株主資本:利益剰余金',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:純資産:株主資本',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:純資産',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:収益:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:収益:売上高:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:収益:売上高',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:収益:営業外収益:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:収益:営業外収益',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:収益:特別利益:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:収益:特別利益',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:収益',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:売上原価:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:売上原価',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:販売手数料:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:販売手数料',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:広告宣伝費:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:広告宣伝費',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:役員報酬:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:役員報酬',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:給料:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:給料',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:租税公課:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:租税公課',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:減価償却費:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:減価償却費',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:研究開発費:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:研究開発費',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:法定福利費:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:法定福利費',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:支払報酬:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:支払報酬',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:支払手数料:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:支払手数料',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:業務委託費:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:業務委託費',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:地代家賃:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:地代家賃',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:代理店手数料:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:代理店手数料',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:運送費及び保管費:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:運送費及び保管費',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業活動による費用・売上原価',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業外費用:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:営業外費用',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:特別損失:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用:特別損失',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:ACCOUNTING:費用',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:MONETARY_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:USERS:MAIN_TARGET:MARKET:BASE_AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:USERS:MAIN_TARGET:MARKET:GROWTH_RATE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:USERS:MAIN_TARGET:MARKET',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:USERS:MAIN_TARGET:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:USERS:MAIN_TARGET:MONETARY_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
        ]);
    });

    test('typical process', () => {
        expect(sysInputs.length).toBe(5);
        action2.process(sysInputs);
        expect(companyAmountIO.exportAsTable()).toEqual([
            ['AMOUNT', new Decimal('0'), new Decimal('54'), new Decimal('54')],
        ]);
        expect(usersAmountIO.exportAsTable()).toEqual([
            [
                'AMOUNT',
                new Decimal('0'),
                new Decimal('20105432030100'),
                new Decimal('20105432030100'),
            ],
        ]);
    });

    test('append ActionProcessor and orderedProcessors', () => {
        action2.appendActionProcessor(
            [new BizFunction({ code: '123000', funcId: 'fun_1_1' })],
            [
                new BizProcOutput({
                    outputId: 'OUTPUT_ID_1_1',
                    parentId: collab1.id,
                    outputBizId: amount1.id,
                    outputFuncId: 'fun_1_1',
                }),
            ]
        );
        expect(action2.orderedProcessors.length).toBe(2);

        // processor #1
        expect(action2.orderedProcessors[0].timetable).toBe(timetable);
        expect(action2.orderedProcessors[0].db).toBe(db);
        expect(String(action2.orderedProcessors[0].orderedBizFunctions)).toBe(
            String([func1, func2, func3])
        );
        expect(action2.orderedProcessors[0].procOutputs).toEqual([
            new BizProcOutput({
                parentId: bizComponent.company.id,
                outputBizId: companyAmountIO.id,
                outputFuncId: func1.funcId,
                outputId: 'OUTPUT_ID_2',
            }),
            new BizProcOutput({
                parentId: users.id,
                outputBizId: usersAmountIO.id,
                outputFuncId: func3.funcId,
                outputId: 'OUTPUT_ID_1',
            }),
        ]);
        // processor #2
        expect(action2.orderedProcessors[1].timetable).toBe(timetable);
        expect(action2.orderedProcessors[1].db).toBe(db);
        expect(String(action2.orderedProcessors[1].orderedBizFunctions)).toBe(
            String([new BizFunction({ code: '123000', funcId: 'fun_1_1' })])
        );
        expect(action2.orderedProcessors[1].procOutputs).toEqual([
            new BizProcOutput({
                outputId: 'OUTPUT_ID_1_1',
                parentId: collab1.id,
                outputBizId: amount1.id,
                outputFuncId: 'fun_1_1',
            }),
        ]);
    });

    test('swap_action_processor_order_at', () => {
        action2.appendActionProcessor(
            [new BizFunction({ code: '123000', funcId: 'fun_1_1' })],
            [
                new BizProcOutput({
                    outputId: 'OUTPUT_ID_1_1',
                    parentId: collab1.id,
                    outputBizId: amount1.id,
                    outputFuncId: 'fun_1_1',
                }),
            ]
        );
        expect(action2.orderedProcessors.length).toBe(2);

        // out of index = 変化なし
        action2.swapActionProcessorOrderAt(-1, 0);
        expect(String(action2.orderedProcessors[0].orderedBizFunctions)).toBe(
            String([func1, func2, func3])
        );
        expect(String(action2.orderedProcessors[1].orderedBizFunctions)).toBe(
            String([new BizFunction({ code: '123000', funcId: 'fun_1_1' })])
        );

        action2.swapActionProcessorOrderAt(0, 2);
        expect(String(action2.orderedProcessors[0].orderedBizFunctions)).toBe(
            String([func1, func2, func3])
        );
        expect(String(action2.orderedProcessors[1].orderedBizFunctions)).toBe(
            String([new BizFunction({ code: '123000', funcId: 'fun_1_1' })])
        );

        // in order
        action2.swapActionProcessorOrderAt(0, 1);
        expect(String(action2.orderedProcessors[0].orderedBizFunctions)).toBe(
            String([new BizFunction({ code: '123000', funcId: 'fun_1_1' })])
        );
        expect(String(action2.orderedProcessors[1].orderedBizFunctions)).toBe(
            String([func1, func2, func3])
        );
    });

    test('remove_action_processor_at', () => {
        action2.appendActionProcessor(
            [new BizFunction({ code: '123000', funcId: 'fun_1_1' })],
            [
                new BizProcOutput({
                    outputId: 'OUTPUT_ID_1_1',
                    parentId: collab1.id,
                    outputBizId: amount1.id,
                    outputFuncId: 'fun_1_1',
                }),
            ]
        );
        expect(action2.orderedProcessors.length).toBe(2);
        expect(String(action2.orderedProcessors[0].orderedBizFunctions)).toBe(
            String([func1, func2, func3])
        );
        expect(String(action2.orderedProcessors[1].orderedBizFunctions)).toBe(
            String([new BizFunction({ code: '123000', funcId: 'fun_1_1' })])
        );

        // out of index = 変化なし
        action2.removeActionProcessorAt(-1);
        expect(String(action2.orderedProcessors[0].orderedBizFunctions)).toBe(
            String([func1, func2, func3])
        );
        expect(String(action2.orderedProcessors[1].orderedBizFunctions)).toBe(
            String([new BizFunction({ code: '123000', funcId: 'fun_1_1' })])
        );

        // in order
        action2.removeActionProcessorAt(0);
        expect(action2.orderedProcessors.length).toBe(1);
        expect(String(action2.orderedProcessors[0].orderedBizFunctions)).toBe(
            String([new BizFunction({ code: '123000', funcId: 'fun_1_1' })])
        );
    });

    test('create_seed_proc_output', () => {
        // no relation => no data
        let output: BizProcOutput | undefined = action1.createSeedProcOutput({
            outputId: 'output_1',
            parentBizId: users.id,
        });
        expect(output).toBeUndefined();

        // not actor の確認は BizActionProcessor で行っているので不要

        // # with relation
        // in relation
        output = action2.createSeedProcOutput({
            parentBizId: users.id,
            outputId: 'output_1',
        });
        expect(output?.outputId).toBe('output_1');
        expect(output?.parentId).toEqual(users.id);
        expect(output?.outputBizId).toBeUndefined();
        expect(output?.outputFuncId).toBeUndefined();
        expect(output?.outputMode).toEqual(BizProcOutputMode.REPLACE);

        output = action2.createSeedProcOutput({
            parentBizId: bizComponent.company.id,
            outputId: 'output_1',
        });
        expect(output?.outputId).toBe('output_1');
        expect(output?.parentId).toEqual(bizComponent.company.id);
        expect(output?.outputBizId).toBeUndefined();
        expect(output?.outputFuncId).toBeUndefined();
        expect(output?.outputMode).toEqual(BizProcOutputMode.REPLACE);

        // out of relation
        output = action2.createSeedProcOutput({
            parentBizId: bizComponent.collaborators.id,
            outputId: 'output_1',
        });
        expect(output).toBeUndefined();

        // change to include relation
        action2.setRelation(
            new BizRelation({
                fromBizIOId: bizComponent.collaborators.id,
                toBizIOId: bizComponent.company.id,
                relationId: 'RELATION_2',
            })
        );
        output = action2.createSeedProcOutput({
            parentBizId: bizComponent.collaborators.id,
            outputId: 'output_2',
        });
        expect(output?.outputId).toBe('output_2');
        expect(output?.parentId).toEqual(bizComponent.collaborators.id);
        expect(output?.outputBizId).toBeUndefined();
        expect(output?.outputFuncId).toBeUndefined();
        expect(output?.outputMode).toEqual(BizProcOutputMode.REPLACE);
    });
});
