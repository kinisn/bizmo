import {
    AccountHElem,
    AccountHierarchy,
    AccountNames,
} from 'bizmo/core/accounting/AccountNames';
import { JournalEntry } from 'bizmo/core/accounting/JournalEntry';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import i18n from 'i18n/configs';
import { BizDatabase } from '../../db/BizDatabase';
import { BizIOId } from '../single/BizIOs';
import { AccountingComponent } from './AccountingComponent';

describe('AccountingComponent のテスト', () => {
    let timetable: Timetable;
    let db: BizDatabase;
    let hyperMG: HyperParamManager;
    let accounting0: AccountingComponent;
    let accounting1: AccountingComponent;

    beforeEach(() => {
        timetable = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 3,
        });
        db = new BizDatabase();
        hyperMG = new HyperParamManager();
        accounting0 = new AccountingComponent({
            timetable,
            db,
            hyperMG,
            addMiddleGeneral: false,
        });
        accounting1 = new AccountingComponent({
            timetable,
            db,
            hyperMG,
            addMiddleGeneral: true,
            name: '会計',
            bizIOId: 'account_id',
        });
        i18n.changeLanguage('test');
    });

    describe('init', () => {
        test('default with middle general: false', () => {
            expect(accounting0.timetable).toBe(timetable);
            expect(accounting0.db).toBe(db);
            expect(accounting0.id).not.toBeUndefined();
            expect(accounting0.name).toEqual('AccountingComponent');
            expect(accounting0.children.length).toEqual(5);
            expect(accounting0.exportAsTable()).toEqual([
                [
                    'AccountingComponent:資産:流動資産:現金及び預金:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:資産:流動資産:現金及び預金',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:資産:流動資産:売掛金:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:資産:流動資産:売掛金',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:資産:流動資産:たな卸資産:商品及び製品:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:資産:流動資産:たな卸資産:商品及び製品',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:資産:流動資産:たな卸資産:原料及び材料:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:資産:流動資産:たな卸資産:原料及び材料',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:資産:流動資産:たな卸資産:仕掛品及び半成工事:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:資産:流動資産:たな卸資産:仕掛品及び半成工事',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:資産:流動資産:たな卸資産',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:資産:流動資産',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:資産:固定資産:有形固定資産:建物及び附属設備:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:資産:固定資産:有形固定資産:建物及び附属設備',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:資産:固定資産:有形固定資産',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:資産:固定資産:無形固定資産:ソフトウエア:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:資産:固定資産:無形固定資産:ソフトウエア',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:資産:固定資産:無形固定資産:ソフトウエア仮勘定:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:資産:固定資産:無形固定資産:ソフトウエア仮勘定',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:資産:固定資産:無形固定資産',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:資産:固定資産',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:資産:投資その他の資産:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:資産:投資その他の資産',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:資産',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:負債:流動負債:買掛金:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:負債:流動負債:買掛金',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:負債:流動負債:未払金及び未払費用:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:負債:流動負債:未払金及び未払費用',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:負債:流動負債',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:負債:固定負債:社債:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:負債:固定負債:社債',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:負債:固定負債:長期借入金:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:負債:固定負債:長期借入金',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:負債:固定負債',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:負債',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:純資産:株主資本:資本金:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:純資産:株主資本:資本金',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:純資産:株主資本:資本剰余金:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:純資産:株主資本:資本剰余金',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:純資産:株主資本:利益剰余金:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:純資産:株主資本:利益剰余金',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:純資産:株主資本',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:純資産',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:収益:売上高:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:収益:売上高',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:収益:営業外収益:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:収益:営業外収益',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:収益:特別利益:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:収益:特別利益',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:収益',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:売上原価:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:売上原価',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:販売手数料:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:販売手数料',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:広告宣伝費:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:広告宣伝費',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:役員報酬:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:役員報酬',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:給料:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:給料',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:租税公課:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:租税公課',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:減価償却費:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:減価償却費',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:研究開発費:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:研究開発費',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:法定福利費:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:法定福利費',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:支払報酬:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:支払報酬',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:支払手数料:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:支払手数料',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:業務委託費:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:業務委託費',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:地代家賃:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:地代家賃',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:代理店手数料:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:代理店手数料',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:運送費及び保管費:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費:運送費及び保管費',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価:販売費及び一般管理費',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業活動による費用・売上原価',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業外費用:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:営業外費用',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:特別損失:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用:特別損失',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'AccountingComponent:費用',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
            ]);
        });

        test('default with add middle general', () => {
            expect(accounting1.timetable).toBe(timetable);
            expect(accounting1.db).toBe(db);
            expect(accounting1.id).toEqual('account_id');
            expect(accounting1.name).toEqual('会計');
            expect(accounting1.children.length).toEqual(5);
            expect(accounting1.exportAsTable()).toEqual([
                [
                    '会計:資産:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:流動資産:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:流動資産:現金及び預金:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:流動資産:現金及び預金',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:流動資産:売掛金:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:流動資産:売掛金',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:流動資産:たな卸資産:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:流動資産:たな卸資産:商品及び製品:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:流動資産:たな卸資産:商品及び製品',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:流動資産:たな卸資産:原料及び材料:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:流動資産:たな卸資産:原料及び材料',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:流動資産:たな卸資産:仕掛品及び半成工事:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:流動資産:たな卸資産:仕掛品及び半成工事',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:流動資産:たな卸資産',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:流動資産',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:固定資産:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:固定資産:有形固定資産:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:固定資産:有形固定資産:建物及び附属設備:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:固定資産:有形固定資産:建物及び附属設備',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:固定資産:有形固定資産',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:固定資産:無形固定資産:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:固定資産:無形固定資産:ソフトウエア:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:固定資産:無形固定資産:ソフトウエア',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:固定資産:無形固定資産:ソフトウエア仮勘定:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:固定資産:無形固定資産:ソフトウエア仮勘定',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:固定資産:無形固定資産',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:固定資産',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:投資その他の資産:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:資産:投資その他の資産',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                ['会計:資産', new Decimal(0), new Decimal(0), new Decimal(0)],
                [
                    '会計:負債:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:負債:流動負債:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:負債:流動負債:買掛金:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:負債:流動負債:買掛金',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:負債:流動負債:未払金及び未払費用:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:負債:流動負債:未払金及び未払費用',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:負債:流動負債',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:負債:固定負債:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:負債:固定負債:社債:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:負債:固定負債:社債',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:負債:固定負債:長期借入金:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:負債:固定負債:長期借入金',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:負債:固定負債',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                ['会計:負債', new Decimal(0), new Decimal(0), new Decimal(0)],
                [
                    '会計:純資産:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:純資産:株主資本:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:純資産:株主資本:資本金:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:純資産:株主資本:資本金',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:純資産:株主資本:資本剰余金:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:純資産:株主資本:資本剰余金',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:純資産:株主資本:利益剰余金:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:純資産:株主資本:利益剰余金',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:純資産:株主資本',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                ['会計:純資産', new Decimal(0), new Decimal(0), new Decimal(0)],
                [
                    '会計:収益:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:収益:売上高:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:収益:売上高',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:収益:営業外収益:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:収益:営業外収益',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:収益:特別利益:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:収益:特別利益',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                ['会計:収益', new Decimal(0), new Decimal(0), new Decimal(0)],
                [
                    '会計:費用:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:売上原価:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:売上原価',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:販売手数料:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:販売手数料',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:広告宣伝費:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:広告宣伝費',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:役員報酬:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:役員報酬',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:給料:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:給料',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:租税公課:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:租税公課',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:減価償却費:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:減価償却費',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:研究開発費:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:研究開発費',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:法定福利費:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:法定福利費',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:支払報酬:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:支払報酬',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:支払手数料:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:支払手数料',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:業務委託費:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:業務委託費',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:地代家賃:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:地代家賃',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:代理店手数料:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:代理店手数料',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:運送費及び保管費:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費:運送費及び保管費',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価:販売費及び一般管理費',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業活動による費用・売上原価',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業外費用:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:営業外費用',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:特別損失:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '会計:費用:特別損失',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                ['会計:費用', new Decimal(0), new Decimal(0), new Decimal(0)],
            ]);
        });
    });

    describe('props', () => {
        test('BSDebit_Assets', () => {
            expect(accounting0.BSDebit_Assets.exportAsTable()).toEqual([
                [
                    '資産:流動資産:現金及び預金:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '資産:流動資産:現金及び預金',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '資産:流動資産:売掛金:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '資産:流動資産:売掛金',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '資産:流動資産:たな卸資産:商品及び製品:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '資産:流動資産:たな卸資産:商品及び製品',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '資産:流動資産:たな卸資産:原料及び材料:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '資産:流動資産:たな卸資産:原料及び材料',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '資産:流動資産:たな卸資産:仕掛品及び半成工事:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '資産:流動資産:たな卸資産:仕掛品及び半成工事',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '資産:流動資産:たな卸資産',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '資産:流動資産',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '資産:固定資産:有形固定資産:建物及び附属設備:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '資産:固定資産:有形固定資産:建物及び附属設備',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '資産:固定資産:有形固定資産',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '資産:固定資産:無形固定資産:ソフトウエア:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '資産:固定資産:無形固定資産:ソフトウエア',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '資産:固定資産:無形固定資産:ソフトウエア仮勘定:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '資産:固定資産:無形固定資産:ソフトウエア仮勘定',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '資産:固定資産:無形固定資産',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '資産:固定資産',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '資産:投資その他の資産:GENERAL',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    '資産:投資その他の資産',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                ['資産', new Decimal(0), new Decimal(0), new Decimal(0)],
            ]);
        });

        test('BSCredit_Liabilities', () => {
            expect(accounting0.BSCredit_Liabilities.exportAsTable()).toEqual([
                [
                    '負債:流動負債:買掛金:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '負債:流動負債:買掛金',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '負債:流動負債:未払金及び未払費用:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '負債:流動負債:未払金及び未払費用',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '負債:流動負債',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '負債:固定負債:社債:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '負債:固定負債:社債',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '負債:固定負債:長期借入金:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '負債:固定負債:長期借入金',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '負債:固定負債',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                ['負債', new Decimal('0'), new Decimal('0'), new Decimal('0')],
            ]);
        });

        test('BSCredit_NetAssets', () => {
            expect(accounting0.BSCredit_NetAssets.exportAsTable()).toEqual([
                [
                    '純資産:株主資本:資本金:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '純資産:株主資本:資本金',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '純資産:株主資本:資本剰余金:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '純資産:株主資本:資本剰余金',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '純資産:株主資本:利益剰余金:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '純資産:株主資本:利益剰余金',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '純資産:株主資本',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '純資産',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
            ]);
        });

        test('PLDebit_Expenses', () => {
            expect(accounting0.PLDebit_Expenses.exportAsTable()).toEqual([
                [
                    '費用:営業活動による費用・売上原価:売上原価:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:売上原価',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:販売手数料:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:販売手数料',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:広告宣伝費:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:広告宣伝費',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:役員報酬:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:役員報酬',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:給料:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:給料',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:租税公課:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:租税公課',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:減価償却費:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:減価償却費',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:研究開発費:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:研究開発費',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:法定福利費:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:法定福利費',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:支払報酬:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:支払報酬',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:支払手数料:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:支払手数料',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:業務委託費:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:業務委託費',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:地代家賃:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:地代家賃',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:代理店手数料:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:代理店手数料',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:運送費及び保管費:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費:運送費及び保管費',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価:販売費及び一般管理費',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業活動による費用・売上原価',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業外費用:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:営業外費用',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:特別損失:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '費用:特別損失',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                ['費用', new Decimal('0'), new Decimal('0'), new Decimal('0')],
            ]);
        });

        test('PLCredit_Revenue', () => {
            expect(accounting0.PLCredit_Revenue.exportAsTable()).toEqual([
                [
                    '収益:売上高:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '収益:売上高',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '収益:営業外収益:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '収益:営業外収益',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '収益:特別利益:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '収益:特別利益',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                ['収益', new Decimal('0'), new Decimal('0'), new Decimal('0')],
            ]);
        });
    });

    test('selectAccountCategory', () => {
        let passingCount = 0;
        // eslint-disable-next-line require-jsdoc
        function childrenTest(
            elem: AccountHElem,
            passingCount: number
        ): number {
            expect(
                accounting0.selectAccountCategory(elem.key).name
            ).not.toBeUndefined();
            passingCount = passingCount + 1;
            if (elem.children) {
                elem.children.forEach((inElem) => {
                    passingCount = childrenTest(inElem, passingCount);
                });
            }
            return passingCount;
        }
        AccountHierarchy.forEach((elem) => {
            passingCount = childrenTest(elem, passingCount);
        });
        expect(passingCount).toBe(51);
    });

    describe('cashAndDeposits', () => {
        test('指定無し', () => {
            expect(accounting0.cashAndDeposits().name).toEqual('GENERAL');
        });

        test('存在しない名称', () => {
            expect(accounting0.cashAndDeposits('NOT_EXISTED').name).toEqual(
                'GENERAL'
            );
        });

        test('存在する内部AccountedBizIO', () => {
            accounting0
                .selectAccountCategory(AccountNames.BS_CASH_AND_DEPOSITS)
                .addSeedAccountedMonetaryBizIO('TEST_NAME');
            expect(accounting0.cashAndDeposits('TEST_NAME').name).toEqual(
                'TEST_NAME'
            );
        });

        test('存在する内部AccountedCategoryBizIO', () => {
            accounting0
                .selectAccountCategory(AccountNames.BS_CASH_AND_DEPOSITS)
                .addSeedAccountedCategoryBizIO('TEST_NAME2');
            expect(accounting0.cashAndDeposits('TEST_NAME2').name).toEqual(
                'TEST_NAME2'
            );
        });
    });

    describe('journalEntry連携: 中間 general あり', () => {
        test('正常系', () => {
            timetable.currentIndex = 1;
            const BS_CASH_AND_DEPOSITS = accounting1.selectAccountCategory(
                AccountNames.BS_CASH_AND_DEPOSITS
            );
            const BS_LIABILITIES = accounting1.selectAccountCategory(
                AccountNames.BS_LIABILITIES
            );

            JournalEntry.journalEntry(
                timetable,
                db,
                new Map<BizIOId, Decimal>([
                    [BS_CASH_AND_DEPOSITS.general!.id, new Decimal('123')], // テスト定義上、General の存在が明白
                ]),
                new Map<BizIOId, Decimal>([
                    [BS_LIABILITIES.general!.id, new Decimal('123')], // テスト定義上、General の存在が明白
                ])
            );

            BS_CASH_AND_DEPOSITS.prepareAndUpdateFullCollectionsForAllTerms();

            expect(
                accounting1
                    .selectAccountCategory(AccountNames.BS_ASSETS)
                    .exportAsTable({})
            ).toEqual([
                [
                    '資産:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '資産:流動資産:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '資産:流動資産:現金及び預金:GENERAL',
                    new Decimal('0'),
                    new Decimal('123'),
                    new Decimal('123'),
                ],
                [
                    '資産:流動資産:現金及び預金',
                    new Decimal('0'),
                    new Decimal('123'),

                    new Decimal('123'),
                ],
                [
                    '資産:流動資産:売掛金:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '資産:流動資産:売掛金',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '資産:流動資産:たな卸資産:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '資産:流動資産:たな卸資産:商品及び製品:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '資産:流動資産:たな卸資産:商品及び製品',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '資産:流動資産:たな卸資産:原料及び材料:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '資産:流動資産:たな卸資産:原料及び材料',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '資産:流動資産:たな卸資産:仕掛品及び半成工事:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '資産:流動資産:たな卸資産:仕掛品及び半成工事',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '資産:流動資産:たな卸資産',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '資産:流動資産',
                    new Decimal('0'),
                    new Decimal('123'),
                    new Decimal('123'),
                ],
                [
                    '資産:固定資産:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '資産:固定資産:有形固定資産:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '資産:固定資産:有形固定資産:建物及び附属設備:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '資産:固定資産:有形固定資産:建物及び附属設備',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '資産:固定資産:有形固定資産',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '資産:固定資産:無形固定資産:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '資産:固定資産:無形固定資産:ソフトウエア:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '資産:固定資産:無形固定資産:ソフトウエア',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '資産:固定資産:無形固定資産:ソフトウエア仮勘定:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '資産:固定資産:無形固定資産:ソフトウエア仮勘定',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '資産:固定資産:無形固定資産',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '資産:固定資産',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '資産:投資その他の資産:GENERAL',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '資産:投資その他の資産',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    '資産',
                    new Decimal('0'),
                    new Decimal('123'),
                    new Decimal('123'),
                ],
            ]);
        });
    });
});
