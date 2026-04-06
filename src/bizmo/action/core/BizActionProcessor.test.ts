import {
    BizComponent,
    BizComponentGroupType,
} from 'bizmo/bizComponent/BizComponent';
import { BizActors } from 'bizmo/bizComponent/bizActors/BizActors';
import { CollaboratorBizActors } from 'bizmo/bizComponent/bizActors/CollaboratorBizActors';
import { UserLifeCycleBizActors } from 'bizmo/bizComponent/bizActors/user/UserLifeCycleBizActors';
import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { AmountBizIO, MonetaryBizIO } from 'bizmo/core/bizIO/single/BizIOs';
import { BizValue } from 'bizmo/core/bizIO/value/BizValue';
import { BizFunction } from 'bizmo/core/bizProcessor/func/BizFunction';
import { BizIOConf } from 'bizmo/core/bizProcessor/func/input/BizIOConf';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { BizActionProcessor } from './BizActionProcessor';

describe('BizActionProcessor のテスト', () => {
    let timetable: Timetable;
    let db: BizDatabase<any, BizComponentGroupType>;
    let hyperMG: HyperParamManager;
    let processor1: BizActionProcessor;
    let processor2: BizActionProcessor;
    let bizComponent: BizComponent;
    let collab1: CollaboratorBizActors;
    let amount1: AmountBizIO;
    let collaboratorsMonetaryValueIO: MonetaryBizIO;
    let users: UserLifeCycleBizActors;
    let companyMonetaryValueIO: MonetaryBizIO;
    let func1: BizFunction;
    let func2: BizFunction;
    let func3: BizFunction;

    beforeEach(() => {
        timetable = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 3,
        });
        timetable.currentIndex = 1;
        db = new BizDatabase();
        hyperMG = new HyperParamManager();

        // BizComponent
        bizComponent = new BizComponent({ timetable, db, hyperMG });
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
        bizComponent.userLifeCycles.addSeedAmountIO('AMOUNT')!;
        bizComponent.userLifeCycles.addSeedMonetaryIO('MONETARY_VALUE')!;
        bizComponent.company.addSeedAmountIO('AMOUNT')!;
        companyMonetaryValueIO =
            bizComponent.company.addSeedMonetaryIO('MONETARY_VALUE')!;

        // BizActionProcessor
        processor1 = new BizActionProcessor({ timetable, db, hyperMG });
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

        processor2 = new BizActionProcessor({
            timetable,
            db,
            hyperMG,
            orderedFunctions: [func1, func2, func3],
        });
    });

    describe('validate_biz_function_io_conf', () => {
        test('in db', () => {
            expect(
                processor1.validateBizFunction(
                    new BizFunction({
                        funcId: 'func_id',
                        code: 'bizio0 * bizio1',
                        orderedBizIOConf: [
                            new BizIOConf(amount1.id, 0),
                            new BizIOConf(collaboratorsMonetaryValueIO.id, 1),
                        ],
                    })
                )
            ).toBeTruthy();
        });

        test('not in db', () => {
            expect(
                processor1.validateBizFunction(
                    new BizFunction({
                        funcId: 'func_id',
                        code: 'bizio0 * bizio1',
                        orderedBizIOConf: [
                            new BizIOConf(amount1.id, 0),
                            new BizIOConf('NOT_EXISTED_ID', 0),
                        ],
                    })
                )
            ).toBeFalsy();
        });
    });

    describe('validate_biz_function_io_conf ', () => {
        test('validate_proc_output', () => {
            const childBizIO = new CollectionBizIO({
                timetable,
                db,
                hyperMG,
            });
            const grandchildBizIO = new AmountBizIO({ timetable, db });
            const grandchildNonEditableBizIO = new CollectionBizIO({
                timetable,
                db,
                hyperMG,
            });
            childBizIO.appendChild(grandchildBizIO);
            childBizIO.appendChild(grandchildNonEditableBizIO);
            users.appendChild(childBizIO);

            const actor = new BizActors({ timetable, db, hyperMG });
            const actorsChildIO = new AmountBizIO({ timetable, db });
            actor.appendChild(actorsChildIO);
            users.appendChild(actor);

            // ## Target Check（Actor：OK）
            // # 不存在ID
            expect(
                processor2.validateProcOutput('NO_ID', bizComponent.company.id)
            ).toBeFalsy();
            expect(
                processor2.validateProcOutput(bizComponent.company.id, 'NO_ID')
            ).toBeFalsy();

            // actor 子 & Editable
            expect(
                processor2.validateProcOutput(
                    bizComponent.company.id,
                    companyMonetaryValueIO.id
                )
            ).toBeTruthy();

            // actor 子 & NOT Editable
            expect(
                processor2.validateProcOutput(
                    bizComponent.company.id,
                    bizComponent.company.staffs.id
                )
            ).toBeFalsy();

            expect(
                processor2.validateProcOutput(users.id, childBizIO.id)
            ).toBeFalsy();

            // actor 孫 & Editable
            expect(
                processor2.validateProcOutput(users.id, grandchildBizIO.id)
            ).toBeTruthy();
            expect(
                processor2.validateProcOutput(
                    users.id,
                    grandchildNonEditableBizIO.id
                )
            ).toBeFalsy();

            // actor Actor
            expect(
                processor2.validateProcOutput(users.id, actor.id)
            ).toBeFalsy();

            // actor Actorの子 & Editable
            expect(
                processor2.validateProcOutput(actor.id, actorsChildIO.id)
            ).toBeTruthy();

            // actor Actorの孫 & Editable
            // 子要素BizActorの中にあるリソースもアプローチできる
            expect(
                processor2.validateProcOutput(users.id, actorsChildIO.id)
            ).toBeTruthy();

            // ## Actor check
            // Parent is not Actor
            expect(
                processor2.validateProcOutput(
                    bizComponent.id,
                    bizComponent.company.id
                )
            ).toBeFalsy();
        });
    });
});
