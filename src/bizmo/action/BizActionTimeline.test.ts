import {
    BizComponent,
    BizComponentGroupType,
} from 'bizmo/bizComponent/BizComponent';
import { CollaboratorBizActors } from 'bizmo/bizComponent/bizActors/CollaboratorBizActors';
import { AmountBizIO, MonetaryBizIO } from 'bizmo/core/bizIO/single/BizIOs';
import { BizValue } from 'bizmo/core/bizIO/value/BizValue';
import { BizFunction } from 'bizmo/core/bizProcessor/func/BizFunction';
import {
    BizProcOutput,
    BizProcOutputMode,
} from 'bizmo/core/bizProcessor/output/BizProcOutput';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { DateMap } from 'bizmo/core/util/DateMap';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import i18n from 'i18n/configs';
import { BizActionTimeline } from './BizActionTimeline';
import { BizAction } from './core/BizAction';

describe('BizActionTimeline', () => {
    let timetable: Timetable;
    let db: BizDatabase<any, BizComponentGroupType>;
    let hyperMG: HyperParamManager;
    let bizComponent: BizComponent;
    let collab1: CollaboratorBizActors;
    let amount1: AmountBizIO;
    let collaboratorsMonetaryValueIO: MonetaryBizIO;
    let companyAmountIO: AmountBizIO;
    let companyMonetaryValueIO: MonetaryBizIO;
    let func1: BizFunction;
    let func2: BizFunction;

    // action
    let action1: BizAction;
    let action2: BizAction;
    let action3: BizAction;

    // action timeline
    let actionTimetable1: BizActionTimeline;
    let actionTimetable2: BizActionTimeline;

    beforeEach(() => {
        i18n.changeLanguage('test');

        timetable = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 3,
        });
        timetable.currentIndex = 1;
        db = new BizDatabase();
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

        companyAmountIO = bizComponent.company.addSeedAmountIO('TS_AMOUNT')!;
        companyMonetaryValueIO =
            bizComponent.company.addSeedMonetaryIO('TS_MONETARY_VALUE')!;

        func1 = new BizFunction({ code: 'if(gt(10,1),54,0) * (sys0+1)' });
        func2 = new BizFunction({ code: 'if(lt(10,1),0,32) * (sys0+1)' });

        // BizAction
        action1 = new BizAction({
            timetable,
            db,
            hyperMG,
            name: 'ACTION_1',
            orderedFunctions: [func1],
            outputs: [
                new BizProcOutput({
                    outputId: 'OUTPUT_1',
                    parentId: bizComponent.company.id,
                    outputBizId: companyAmountIO.id,
                    outputFuncId: func1.funcId,
                    outputMode: BizProcOutputMode.REPLACE,
                }),
            ],
        });
        action2 = new BizAction({
            timetable,
            db,
            hyperMG,
            name: 'ACTION_2',
            orderedFunctions: [func2],
            outputs: [
                new BizProcOutput({
                    outputId: 'OUTPUT_2',
                    parentId: bizComponent.company.id,
                    outputBizId: companyMonetaryValueIO.id,
                    outputFuncId: func2.funcId,
                    outputMode: BizProcOutputMode.REPLACE,
                }),
            ],
        });
        action3 = new BizAction({
            timetable,
            db,
            hyperMG,
            name: 'ACTION_3',
            orderedFunctions: [func2],
            outputs: [
                new BizProcOutput({
                    outputId: 'OUTPUT_3',
                    parentId: bizComponent.company.id,
                    outputBizId: companyMonetaryValueIO.id,
                    outputFuncId: func2.funcId,
                    outputMode: BizProcOutputMode.SUB,
                }),
            ],
        });

        // BizActionTimeline
        actionTimetable1 = new BizActionTimeline({ timetable, db, hyperMG });
        const actionTimetable2Actions = new Map();
        actionTimetable2Actions.set(action1.actionId, action1);
        actionTimetable2Actions.set(action2.actionId, action2);
        actionTimetable2Actions.set(action3.actionId, action3);
        actionTimetable2 = new BizActionTimeline({
            timetable,
            db,
            hyperMG,
            priorityCounter: new Decimal(123),
            actions: actionTimetable2Actions,
        });
    });

    test('setting_param', () => {
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
                'BizComponent:COMPANY:TS_AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:COMPANY:TS_MONETARY_VALUE',
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
        ]);
    });

    describe('init', () => {
        test('default', () => {
            expect(actionTimetable1.timetable).toBe(timetable);
            expect(actionTimetable1.db).toBe(db);
            expect(actionTimetable1.storedActions.length).toBe(0);
            expect(actionTimetable1.priorityGenerator.generate()).toEqual(
                new Decimal(100)
            );
        });

        test('default with param', () => {
            expect(actionTimetable2.timetable).toBe(timetable);
            expect(actionTimetable2.db).toBe(db);
            expect(actionTimetable2.storedActions.length).toBe(3);
            expect(actionTimetable2.priorityGenerator.generate()).toEqual(
                new Decimal(12400)
            );
        });
    });

    test('setAction', () => {
        expect(action1.priorities).toEqual([
            new Decimal('NaN'),
            new Decimal('NaN'),
            new Decimal('NaN'),
        ]);

        // 1 default
        actionTimetable1.setAction(action1);
        expect(action1.priorities).toEqual([
            new Decimal('100'),
            new Decimal('100'),
            new Decimal('100'),
        ]);
        expect(actionTimetable1.storedActions.length).toBe(1);

        // 2 with priority
        const priorityEntity = new DateMap<Decimal>();
        priorityEntity.set(new Date(2020, 2, 1), new Decimal(1000));
        priorityEntity.set(new Date(2020, 3, 1), new Decimal(3000));
        actionTimetable1.setAction(action2, priorityEntity);
        expect(actionTimetable1.storedActions.length).toBe(2);

        // 途中で priority を利用者が独自に付けた場合は、どこかでその番号になる可能性がでてくるが、許容する。
        expect(action2.priorities).toEqual([
            new Decimal('NaN'),
            new Decimal(1000),
            new Decimal(3000),
        ]);

        // 3 default
        actionTimetable1.setAction(action3);
        expect(action3.priorities).toEqual([
            new Decimal(200),
            new Decimal(200),
            new Decimal(200),
        ]);
        let test = [action1, action2, action3];
        actionTimetable1.storedActions.map((action, index) => {
            expect(action.actionId).toBe(test[index].actionId);
        });

        // 4 replace to action2
        const action4 = new BizAction({
            timetable,
            db,
            hyperMG,
            name: 'ACTION_4',
            actionId: action2.actionId,
        });
        actionTimetable1.setAction(action4);
        expect(action4.priorities).toEqual([
            new Decimal(300),
            new Decimal(300),
            new Decimal(300),
        ]);
        test = [action1, action4, action3];
        actionTimetable1.storedActions.map((action, index) => {
            expect(action.actionId).toBe(test[index].actionId);
        });
    });

    test('removeAction', () => {
        let test = [action1, action2, action3];
        actionTimetable2.storedActions.map((action, index) => {
            expect(action.actionId).toBe(test[index].actionId);
        });

        // 異常： 不存在
        expect(actionTimetable2.removeAction('NOT_EXISTED_ID')).toBeFalsy();
        actionTimetable2.storedActions.map((action, index) => {
            expect(action.actionId).toBe(test[index].actionId);
        });

        // 正常
        expect(actionTimetable2.removeAction(action2.actionId)).toBeTruthy();
        test = [action1, action3];
        actionTimetable2.storedActions.map((action, index) => {
            expect(action.actionId).toBe(test[index].actionId);
        });
    });

    describe('sortToTimeline', () => {
        test('common case', () => {
            expect(actionTimetable1.sortToTimeline()).toEqual([[], [], []]);

            // prepare
            actionTimetable1.setAction(action1);
            actionTimetable1.setAction(action2);
            actionTimetable1.setAction(action3);

            expect(action1.priorities).toEqual([
                new Decimal(100),
                new Decimal(100),
                new Decimal(100),
            ]);
            expect(action2.priorities).toEqual([
                new Decimal(200),
                new Decimal(200),
                new Decimal(200),
            ]);
            expect(action3.priorities).toEqual([
                new Decimal(300),
                new Decimal(300),
                new Decimal(300),
            ]);
            const test1 = [action1, action2, action3];
            actionTimetable1.storedActions.map((action, index) => {
                expect(action.actionId).toBe(test1[index].actionId);
            });

            // sort #1
            const test2 = [
                [action1, action2, action3],
                [action1, action2, action3],
                [action1, action2, action3],
            ];
            actionTimetable1.sortToTimeline().map((termActions, index) => {
                termActions.map((action, inIndex) => {
                    expect(action.actionId).toBe(
                        test2[index][inIndex].actionId
                    );
                });
            });

            // edit priority
            action1.setPriorities(
                new DateMap([
                    [new Date(2020, 1, 1), new Decimal(-1000)],
                    [new Date(2020, 2, 1), new Decimal('NaN')],
                    [new Date(2020, 3, 1), new Decimal(2000)],
                ])
            );
            action2.setPriorities(
                new DateMap([
                    [new Date(2020, 1, 1), new Decimal(1000)],
                    [new Date(2020, 2, 1), new Decimal('NaN')],
                    [new Date(2020, 3, 1), new Decimal(3000)],
                ])
            );
            action3.setPriorities(
                new DateMap([
                    [new Date(2020, 1, 1), new Decimal(2000)],
                    [new Date(2020, 2, 1), new Decimal(1000)],
                    [new Date(2020, 3, 1), new Decimal(0)],
                ])
            );

            // sort #2
            const test3 = [
                [action1, action2, action3],
                [action3, action1],
                [action3, action1, action2],
            ];
            actionTimetable1.sortToTimeline().map((termActions, index) => {
                termActions.map((action, inIndex) => {
                    expect(action.actionId).toBe(
                        test3[index][inIndex].actionId
                    );
                });
            });

            // timeline expand
            timetable.length = 5;
            const test4 = [
                [action1, action2, action3],
                [action3],
                [action3, action1, action2],
                [action3, action1, action2],
                [action3, action1, action2],
            ];
            actionTimetable1.sortToTimeline().map((termActions, index) => {
                termActions.map((action, inIndex) => {
                    expect(action.actionId).toBe(
                        test4[index][inIndex].actionId
                    );
                });
            });
        });

        test('with same priority', () => {
            // edit priority
            action1.setPriorities(
                new DateMap([[new Date(2020, 1, 1), new Decimal(0)]])
            );
            action2.setPriorities(
                new DateMap([[new Date(2020, 1, 1), new Decimal(0)]])
            );
            action3.setPriorities(
                new DateMap([[new Date(2020, 1, 1), new Decimal(0)]])
            );
            actionTimetable1.setAction(action1);
            actionTimetable1.setAction(action2);
            actionTimetable1.setAction(action3);

            // sort #2
            const test1 = [
                [action1, action2, action3],
                [action1, action2, action3],
                [action1, action2, action3],
            ];
            actionTimetable1.sortToTimeline().map((termActions, index) => {
                termActions.map((action, inIndex) => {
                    expect(action.actionId).toBe(
                        test1[index][inIndex].actionId
                    );
                });
            });
        });
    });

    describe('process', () => {
        test('common', () => {
            const actionTimetable3 = new BizActionTimeline({
                timetable,
                db,
                hyperMG,
            });
            actionTimetable3.setAction(action1);
            actionTimetable3.setAction(action2);
            actionTimetable3.setAction(action3);

            // process #1
            actionTimetable3.process();

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
                    'BizComponent:COMPANY:TS_AMOUNT',
                    new Decimal('54'),
                    new Decimal('108'),
                    new Decimal('162'),
                ],
                [
                    'BizComponent:COMPANY:TS_MONETARY_VALUE',
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
            ]);
        });

        test('with start index', () => {
            const actionTimetable3 = new BizActionTimeline({
                timetable,
                db,
                hyperMG,
            });
            actionTimetable3.setAction(action1);
            actionTimetable3.setAction(action2);
            actionTimetable3.setAction(action3);

            // process #1
            actionTimetable3.process(2);
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
                    'BizComponent:COMPANY:TS_AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('162'),
                ],
                [
                    'BizComponent:COMPANY:TS_MONETARY_VALUE',
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
            ]);
        });

        test('case 2', () => {
            const actionTimetable3 = new BizActionTimeline({
                timetable,
                db,
                hyperMG,
            });
            actionTimetable3.setAction(action1);
            actionTimetable3.setAction(action2);
            actionTimetable3.setAction(action3);

            // prepare #2
            actionTimetable3.removeAction(action3.actionId);

            // process #2
            actionTimetable3.process();
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
                    'BizComponent:COMPANY:TS_AMOUNT',
                    new Decimal('54'),
                    new Decimal('108'),
                    new Decimal('162'),
                ],
                [
                    'BizComponent:COMPANY:TS_MONETARY_VALUE',
                    new Decimal('32'),
                    new Decimal('64'),
                    new Decimal('96'),
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
            ]);
        });

        test('case 3', () => {
            const actionTimetable3 = new BizActionTimeline({
                timetable,
                db,
                hyperMG,
            });
            actionTimetable3.setAction(action1);
            actionTimetable3.setAction(action2);
            actionTimetable3.setAction(action3);

            // prepare #3
            actionTimetable3.setAction(action3);
            // BizComponent:COMPANY:AMOUNT
            action1.setPriorities(
                new DateMap<Decimal>([
                    [new Date(2020, 1, 1), new Decimal(-1000)],
                    [new Date(2020, 2, 1), new Decimal('NaN')],
                    [new Date(2020, 3, 1), new Decimal(2000)],
                ])
            );

            // BizComponent:COMPANY:MONETARY_VALUE REPLACE "if(lt(10,1),0,32) * (sys0+1)"
            action2.setPriorities(
                new DateMap<Decimal>([
                    [new Date(2020, 1, 1), new Decimal(1000)],
                    [new Date(2020, 2, 1), new Decimal('NaN')],
                    [new Date(2020, 3, 1), new Decimal(3000)],
                ])
            );

            // BizComponent:COMPANY:MONETARY_VALUE SUB "if(lt(10,1),0,32) * (sys0+1)"
            action3.setPriorities(
                new DateMap<Decimal>([
                    [new Date(2020, 1, 1), new Decimal(2000)],
                    [new Date(2020, 2, 1), new Decimal(1000)],
                    [new Date(2020, 3, 1), new Decimal(0)],
                ])
            );

            // process #3
            actionTimetable3.process();
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
                    'BizComponent:COMPANY:TS_AMOUNT',
                    new Decimal('54'),
                    new Decimal('54'),
                    new Decimal('162'),
                ],
                [
                    'BizComponent:COMPANY:TS_MONETARY_VALUE',
                    new Decimal('0'),
                    new Decimal('-64'),
                    new Decimal('96'),
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
            ]);
        });
    });
});
