import { DateMap } from 'bizmo/core/util/DateMap';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { vi } from 'vitest';
import { BizDatabase } from '../../db/BizDatabase';
import { BizValue } from '../value/BizValue';
import { BizIO, ReadOnlyBizIO } from './BizIOs';

describe('BizIO のテスト', () => {
    let timetable: Timetable;
    let db: BizDatabase;
    let bizIO1: BizIO;
    let bizIO2: BizIO;
    let bizIO3: BizIO;

    beforeEach(() => {
        timetable = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 3,
        });
        db = new BizDatabase();
        bizIO1 = new BizIO({ timetable: timetable, db: db });
        bizIO2 = new BizIO({
            timetable: timetable,
            db: db,
            bizIOId: 'test_id',
            name: 'test_name',
            isUserNamed: true,
        });
        bizIO3 = new BizIO({ timetable: timetable, db: db });
        bizIO3.setHistory([
            new BizValue(new Date(2020, 1, 1), new Decimal('32.10')),
            new BizValue(new Date(2020, 2, 1), new Decimal('432.10')),
            new BizValue(new Date(2020, 3, 1), new Decimal('5432.10')),
        ]);
    });

    describe('init & set_name', () => {
        test('init_default', () => {
            expect(timetable).toBe(bizIO1.timetable);
            expect(bizIO1.id).not.toBeUndefined();
            expect(bizIO1.name).toBe('BizIO');
            expect(bizIO1.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('0')),
                new BizValue(new Date(2020, 3, 1), new Decimal('0')),
            ]);
        });

        test('init_param', () => {
            expect(timetable).toBe(bizIO2.timetable);
            expect(bizIO2.id).toBe('test_id');
            expect(bizIO2.name).toBe('test_name');
            expect(bizIO2.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('0')),
                new BizValue(new Date(2020, 3, 1), new Decimal('0')),
            ]);
        });

        describe('setName', () => {
            test(' isUserNamed: false', () => {
                expect(bizIO1.isUserNamed).toBe(false);
                expect(bizIO1.name).toBe('BizIO');

                bizIO1.setName('New Name', false);
                expect(bizIO1.isUserNamed).toBe(false);
                expect(bizIO1.name).toBe('New Name');

                bizIO1.setName('New Name2');
                expect(bizIO1.isUserNamed).toBe(true);
                expect(bizIO1.name).toBe('New Name2');
            });

            test(' isUserNamed: true', () => {
                expect(bizIO2.isUserNamed).toBe(true);
                expect(bizIO2.name).toBe('test_name');

                bizIO2.setName('New Name', false);
                expect(bizIO2.isUserNamed).toBe(true);
                expect(bizIO2.name).toBe('test_name');

                bizIO2.setName('New Name2');
                expect(bizIO2.isUserNamed).toBe(true);
                expect(bizIO2.name).toBe('New Name2');
            });
        });
    });

    describe('set', () => {
        test('top', () => {
            bizIO1.set(
                new BizValue(new Date(2020, 1, 1), new Decimal('432.10'))
            );
            expect(bizIO1.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('432.10')),
                new BizValue(new Date(2020, 2, 1), new Decimal('432.10')),
                new BizValue(new Date(2020, 3, 1), new Decimal('432.10')),
            ]);
        });

        test('middle', () => {
            bizIO1.set(
                new BizValue(new Date(2020, 2, 1), new Decimal('432.10'))
            );
            expect(bizIO1.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('432.10')),
                new BizValue(new Date(2020, 3, 1), new Decimal('432.10')),
            ]);
        });

        test('end', () => {
            bizIO1.set(
                new BizValue(new Date(2020, 3, 1), new Decimal('432.10'))
            );
            expect(bizIO1.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('0')),
                new BizValue(new Date(2020, 3, 1), new Decimal('432.10')),
            ]);
        });

        test('top & end', () => {
            bizIO1.set(
                new BizValue(new Date(2020, 3, 1), new Decimal('5432.10'))
            );
            bizIO1.set(
                new BizValue(new Date(2020, 1, 1), new Decimal('432.10'))
            );
            expect(bizIO1.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('432.10')),
                new BizValue(new Date(2020, 2, 1), new Decimal('432.10')),
                new BizValue(new Date(2020, 3, 1), new Decimal('5432.10')),
            ]);
        });
    });

    describe('setHistory', () => {
        test('top & end', () => {
            bizIO1.setHistory([
                new BizValue(new Date(2020, 3, 1), new Decimal('5432.10')),
                new BizValue(new Date(2020, 1, 1), new Decimal('432.10')),
            ]);

            expect(bizIO1.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('432.10')),
                new BizValue(new Date(2020, 2, 1), new Decimal('432.10')),
                new BizValue(new Date(2020, 3, 1), new Decimal('5432.10')),
            ]);
        });

        test('empty_list 1', () => {
            bizIO3.setHistory([]);
            expect(bizIO3.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('0')),
                new BizValue(new Date(2020, 3, 1), new Decimal('0')),
            ]);
        });

        test('empty_list 2', () => {
            bizIO3.setHistory();
            expect(bizIO3.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('0')),
                new BizValue(new Date(2020, 3, 1), new Decimal('0')),
            ]);
        });
    });

    describe('setValue', () => {
        test('test_set_value', () => {
            // NaN set
            bizIO1.setValue(new Date(2020, 1, 1));
            let expected = [
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('0')),
                new BizValue(new Date(2020, 3, 1), new Decimal('0')),
            ];
            expect(bizIO1.timetableHistory).toEqual(expected);

            // update
            bizIO1.setValue(new Date(2020, 1, 1), new Decimal('10.2'));
            expected = [
                new BizValue(new Date(2020, 1, 1), new Decimal('10.2')),
                new BizValue(new Date(2020, 2, 1), new Decimal('10.2')),
                new BizValue(new Date(2020, 3, 1), new Decimal('10.2')),
            ];
            expect(bizIO1.timetableHistory).toEqual(expected);
        });
    });

    describe('at', () => {
        test('in timetable date', () => {
            bizIO1.setHistory([
                new BizValue(new Date(2020, 1, 1), new Decimal('32.10')),
                new BizValue(new Date(2020, 2, 1), new Decimal('432.10')),
                new BizValue(new Date(2020, 3, 1), new Decimal('5432.10')),
            ]);
            expect(bizIO1.at(new Date(2020, 1, 1))).toEqual(
                new BizValue(new Date(2020, 1, 1), new Decimal('32.10'))
            );
            expect(bizIO1.at(new Date(2020, 2, 1))).toEqual(
                new BizValue(new Date(2020, 2, 1), new Decimal('432.10'))
            );
            expect(bizIO1.at(new Date(2020, 3, 1))).toEqual(
                new BizValue(new Date(2020, 3, 1), new Decimal('5432.10'))
            );
        });

        test('out of timetable date', () => {
            bizIO1.setHistory([
                new BizValue(new Date(2020, 1, 1), new Decimal('32.10')),
                new BizValue(new Date(2020, 2, 1), new Decimal('432.10')),
                new BizValue(new Date(2020, 3, 1), new Decimal('5432.10')),
            ]);

            // out of table date
            expect(bizIO1.at(new Date(2019, 12, 1))).toBeUndefined();
            expect(bizIO1.at(new Date(2020, 4, 1))).toBeUndefined();

            expect(bizIO1.at(new Date(2020, 2, 1))).toEqual(
                new BizValue(new Date(2020, 2, 1), new Decimal('432.10'))
            );
            expect(bizIO1.at(new Date(2020, 3, 1))).toEqual(
                new BizValue(new Date(2020, 3, 1), new Decimal('5432.10'))
            );

            // use if_none param
            expect(
                bizIO1.at(
                    new Date(2020, 4, 1),
                    new BizValue(new Date(2020, 4, 1), new Decimal('65432.10'))
                )
            ).toEqual(
                new BizValue(new Date(2020, 4, 1), new Decimal('65432.10'))
            );
        });
    });

    describe('at以外', () => {
        test('at_current & started & end', () => {
            bizIO1.setHistory([
                new BizValue(new Date(2020, 1, 1), new Decimal('32.10')),
                new BizValue(new Date(2020, 2, 1), new Decimal('432.10')),
                new BizValue(new Date(2020, 3, 1), new Decimal('5432.10')),
            ]);

            // current_index = 0
            bizIO1.timetable.currentIndex = 0;
            expect(bizIO1.atCurrent()).toEqual(
                new BizValue(new Date(2020, 1, 1), new Decimal('32.10'))
            );
            expect(bizIO1.atTheStart()).toEqual(
                new BizValue(new Date(2020, 1, 1), new Decimal('32.10'))
            );
            expect(bizIO1.atTheEnd()).toEqual(
                new BizValue(new Date(2020, 3, 1), new Decimal('5432.10'))
            );

            // current_index = 1
            bizIO1.timetable.currentIndex = 1;
            expect(bizIO1.atCurrent()).toEqual(
                new BizValue(new Date(2020, 2, 1), new Decimal('432.10'))
            );
            expect(bizIO1.atTheStart()).toEqual(
                new BizValue(new Date(2020, 1, 1), new Decimal('32.10'))
            );
            expect(bizIO1.atTheEnd()).toEqual(
                new BizValue(new Date(2020, 3, 1), new Decimal('5432.10'))
            );

            // current_index = 2
            bizIO1.timetable.currentIndex = 2;
            expect(bizIO1.atCurrent()).toEqual(
                new BizValue(new Date(2020, 3, 1), new Decimal('5432.10'))
            );
            expect(bizIO1.atTheStart()).toEqual(
                new BizValue(new Date(2020, 1, 1), new Decimal('32.10'))
            );
            expect(bizIO1.atTheEnd()).toEqual(
                new BizValue(new Date(2020, 3, 1), new Decimal('5432.10'))
            );
        });

        test('at_terms_ago', () => {
            bizIO1.setHistory([
                new BizValue(new Date(2020, 1, 1), new Decimal('32.10')),
                new BizValue(new Date(2020, 2, 1), new Decimal('432.10')),
                new BizValue(new Date(2020, 3, 1), new Decimal('5432.10')),
            ]);

            // current_index = 2
            bizIO1.timetable.currentIndex = 2;
            expect(bizIO1.atTermsAgo(-1)).toBeUndefined();
            expect(bizIO1.atTermsAgo(0)).toEqual(
                new BizValue(new Date(2020, 3, 1), new Decimal('5432.10'))
            );
            expect(bizIO1.atTermsAgo(1)).toEqual(
                new BizValue(new Date(2020, 2, 1), new Decimal('432.10'))
            );
            expect(bizIO1.atTermsAgo(2)).toEqual(
                new BizValue(new Date(2020, 1, 1), new Decimal('32.10'))
            );
            expect(bizIO1.atTermsAgo(3)).toBeUndefined();
            expect(
                bizIO1.atTermsAgo(
                    3,
                    new BizValue(new Date(2019, 1, 1), new Decimal('32.10'))
                )
            ).toEqual(new BizValue(new Date(2019, 1, 1), new Decimal('32.10')));
        });
    });

    describe('export_as_table', () => {
        test('default', () => {
            const table1 = bizIO3.exportAsTable();
            const expected1 = [
                [
                    'BizIO',
                    new Decimal('32.10'),
                    new Decimal('432.10'),
                    new Decimal('5432.10'),
                ],
            ];
            expect(table1).toEqual(expected1);
        });

        test('param without id', () => {
            const table1 = bizIO3.exportAsTable({
                idCol: false,
                nameCol: false,
                termRow: true,
            });
            const expected1 = [
                [
                    new Date(2020, 1, 1),
                    new Date(2020, 2, 1),
                    new Date(2020, 3, 1),
                ],
                [
                    new Decimal('32.10'),
                    new Decimal('432.10'),
                    new Decimal('5432.10'),
                ],
            ];
            expect(table1).toEqual(expected1);
        });

        test('param without id ', () => {
            const table1 = bizIO3.exportAsTable({
                idCol: false,
                nameCol: false,
                termRow: true,
            });
            const expected1 = [
                [
                    new Date(2020, 1, 1),
                    new Date(2020, 2, 1),
                    new Date(2020, 3, 1),
                ],
                [
                    new Decimal('32.10'),
                    new Decimal('432.10'),
                    new Decimal('5432.10'),
                ],
            ];
            expect(table1).toEqual(expected1);
        });

        test('param_id', () => {
            bizIO1.set(new BizValue(new Date(2020, 1, 1), new Decimal('100')));
            const table1 = bizIO1.exportAsTable({
                idCol: true,
                nameCol: false,
                termRow: true,
            });
            expect(table1[0][0]).toEqual('id');
            expect(table1[1][0]).toEqual(bizIO1.id);
        });
    });

    describe('complementHistory', () => {
        test('complement true', () => {
            timetable.length = 5;
            const historyEntity = new DateMap<BizValue>();
            historyEntity.set(
                new Date(2020, 2, 1),
                new BizValue(new Date(2020, 2, 1), new Decimal(123))
            );
            expect(
                BizIO.complementHistory(timetable, historyEntity, true)
            ).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal(0)),
                new BizValue(new Date(2020, 2, 1), new Decimal(123)),
                new BizValue(new Date(2020, 3, 1), new Decimal(123)),
                new BizValue(new Date(2020, 4, 1), new Decimal(123)),
                new BizValue(new Date(2020, 5, 1), new Decimal(123)),
            ]);
        });

        test('complement true case2', () => {
            timetable.length = 3;
            const historyEntity = new DateMap<BizValue>();
            historyEntity.set(
                new Date(2020, 1, 1),
                new BizValue(new Date(2020, 1, 1), new Decimal(10))
            );
            historyEntity.set(
                new Date(2020, 2, 1),
                new BizValue(new Date(2020, 2, 1), new Decimal(20))
            );
            historyEntity.set(
                new Date(2020, 3, 1),
                new BizValue(new Date(2020, 3, 1), new Decimal(30))
            );

            expect(
                BizIO.complementHistory(timetable, historyEntity, true)
            ).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal(10)),
                new BizValue(new Date(2020, 2, 1), new Decimal(20)),
                new BizValue(new Date(2020, 3, 1), new Decimal(30)),
            ]);
        });
        test('complement false', () => {
            timetable.length = 5;
            const historyEntity = new DateMap<BizValue>();
            historyEntity.set(
                new Date(2020, 2, 1),
                new BizValue(new Date(2020, 2, 1), new Decimal(123))
            );
            expect(
                BizIO.complementHistory(timetable, historyEntity, false)
            ).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal(0)),
                new BizValue(new Date(2020, 2, 1), new Decimal(123)),
                new BizValue(new Date(2020, 3, 1), new Decimal(0)),
                new BizValue(new Date(2020, 4, 1), new Decimal(0)),
                new BizValue(new Date(2020, 5, 1), new Decimal(0)),
            ]);
        });
    });

    describe('ReadOnlyBizIO', () => {
        test('初期値で書き込みできない', () => {
            const readonlyBizIO = new ReadOnlyBizIO({ timetable, db });
            // set: NG
            const logSpy1 = vi.spyOn(console, 'log');
            readonlyBizIO.set(
                new BizValue(new Date(2020, 1, 1), new Decimal(1))
            );
            expect(logSpy1).toHaveBeenCalledWith(
                'Not allowed to set function in [name:ReadOnlyBizIO, editable:false]'
            );

            // setHistory: NG
            const logSpy2 = vi.spyOn(console, 'log');
            readonlyBizIO.setHistory([
                new BizValue(new Date(2020, 1, 1), new Decimal(1)),
            ]);
            expect(logSpy2).toHaveBeenCalledWith(
                'Not supported set_history function in [name:ReadOnlyBizIO, editable:false]'
            );

            // setValue: NG
            const logSpy3 = vi.spyOn(console, 'log');
            readonlyBizIO.setValue(new Date(2020, 1, 1), new Decimal(1));
            expect(logSpy3).toHaveBeenCalledWith(
                'Not allowed to set function in [name:ReadOnlyBizIO, editable:false]'
            );
        });

        test('設定変更して利用できる', () => {
            // 設定可能に
            const readonlyBizIO = new ReadOnlyBizIO({ timetable, db });
            readonlyBizIO.setEditable(true);
            readonlyBizIO.set(
                new BizValue(new Date(2020, 1, 1), new Decimal(1))
            );
            expect(readonlyBizIO.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal(1)),
                new BizValue(new Date(2020, 2, 1), new Decimal(1)),
                new BizValue(new Date(2020, 3, 1), new Decimal(1)),
            ]);

            // 設定NGに
            readonlyBizIO.setEditable(false);
            // set: NG
            const logSpy1 = vi.spyOn(console, 'log');
            readonlyBizIO.set(
                new BizValue(new Date(2020, 1, 1), new Decimal(10))
            );
            expect(logSpy1).toHaveBeenCalledWith(
                'Not allowed to set function in [name:ReadOnlyBizIO, editable:false]'
            );
            expect(readonlyBizIO.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal(1)),
                new BizValue(new Date(2020, 2, 1), new Decimal(1)),
                new BizValue(new Date(2020, 3, 1), new Decimal(1)),
            ]);
        });
    });
});
