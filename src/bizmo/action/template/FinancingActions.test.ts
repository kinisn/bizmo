import {
    BizComponent,
    BizComponentGroupType,
} from 'bizmo/bizComponent/BizComponent';
import { AccountNames } from 'bizmo/core/accounting/AccountNames';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { BizActionTimeline } from '../BizActionTimeline';
import { FinancingActions } from './FinancingActions';
import i18n from 'i18n/configs';

describe('FinancingActions', () => {
    let timetable: Timetable;
    let db: BizDatabase<any, BizComponentGroupType>;
    let hyperMG: HyperParamManager;
    let bizComponent: BizComponent;
    let actionTL: BizActionTimeline;
    let financingTemplate: FinancingActions;

    beforeEach(() => {
        i18n.changeLanguage('test');

        timetable = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 3,
        });
        db = new BizDatabase();
        hyperMG = new HyperParamManager();
        bizComponent = new BizComponent({ timetable, db, hyperMG });
        actionTL = new BizActionTimeline({ timetable, db, hyperMG });
        financingTemplate = new FinancingActions({
            timetable,
            db,
            hyperMG,
            bizComponent,
            priorityGenerator: actionTL.priorityGenerator,
        });
    });

    test('createBalanceSheetSetup', () => {
        const action1 = financingTemplate.createBalanceSheetSetup(
            new Map<AccountNames, Decimal>([
                [AccountNames.PL_OPERATING_REVENUE, new Decimal(1234)], // PL account name is not to setup
                [AccountNames.PL_SALARIES, new Decimal(1234)], // PL account name is not to setup
                [AccountNames.BS_CASH_AND_DEPOSITS, new Decimal(1000)],
                [AccountNames.BS_NON_CURRENT_ASSETS, new Decimal(4000)],
                [AccountNames.BS_CURRENT_LIABILITIES, new Decimal(2000)],
                [AccountNames.BS_SHAREHOLDERS_EQUITY, new Decimal(3000)],
            ])
        );
        expect(action1.name).toBe('BalanceSheetSetupBizAction');

        actionTL.setAction(action1);
        actionTL.prepareProcess();
        actionTL.process();

        expect(bizComponent.company.accounting.exportAsTable()).toEqual([
            [
                'ACCOUNTING:資産:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:流動資産:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:流動資産:現金及び預金:GENERAL',
                new Decimal('1000'),
                new Decimal('1000'),
                new Decimal('1000'),
            ],
            [
                'ACCOUNTING:資産:流動資産:現金及び預金',
                new Decimal('1000'),
                new Decimal('1000'),
                new Decimal('1000'),
            ],
            [
                'ACCOUNTING:資産:流動資産:売掛金:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:流動資産:売掛金',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:流動資産:たな卸資産:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:流動資産:たな卸資産:商品及び製品:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:流動資産:たな卸資産:商品及び製品',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:流動資産:たな卸資産:原料及び材料:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:流動資産:たな卸資産:原料及び材料',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:流動資産:たな卸資産:仕掛品及び半成工事:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:流動資産:たな卸資産:仕掛品及び半成工事',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:流動資産:たな卸資産',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:流動資産',
                new Decimal('1000'),
                new Decimal('1000'),
                new Decimal('1000'),
            ],
            [
                'ACCOUNTING:資産:固定資産:GENERAL',
                new Decimal('4000'),
                new Decimal('4000'),
                new Decimal('4000'),
            ],
            [
                'ACCOUNTING:資産:固定資産:有形固定資産:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:固定資産:有形固定資産:建物及び附属設備:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:固定資産:有形固定資産:建物及び附属設備',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:固定資産:有形固定資産',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:固定資産:無形固定資産:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:固定資産:無形固定資産:ソフトウエア:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:固定資産:無形固定資産:ソフトウエア',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:固定資産:無形固定資産:ソフトウエア仮勘定:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:固定資産:無形固定資産:ソフトウエア仮勘定',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:固定資産:無形固定資産',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:固定資産',
                new Decimal('4000'),
                new Decimal('4000'),
                new Decimal('4000'),
            ],
            [
                'ACCOUNTING:資産:投資その他の資産:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:投資その他の資産',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産',
                new Decimal('5000'),
                new Decimal('5000'),
                new Decimal('5000'),
            ],
            [
                'ACCOUNTING:負債:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:負債:流動負債:GENERAL',
                new Decimal('2000'),
                new Decimal('2000'),
                new Decimal('2000'),
            ],
            [
                'ACCOUNTING:負債:流動負債:買掛金:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:負債:流動負債:買掛金',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:負債:流動負債:未払金及び未払費用:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:負債:流動負債:未払金及び未払費用',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:負債:流動負債',
                new Decimal('2000'),
                new Decimal('2000'),
                new Decimal('2000'),
            ],
            [
                'ACCOUNTING:負債:固定負債:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:負債:固定負債:社債:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:負債:固定負債:社債',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:負債:固定負債:長期借入金:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:負債:固定負債:長期借入金',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:負債:固定負債',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:負債',
                new Decimal('2000'),
                new Decimal('2000'),
                new Decimal('2000'),
            ],
            [
                'ACCOUNTING:純資産:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:純資産:株主資本:GENERAL',
                new Decimal('3000'),
                new Decimal('3000'),
                new Decimal('3000'),
            ],
            [
                'ACCOUNTING:純資産:株主資本:資本金:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:純資産:株主資本:資本金',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:純資産:株主資本:資本剰余金:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:純資産:株主資本:資本剰余金',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:純資産:株主資本:利益剰余金:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:純資産:株主資本:利益剰余金',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:純資産:株主資本',
                new Decimal('3000'),
                new Decimal('3000'),
                new Decimal('3000'),
            ],
            [
                'ACCOUNTING:純資産',
                new Decimal('3000'),
                new Decimal('3000'),
                new Decimal('3000'),
            ],
            [
                'ACCOUNTING:収益:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:収益:売上高:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:収益:売上高',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:収益:営業外収益:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:収益:営業外収益',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:収益:特別利益:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:収益:特別利益',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:収益',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:売上原価:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:売上原価',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:販売手数料:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:販売手数料',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:広告宣伝費:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:広告宣伝費',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:役員報酬:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:役員報酬',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:給料:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:給料',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:租税公課:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:租税公課',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:減価償却費:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:減価償却費',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:研究開発費:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:研究開発費',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:法定福利費:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:法定福利費',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:支払報酬:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:支払報酬',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:支払手数料:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:支払手数料',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:業務委託費:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:業務委託費',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:地代家賃:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:地代家賃',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:代理店手数料:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:代理店手数料',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:運送費及び保管費:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:運送費及び保管費',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業外費用:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業外費用',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:特別損失:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:特別損失',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
        ]);
    });
});
