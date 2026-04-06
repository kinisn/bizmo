import { AccountNames } from 'bizmo/core/accounting/AccountNames';
import { CohortComponent } from 'bizmo/core/bizIO/component/CohortComponent';
import { AccountedMonetaryBizIO } from 'bizmo/core/bizIO/single/AccountedMonetaryBizIO';
import { BizValue } from 'bizmo/core/bizIO/value/BizValue';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { DecimalBizFuncParserCombinator } from '../DecimalBizFuncParserCombinator';
import { BizFuncParserCombinatorParam } from './BizFuncParserCombinator';
import { BizFuncTokenizer } from './BizFuncTokenizer';

describe('SpecialFunctionTokens のテスト', () => {
    let tokenizer: BizFuncTokenizer;
    let parser: DecimalBizFuncParserCombinator;
    let db: BizDatabase;
    let hyperMG: HyperParamManager;
    let timetable: Timetable;
    let timetable5: Timetable;
    let param1: BizFuncParserCombinatorParam<Decimal>;

    beforeEach(() => {
        tokenizer = new BizFuncTokenizer();
        parser = new DecimalBizFuncParserCombinator();
        db = new BizDatabase();
        hyperMG = new HyperParamManager();
        timetable = new Timetable({
            startDate: new Date(2021, 1, 1),
            length: 3,
        });
        timetable5 = new Timetable({
            startDate: new Date(2021, 1, 1),
            length: 5,
        });

        db.insert(
            new AccountedMonetaryBizIO({
                db: db,
                timetable: timetable,
                bizIOId: 'ID_1',
                accountName: AccountNames.BS_CASH_AND_DEPOSITS,
            })
        );
        db.insert(
            new AccountedMonetaryBizIO({
                db: db,
                timetable: timetable,
                bizIOId: 'ID_2',
                accountName: AccountNames.BS_ACCOUNTS_RECEIVABLE,
            })
        );
        db.insert(
            new AccountedMonetaryBizIO({
                db: db,
                timetable: timetable,
                bizIOId: 'ID_3',
                accountName: AccountNames.PL_REVENUE,
            })
        );
        db.insert(
            new AccountedMonetaryBizIO({
                db: db,
                timetable: timetable,
                bizIOId: 'ID_4',
                accountName: AccountNames.PL_NON_OPERATING_INCOME,
            })
        );

        param1 = {
            bizIOInputs: [
                new Decimal(100),
                new Decimal(200),
                new Decimal(300),
                new Decimal(400),
            ],
            bizIdInputs: ['ID_1', 'ID_2', 'ID_3', 'ID_4'],
            resInputs: [new Decimal(1000), new Decimal(2000)],
            sysInputs: [
                new Decimal(1),
                new Decimal(20210101),
                new Decimal(2021),
                new Decimal(1),
                new Decimal(1),
            ],
            initValues: [new Decimal(10000), new Decimal(20000)],
            hyperParams: [new Decimal(100000), new Decimal(200000)],
            db: db,
            timetable: timetable,
        };
    });

    describe('journal_entry', () => {
        test('common', () => {
            expect(db.selectById('ID_1')?.timetableHistory).toEqual([
                new BizValue(new Date(2021, 1, 1), new Decimal(0)),
                new BizValue(new Date(2021, 2, 1), new Decimal(0)),
                new BizValue(new Date(2021, 3, 1), new Decimal(0)),
            ]);
            expect(db.selectById('ID_2')?.timetableHistory).toEqual([
                new BizValue(new Date(2021, 1, 1), new Decimal(0)),
                new BizValue(new Date(2021, 2, 1), new Decimal(0)),
                new BizValue(new Date(2021, 3, 1), new Decimal(0)),
            ]);
            expect(db.selectById('ID_3')?.timetableHistory).toEqual([
                new BizValue(new Date(2021, 1, 1), new Decimal(0)),
                new BizValue(new Date(2021, 2, 1), new Decimal(0)),
                new BizValue(new Date(2021, 3, 1), new Decimal(0)),
            ]);
            expect(db.selectById('ID_4')?.timetableHistory).toEqual([
                new BizValue(new Date(2021, 1, 1), new Decimal(0)),
                new BizValue(new Date(2021, 2, 1), new Decimal(0)),
                new BizValue(new Date(2021, 3, 1), new Decimal(0)),
            ]);

            // update
            expect(
                parser.calculate(
                    tokenizer.parse(
                        'journal_entry({bizid0: 10, bizid1: 40}, {bizid2: 20, bizid3: 30})'
                    ),
                    param1
                )
            ).toEqual(new Decimal('NaN'));

            expect(db.selectById('ID_1')?.timetableHistory).toEqual([
                new BizValue(new Date(2021, 1, 1), new Decimal(10)),
                new BizValue(new Date(2021, 2, 1), new Decimal(10)),
                new BizValue(new Date(2021, 3, 1), new Decimal(10)),
            ]);
            expect(db.selectById('ID_2')?.timetableHistory).toEqual([
                new BizValue(new Date(2021, 1, 1), new Decimal(40)),
                new BizValue(new Date(2021, 2, 1), new Decimal(40)),
                new BizValue(new Date(2021, 3, 1), new Decimal(40)),
            ]);
            expect(db.selectById('ID_3')?.timetableHistory).toEqual([
                new BizValue(new Date(2021, 1, 1), new Decimal(20)),
                new BizValue(new Date(2021, 2, 1), new Decimal(20)),
                new BizValue(new Date(2021, 3, 1), new Decimal(20)),
            ]);
            expect(db.selectById('ID_4')?.timetableHistory).toEqual([
                new BizValue(new Date(2021, 1, 1), new Decimal(30)),
                new BizValue(new Date(2021, 2, 1), new Decimal(30)),
                new BizValue(new Date(2021, 3, 1), new Decimal(30)),
            ]);
        });
    });

    describe('update_cohort', () => {
        test('common', () => {
            expect(
                parser.calculate(
                    tokenizer.parse('update_cohort(bizid0)'),
                    param1
                )
            ).toEqual(new Decimal('NaN'));
        });

        test('err id not existed', () => {
            expect(
                parser.calculate(
                    tokenizer.parse('update_cohort(bizid9)'),
                    param1
                )
            ).toEqual(new Decimal('NaN'));
        });
    });

    describe('update_cohort ', () => {
        test('構成要因単体ではError', () => {
            expect(parser.calculate(tokenizer.parse('bizid0'), param1)).toEqual(
                new Decimal('NaN')
            );
            expect(
                parser.calculate(tokenizer.parse('{0:0.9, 1:0.8}'), param1)
            ).toEqual(new Decimal('NaN'));
        });

        test('更新', () => {
            const param2: BizFuncParserCombinatorParam<Decimal> = {
                bizIOInputs: [
                    new Decimal(100),
                    new Decimal(200),
                    new Decimal(300),
                    new Decimal(400),
                ],
                bizIdInputs: ['ID_1', 'ID_2', 'ID_3', 'ID_4'],
                resInputs: [new Decimal(1000), new Decimal(2000)],
                sysInputs: [
                    new Decimal(1),
                    new Decimal(20210101),
                    new Decimal(2021),
                    new Decimal(1),
                    new Decimal(1),
                ],
                initValues: [new Decimal(10000), new Decimal(20000)],
                hyperParams: [new Decimal(100000), new Decimal(200000)],
                db: db,
                timetable: timetable5,
            };
            // retention
            timetable5.setIndexToStart();
            const retention5 = new CohortComponent({
                timetable: timetable5,
                db,
                hyperMG,
            });
            retention5.prepareUpdateFullCOllections();

            for (let index = 0; index < timetable5.terms.length; index++) {
                retention5.updateFullCollections();
                retention5.action1st.setValue(
                    timetable5.terms[index],
                    new Decimal(100)
                ); // accumの要素が変更されて、更新によりaccumがかわる
                timetable5.next();
            }
            expect(retention5.exportAsTable()).toEqual([
                [
                    'CohortComponent:ACTION_1ST_AGENT',
                    new Decimal('100'),
                    new Decimal('100'),
                    new Decimal('100'),
                    new Decimal('100'),
                    new Decimal('100'),
                ],
                [
                    'CohortComponent:EXISTED_ACTION_1ST',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:COHORT_RATE_OF_EXISTED_ACTION_1ST',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_UNIT_VALUE_OF_EXISTED_ACTION_1ST',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:INPUT_INDEX_0',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2021-02-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:INPUT_INDEX_1',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2021-03-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:INPUT_INDEX_2',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2021-04-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:INPUT_INDEX_3',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2021-05-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:INPUT_INDEX_4',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2021-06-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:INPUT_INDEX_0',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2021-02-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:INPUT_INDEX_1',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2021-03-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:INPUT_INDEX_2',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2021-04-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:INPUT_INDEX_3',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2021-05-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:INPUT_INDEX_4',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2021-06-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:EXISTED_ACTION_2ND',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:ACTION_1ST_ACCUM',
                    new Decimal('100'),
                    new Decimal('200'),
                    new Decimal('300'),
                    new Decimal('400'),
                    new Decimal('500'),
                ],
                [
                    'CohortComponent:ACTION_2ND:EXISTED_ACTION_2ND',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2021-02-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2021-03-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2021-04-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2021-05-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2021-06-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:ACTION_2ND',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:RATE_1ST_2ND',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_OF_EXISTED_ACTION_1ST',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_OF_1ST_AT_2021-02-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_OF_1ST_AT_2021-03-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_OF_1ST_AT_2021-04-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_OF_1ST_AT_2021-05-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_OF_1ST_AT_2021-06-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
            ]);

            // Cohort更新 1回目
            retention5
                .reactionRateIndex(0)
                ?.setValue(new Date(2021, 1, 1), new Decimal('0.9'));
            retention5
                .reactionRateIndex(1)
                ?.setValue(new Date(2021, 1, 1), new Decimal('0.8'));
            retention5
                .reactionRateIndex(2)
                ?.setValue(new Date(2021, 1, 1), new Decimal('0.7'));
            retention5
                .reactionRateIndex(3)
                ?.setValue(new Date(2021, 1, 1), new Decimal('0.6'));
            retention5
                .reactionRateIndex(4)
                ?.setValue(new Date(2021, 1, 1), new Decimal('0.5'));

            // cohort update
            param2.bizIdInputs.push(retention5.id);
            let funcParser = tokenizer.parse('update_cohort(bizid4)');

            timetable5.setIndexToStart();
            for (let index = 0; index < timetable5.terms.length; index++) {
                parser.calculate(funcParser, param2);
                timetable5.next();
            }
            expect(retention5.exportAsTable()).toEqual([
                [
                    'CohortComponent:ACTION_1ST_AGENT',
                    new Decimal('100'),
                    new Decimal('100'),
                    new Decimal('100'),
                    new Decimal('100'),
                    new Decimal('100'),
                ],
                [
                    'CohortComponent:EXISTED_ACTION_1ST',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:COHORT_RATE_OF_EXISTED_ACTION_1ST',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_UNIT_VALUE_OF_EXISTED_ACTION_1ST',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:INPUT_INDEX_0',
                    new Decimal('0.9'),
                    new Decimal('0.9'),
                    new Decimal('0.9'),
                    new Decimal('0.9'),
                    new Decimal('0.9'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2021-02-01',
                    new Decimal('0.9'),
                    new Decimal('0.8'),
                    new Decimal('0.7'),
                    new Decimal('0.6'),
                    new Decimal('0.5'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:INPUT_INDEX_1',
                    new Decimal('0.8'),
                    new Decimal('0.8'),
                    new Decimal('0.8'),
                    new Decimal('0.8'),
                    new Decimal('0.8'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2021-03-01',
                    new Decimal('0'),
                    new Decimal('0.9'),
                    new Decimal('0.8'),
                    new Decimal('0.7'),
                    new Decimal('0.6'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:INPUT_INDEX_2',
                    new Decimal('0.7'),
                    new Decimal('0.7'),
                    new Decimal('0.7'),
                    new Decimal('0.7'),
                    new Decimal('0.7'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2021-04-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0.9'),
                    new Decimal('0.8'),
                    new Decimal('0.7'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:INPUT_INDEX_3',
                    new Decimal('0.6'),
                    new Decimal('0.6'),
                    new Decimal('0.6'),
                    new Decimal('0.6'),
                    new Decimal('0.6'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2021-05-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0.9'),
                    new Decimal('0.8'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:INPUT_INDEX_4',
                    new Decimal('0.5'),
                    new Decimal('0.5'),
                    new Decimal('0.5'),
                    new Decimal('0.5'),
                    new Decimal('0.5'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2021-06-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0.9'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:INPUT_INDEX_0',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2021-02-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:INPUT_INDEX_1',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2021-03-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:INPUT_INDEX_2',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2021-04-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:INPUT_INDEX_3',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2021-05-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:INPUT_INDEX_4',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2021-06-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:EXISTED_ACTION_2ND',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:ACTION_1ST_ACCUM',
                    new Decimal('100'),
                    new Decimal('200'),
                    new Decimal('300'),
                    new Decimal('400'),
                    new Decimal('500'),
                ],
                [
                    'CohortComponent:ACTION_2ND:EXISTED_ACTION_2ND',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2021-02-01',
                    new Decimal('90.0'),
                    new Decimal('80.0'),
                    new Decimal('70.0'),
                    new Decimal('60.0'),
                    new Decimal('50.0'),
                ],
                [
                    'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2021-03-01',
                    new Decimal('0'),
                    new Decimal('90.0'),
                    new Decimal('80.0'),
                    new Decimal('70.0'),
                    new Decimal('60.0'),
                ],
                [
                    'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2021-04-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('90.0'),
                    new Decimal('80.0'),
                    new Decimal('70.0'),
                ],
                [
                    'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2021-05-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('90.0'),
                    new Decimal('80.0'),
                ],
                [
                    'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2021-06-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('90.0'),
                ],
                [
                    'CohortComponent:ACTION_2ND',
                    new Decimal('90.0'),
                    new Decimal('170.0'),
                    new Decimal('240.0'),
                    new Decimal('300.0'),
                    new Decimal('350.0'),
                ],
                [
                    'CohortComponent:RATE_1ST_2ND',
                    new Decimal('0.9'),
                    new Decimal('0.85'),
                    new Decimal('0.8'),
                    new Decimal('0.75'),
                    new Decimal('0.7'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_OF_EXISTED_ACTION_1ST',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_OF_1ST_AT_2021-02-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_OF_1ST_AT_2021-03-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_OF_1ST_AT_2021-04-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_OF_1ST_AT_2021-05-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_OF_1ST_AT_2021-06-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
            ]);

            // Cohort更新 2回目
            retention5
                .reactionRateIndex(0)
                ?.setValue(new Date(2021, 2, 1), new Decimal('1'));
            retention5
                .reactionRateIndex(1)
                ?.setValue(new Date(2021, 2, 1), new Decimal('1'));
            retention5
                .reactionRateIndex(2)
                ?.setValue(new Date(2021, 2, 1), new Decimal('1'));
            retention5
                .reactionRateIndex(3)
                ?.setValue(new Date(2021, 2, 1), new Decimal('1'));
            retention5
                .reactionRateIndex(4)
                ?.setValue(new Date(2021, 2, 1), new Decimal('1'));

            // cohort update
            funcParser = tokenizer.parse('update_cohort(bizid4)');

            timetable5.setIndexToStart();
            for (let index = 0; index < timetable5.terms.length; index++) {
                parser.calculate(funcParser, param2);
                timetable5.next();
            }
            expect(retention5.exportAsTable()).toEqual([
                [
                    'CohortComponent:ACTION_1ST_AGENT',
                    new Decimal('100'),
                    new Decimal('100'),
                    new Decimal('100'),
                    new Decimal('100'),
                    new Decimal('100'),
                ],
                [
                    'CohortComponent:EXISTED_ACTION_1ST',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:COHORT_RATE_OF_EXISTED_ACTION_1ST',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_UNIT_VALUE_OF_EXISTED_ACTION_1ST',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:INPUT_INDEX_0',
                    new Decimal('0.9'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2021-02-01',
                    new Decimal('0.9'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:INPUT_INDEX_1',
                    new Decimal('0.8'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2021-03-01',
                    new Decimal('0'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:INPUT_INDEX_2',
                    new Decimal('0.7'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2021-04-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:INPUT_INDEX_3',
                    new Decimal('0.6'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2021-05-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('1'),
                    new Decimal('1'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:INPUT_INDEX_4',
                    new Decimal('0.5'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2021-06-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('1'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:INPUT_INDEX_0',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2021-02-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:INPUT_INDEX_1',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2021-03-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:INPUT_INDEX_2',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2021-04-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:INPUT_INDEX_3',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2021-05-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:INPUT_INDEX_4',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2021-06-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:EXISTED_ACTION_2ND',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:ACTION_1ST_ACCUM',
                    new Decimal('100'),
                    new Decimal('200'),
                    new Decimal('300'),
                    new Decimal('400'),
                    new Decimal('500'),
                ],
                [
                    'CohortComponent:ACTION_2ND:EXISTED_ACTION_2ND',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2021-02-01',
                    new Decimal('90.0'),
                    new Decimal('100'),
                    new Decimal('100'),
                    new Decimal('100'),
                    new Decimal('100'),
                ],
                [
                    'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2021-03-01',
                    new Decimal('0'),
                    new Decimal('100'),
                    new Decimal('100'),
                    new Decimal('100'),
                    new Decimal('100'),
                ],
                [
                    'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2021-04-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('100'),
                    new Decimal('100'),
                    new Decimal('100'),
                ],
                [
                    'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2021-05-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('100'),
                    new Decimal('100'),
                ],
                [
                    'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2021-06-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('100'),
                ],
                [
                    'CohortComponent:ACTION_2ND',
                    new Decimal('90.0'),
                    new Decimal('200'),
                    new Decimal('300'),
                    new Decimal('400'),
                    new Decimal('500'),
                ],
                [
                    'CohortComponent:RATE_1ST_2ND',
                    new Decimal('0.9'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_OF_EXISTED_ACTION_1ST',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_OF_1ST_AT_2021-02-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_OF_1ST_AT_2021-03-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_OF_1ST_AT_2021-04-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_OF_1ST_AT_2021-05-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'CohortComponent:MONETARY_VALUE_OF_1ST_AT_2021-06-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
            ]);
        });
    });
});
