import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { DateMap } from 'bizmo/core/util/DateMap';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { Market } from './Market';
import i18n from 'i18n/configs';
import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';

describe('BizUnit のテスト', () => {
    let timetable: Timetable;
    let timetable12: Timetable;
    let timetable60: Timetable;
    let db: BizDatabase<any, BizComponentGroupType>;

    let hyperMG: HyperParamManager;
    let market0: Market;
    let market1: Market;
    let market2: Market;

    beforeEach(() => {
        i18n.changeLanguage('test');
        timetable = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 3,
        });
        timetable12 = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 12,
        });
        timetable60 = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 60,
        });
        db = new BizDatabase();

        hyperMG = new HyperParamManager();
        market0 = new Market({ timetable, db, hyperMG, name: 'MARKET_NAME_0' });
        market1 = new Market({
            timetable: timetable12,
            db,
            hyperMG,
            name: 'MARKET_NAME_1',
            bizIOId: 'MARKET_ID',
        });
        market2 = new Market({
            timetable: timetable60,
            db,
            hyperMG,
            name: 'MARKET_NAME_2',
        });
    });

    describe('init', () => {
        test('default', () => {
            expect(market0.timetable).toBe(timetable);
            expect(market0.db).toBe(db);
            expect(market0.name).toBe('MARKET_NAME_0');
            expect(market0.id).not.toBeUndefined();
            expect(market0.children.length).toBe(2);

            expect(market0.baseAmount.timetable).toBe(timetable);
            expect(market0.baseAmount.db).toBe(db);
            expect(market0.baseAmount.name).not.toBeUndefined();
            expect(market0.baseAmount.id).not.toBeUndefined();

            expect(market0.growthRate.timetable).toBe(timetable);
            expect(market0.growthRate.db).toBe(db);
            expect(market0.growthRate.name).not.toBeUndefined();
            expect(market0.growthRate.id).not.toBeUndefined();

            expect(market0.exportAsTable()).toEqual([
                [
                    'MARKET_NAME_0:BASE_AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'MARKET_NAME_0:GROWTH_RATE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'MARKET_NAME_0',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
            ]);
        });

        test('with param', () => {
            expect(market1.timetable).toBe(timetable12);
            expect(market1.db).toBe(db);
            expect(market1.name).toBe('MARKET_NAME_1');
            expect(market1.id).toBe('MARKET_ID');
            expect(market1.children.length).toBe(2);

            expect(market1.baseAmount.timetable).toBe(timetable12);
            expect(market1.baseAmount.db).toBe(db);
            expect(market1.baseAmount.name).not.toBeUndefined();
            expect(market1.baseAmount.id).not.toBeUndefined();

            expect(market1.growthRate.timetable).toBe(timetable12);
            expect(market1.growthRate.db).toBe(db);
            expect(market1.growthRate.name).not.toBeUndefined();
            expect(market1.growthRate.id).not.toBeUndefined();

            expect(market1.exportAsTable()).toEqual([
                [
                    'MARKET_NAME_1:BASE_AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'MARKET_NAME_1:GROWTH_RATE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'MARKET_NAME_1',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
            ]);
        });
    });

    describe('setup', () => {
        test('setup_for_simple_base_amount_mode', () => {
            market1.baseAmount.setValue(new Date(2020, 1, 1), new Decimal(10));
            market1.baseAmount.setValue(new Date(2020, 2, 1), new Decimal(20));
            market1.baseAmount.setValue(new Date(2020, 3, 1), new Decimal(30));

            market1.setupForSimpleBaseAmountMode();

            market1.prepareAndUpdateFullCollectionsForAllTerms();
            expect(market1.exportAsTable()).toEqual([
                [
                    'MARKET_NAME_1:BASE_AMOUNT',
                    new Decimal('10'),
                    new Decimal('20'),
                    new Decimal('30'),
                    new Decimal('30'),
                    new Decimal('30'),
                    new Decimal('30'),
                    new Decimal('30'),
                    new Decimal('30'),
                    new Decimal('30'),
                    new Decimal('30'),
                    new Decimal('30'),
                    new Decimal('30'),
                ],
                [
                    'MARKET_NAME_1:GROWTH_RATE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'MARKET_NAME_1',
                    new Decimal('10'),
                    new Decimal('20'),
                    new Decimal('30'),
                    new Decimal('30'),
                    new Decimal('30'),
                    new Decimal('30'),
                    new Decimal('30'),
                    new Decimal('30'),
                    new Decimal('30'),
                    new Decimal('30'),
                    new Decimal('30'),
                    new Decimal('30'),
                ],
            ]);
        });

        test('setup_for_simple_growth_mode', () => {
            const dateMap = new DateMap<Decimal>();
            [
                [new Date(2020, 1, 1), new Decimal('10.0')],
                [new Date(2021, 1, 1), new Decimal('5.0')],
                [new Date(2022, 1, 1), new Decimal('3.0')],
                [new Date(2023, 1, 1), new Decimal('2.0')],
                [new Date(2024, 1, 1), new Decimal('1.0')],
            ].forEach((row) => {
                dateMap.set(row[0] as Date, row[1] as Decimal);
            });
            market2.setupForSimpleGrowthMode(new Decimal(10), dateMap);

            market2.prepareAndUpdateFullCollectionsForAllTerms();
            expect(String(market2.exportAsTable())).toEqual(
                String([
                    [
                        'MARKET_NAME_2:BASE_AMOUNT',
                        new Decimal('12'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'MARKET_NAME_2:GROWTH_RATE',
                        new Decimal('1.2211885503119937638'),
                        new Decimal('1.2211885503119937638'),
                        new Decimal('1.2211885503119937638'),
                        new Decimal('1.2211885503119937638'),
                        new Decimal('1.2211885503119937638'),
                        new Decimal('1.2211885503119937638'),
                        new Decimal('1.2211885503119937638'),
                        new Decimal('1.2211885503119937638'),
                        new Decimal('1.2211885503119937638'),
                        new Decimal('1.2211885503119937638'),
                        new Decimal('1.2211885503119937638'),
                        new Decimal('1.2211885503119937638'),
                        new Decimal('1.1610366723739942519'),
                        new Decimal('1.1610366723739942519'),
                        new Decimal('1.1610366723739942519'),
                        new Decimal('1.1610366723739942519'),
                        new Decimal('1.1610366723739942519'),
                        new Decimal('1.1610366723739942519'),
                        new Decimal('1.1610366723739942519'),
                        new Decimal('1.1610366723739942519'),
                        new Decimal('1.1610366723739942519'),
                        new Decimal('1.1610366723739942519'),
                        new Decimal('1.1610366723739942519'),
                        new Decimal('1.1610366723739942519'),
                        new Decimal('1.1224620483093729814'),
                        new Decimal('1.1224620483093729814'),
                        new Decimal('1.1224620483093729814'),
                        new Decimal('1.1224620483093729814'),
                        new Decimal('1.1224620483093729814'),
                        new Decimal('1.1224620483093729814'),
                        new Decimal('1.1224620483093729814'),
                        new Decimal('1.1224620483093729814'),
                        new Decimal('1.1224620483093729814'),
                        new Decimal('1.1224620483093729814'),
                        new Decimal('1.1224620483093729814'),
                        new Decimal('1.1224620483093729814'),
                        new Decimal('1.0958726911352443802'),
                        new Decimal('1.0958726911352443802'),
                        new Decimal('1.0958726911352443802'),
                        new Decimal('1.0958726911352443802'),
                        new Decimal('1.0958726911352443802'),
                        new Decimal('1.0958726911352443802'),
                        new Decimal('1.0958726911352443802'),
                        new Decimal('1.0958726911352443802'),
                        new Decimal('1.0958726911352443802'),
                        new Decimal('1.0958726911352443802'),
                        new Decimal('1.0958726911352443802'),
                        new Decimal('1.0958726911352443802'),
                        new Decimal('1.0594630943592952646'),
                        new Decimal('1.0594630943592952646'),
                        new Decimal('1.0594630943592952646'),
                        new Decimal('1.0594630943592952646'),
                        new Decimal('1.0594630943592952646'),
                        new Decimal('1.0594630943592952646'),
                        new Decimal('1.0594630943592952646'),
                        new Decimal('1.0594630943592952646'),
                        new Decimal('1.0594630943592952646'),
                        new Decimal('1.0594630943592952646'),
                        new Decimal('1.0594630943592952646'),
                        new Decimal('1.0594630943592952646'),
                    ],
                    [
                        'MARKET_NAME_2',
                        new Decimal('12'),
                        new Decimal('15'),
                        new Decimal('18'),
                        new Decimal('22'),
                        new Decimal('27'),
                        new Decimal('33'),
                        new Decimal('40'),
                        new Decimal('49'),
                        new Decimal('60'),
                        new Decimal('73'),
                        new Decimal('89'),
                        new Decimal('109'),
                        new Decimal('127'),
                        new Decimal('147'),
                        new Decimal('171'),
                        new Decimal('199'),
                        new Decimal('231'),
                        new Decimal('268'),
                        new Decimal('311'),
                        new Decimal('361'),
                        new Decimal('419'),
                        new Decimal('486'),
                        new Decimal('564'),
                        new Decimal('655'),
                        new Decimal('735'),
                        new Decimal('825'),
                        new Decimal('926'),
                        new Decimal('1039'),
                        new Decimal('1166'),
                        new Decimal('1309'),
                        new Decimal('1469'),
                        new Decimal('1649'),
                        new Decimal('1851'),
                        new Decimal('2078'),
                        new Decimal('2332'),
                        new Decimal('2618'),
                        new Decimal('2869'),
                        new Decimal('3144'),
                        new Decimal('3445'),
                        new Decimal('3775'),
                        new Decimal('4137'),
                        new Decimal('4534'),
                        new Decimal('4969'),
                        new Decimal('5445'),
                        new Decimal('5967'),
                        new Decimal('6539'),
                        new Decimal('7166'),
                        new Decimal('7853'),
                        new Decimal('8320'),
                        new Decimal('8815'),
                        new Decimal('9339'),
                        new Decimal('9894'),
                        new Decimal('10482'),
                        new Decimal('11105'),
                        new Decimal('11765'),
                        new Decimal('12465'),
                        new Decimal('13206'),
                        new Decimal('13991'),
                        new Decimal('14823'),
                        new Decimal('15704'),
                    ],
                ])
            );
        });
    });
});
