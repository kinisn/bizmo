import {
    BizComponent,
    BizComponentGroupType,
} from 'bizmo/bizComponent/BizComponent';
import { CollaboratorBizActors } from 'bizmo/bizComponent/bizActors/CollaboratorBizActors';
import { AmountBizIO, MonetaryBizIO } from 'bizmo/core/bizIO/single/BizIOs';
import { BizValue } from 'bizmo/core/bizIO/value/BizValue';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { DateMap } from 'bizmo/core/util/DateMap';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import i18n from 'i18n/configs';
import { BizActionType } from '../BizActionType';
import { BizAction } from './BizAction';
import { BizActionBase } from './BizActionBase';
import { BizRelation } from './BizRelation';

describe('BizActionBase のテスト', () => {
    let timetable: Timetable;
    let db: BizDatabase<any, BizComponentGroupType>;
    let hyperMG: HyperParamManager;
    let bizComponent: BizComponent;
    let collab1: CollaboratorBizActors;
    let amount1: AmountBizIO;
    let collaboratorsMonetaryValueIO: MonetaryBizIO;

    // action
    let action1: BizActionBase;
    let action2: BizActionBase;
    let action3: BizActionBase;

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

        // BizComponent name setting
        bizComponent.collaborators.setName('COLLABORATORS');
        bizComponent.company.setName('COMPANY');
        bizComponent.userLifeCycles.setName('USERS');
        //
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

        bizComponent.userLifeCycles.selectUsersLifeCycle()!;
        bizComponent.userLifeCycles.addSeedAmountIO('AMOUNT')!;
        bizComponent.userLifeCycles.addSeedMonetaryIO('MONETARY_VALUE')!;
        bizComponent.company.addSeedAmountIO('AMOUNT')!;
        bizComponent.company.addSeedMonetaryIO('MONETARY_VALUE')!;

        // BizAction
        action1 = new BizAction({ timetable, db, hyperMG });
        const priority2: DateMap<Decimal> = new DateMap<Decimal>();
        priority2.set(new Date(2020, 2, 1), new Decimal(10));
        action2 = new BizAction({
            timetable,
            db,
            hyperMG,
            name: 'ACTION_NAME',
            actionId: 'ACTION_ID',
            actionType: BizActionType.EMPLOYER_HIRING,
            priorityEntity: priority2,
        });
        action3 = new BizAction({
            timetable,
            db,
            hyperMG,
            name: 'ACTION_NAME_3',
            actionId: 'ACTION_ID_3',
        });
        action3.setRelation(
            action3.createSeedRelation('FROM_ID', 'TO_ID', 'RELATION')
        );
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
                'BizComponent:USERS:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'BizComponent:USERS:MONETARY_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
        ]);
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
                new Decimal('NaN'),
                new Decimal('NaN'),
            ]);
        });

        test('with param', () => {
            expect(action2.name).toBe('ACTION_NAME');
            expect(action2.timetable).toBe(timetable);
            expect(action2.db).toBe(db);
            expect(action2.actionId).toBe('ACTION_ID');
            expect(action2.relations.size).toBe(0);
            expect(action2.actionType).toBe(BizActionType.EMPLOYER_HIRING);
            expect(action2.priorities).toEqual([
                new Decimal('NaN'),
                new Decimal(10),
                new Decimal(10),
            ]);
        });
    });

    describe('priority', () => {
        test('set_priority_at', () => {
            action1.setPriorityAt(new Date(2020, 1, 1), new Decimal('NaN'));
            expect(action1.priorities).toEqual([
                new Decimal('NaN'),
                new Decimal('NaN'),
                new Decimal('NaN'),
            ]);

            action1.setPriorityAt(new Date(2020, 2, 1), new Decimal(10));
            expect(action1.priorities).toEqual([
                new Decimal('NaN'),
                new Decimal('10'),
                new Decimal('10'),
            ]);

            action1.setPriorityAt(new Date(2020, 1, 1), new Decimal(20));
            expect(action1.priorities).toEqual([
                new Decimal('20'),
                new Decimal('10'),
                new Decimal('10'),
            ]);

            action1.setPriorityAt(new Date(2020, 2, 1), new Decimal(30));
            expect(action1.priorities).toEqual([
                new Decimal('20'),
                new Decimal('30'),
                new Decimal('30'),
            ]);

            action1.setPriorityAt(new Date(2020, 3, 1), new Decimal(40));
            expect(action1.priorities).toEqual([
                new Decimal('20'),
                new Decimal('30'),
                new Decimal('40'),
            ]);

            action1.setPriorityAt(new Date(2020, 3, 1), new Decimal('NaN'));
            expect(action1.priorities).toEqual([
                new Decimal('20'),
                new Decimal('30'),
                new Decimal('NaN'),
            ]);
        });

        test('set_priorities', () => {
            const map: DateMap<Decimal> = new DateMap<Decimal>();
            map.set(new Date(2020, 2, 1), new Decimal('200'));
            map.set(new Date(2020, 3, 1), new Decimal('NaN'));
            action2.setPriorities(map);

            expect(action2.priorities).toEqual([
                new Decimal('NaN'),
                new Decimal('200'),
                new Decimal('NaN'),
            ]);
        });
    });

    test('timetable_updated', () => {
        action2.setPriorityAt(new Date(2020, 2, 1), new Decimal('200'));
        action2.setPriorityAt(new Date(2020, 3, 1), new Decimal('300'));
        expect(action2.priorities).toEqual([
            new Decimal('NaN'),
            new Decimal('200'),
            new Decimal('300'),
        ]);

        timetable.length = 5;
        expect(action2.priorities).toEqual([
            new Decimal('NaN'),
            new Decimal('200'),
            new Decimal('300'),
            new Decimal('300'),
            new Decimal('300'),
        ]);

        timetable.length = 2;
        expect(action2.priorities).toEqual([
            new Decimal('NaN'),
            new Decimal('200'),
        ]);

        // 過去のものを消さないので残っていれば復活する。これが良い動きかといわれると怪しい。
        timetable.length = 5;
        expect(action2.priorities).toEqual([
            new Decimal('NaN'),
            new Decimal('200'),
            new Decimal('300'),
            new Decimal('300'),
            new Decimal('300'),
        ]);
    });

    test('create_and_set_relation', () => {
        expect(action3.name).toBe('ACTION_NAME_3');
        expect(action3.timetable).toBe(timetable);
        expect(action3.db).toBe(db);
        expect(action3.actionId).toBe('ACTION_ID_3');
        expect(action3.relations).toEqual(
            new Map<string, BizRelation>([
                [
                    'RELATION',
                    new BizRelation({
                        fromBizIOId: 'FROM_ID',
                        toBizIOId: 'TO_ID',
                        relationId: 'RELATION',
                    }),
                ],
            ])
        );
        // 追加
        action3.setRelation(
            action3.createSeedRelation('FROM_ID_2', 'TO_ID_2', 'RELATION_2')
        );
        expect(action3.relations).toEqual(
            new Map<string, BizRelation>([
                [
                    'RELATION',
                    new BizRelation({
                        fromBizIOId: 'FROM_ID',
                        toBizIOId: 'TO_ID',
                        relationId: 'RELATION',
                    }),
                ],
                [
                    'RELATION_2',
                    new BizRelation({
                        fromBizIOId: 'FROM_ID_2',
                        toBizIOId: 'TO_ID_2',
                        relationId: 'RELATION_2',
                    }),
                ],
            ])
        );
    });

    test('get_remove_relation', () => {
        // not exist
        expect(action3.getRelation('NOT_EXIST')).toBeUndefined();

        // exist
        action3.setRelation(
            action3.createSeedRelation('FROM_ID_2', 'TO_ID_2', 'RELATION_2')
        );

        expect(action3.getRelation('RELATION')).toEqual(
            new BizRelation({
                fromBizIOId: 'FROM_ID',
                toBizIOId: 'TO_ID',
                relationId: 'RELATION',
            })
        );

        expect(action3.getRelation('RELATION_2')).toEqual(
            new BizRelation({
                fromBizIOId: 'FROM_ID_2',
                toBizIOId: 'TO_ID_2',
                relationId: 'RELATION_2',
            })
        );
    });
});
