import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { BizIO } from 'bizmo/core/bizIO/single/BizIOs';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import i18n from 'i18n/configs';
import { BizActionParam } from './BizActionParam';
import { BizComponent, BizComponentGroupType } from './BizComponent';
import { CollaboratorList } from './bizActors/CollaboratorBizActors';
import { CompanyBizActors } from './bizActors/company/CompanyBizActors';
import { UserLifeCycleList } from './bizActors/user/UserLifeCycleList';

describe('BizComponent のテスト', () => {
    let timetable: Timetable;
    let db: BizDatabase<any, BizComponentGroupType>;
    let hyperMG: HyperParamManager;
    let bizComp1: BizComponent;

    beforeEach(() => {
        i18n.changeLanguage('test');
        timetable = new Timetable({
            startDate: new Date(2021, 1, 1),
            length: 3,
        });
        db = new BizDatabase<any, BizComponentGroupType>();
        hyperMG = new HyperParamManager();
        bizComp1 = new BizComponent({ timetable, db, hyperMG });
    });

    describe('init', () => {
        test('default', () => {
            expect(bizComp1.children.length).toBe(5);
            expect(bizComp1.environment.name).toBe('ENVIRONMENT');
            expect(bizComp1.collaborators.name).toBe('COLLABORATORS');
            expect(bizComp1.company.name).toBe('COMPANY');
            expect(bizComp1.userLifeCycles.name).toBe('USERS');
            expect(bizComp1.bizActionParams.name).toBe('BIZ_ACTION_PARAMS');
        });

        test('with param', () => {
            const bizCompWithInit = new BizComponent({
                timetable,
                db,
                hyperMG,
                initData: new Map<string, BizIO>([
                    [
                        BizComponent.ENVIRONMENT,
                        new CollectionBizIO({
                            timetable,
                            db,
                            hyperMG,
                            name: 'environment',
                            isUserNamed: true,
                        }),
                    ],
                    [
                        BizComponent.COLLABORATORS,
                        new CollaboratorList({
                            timetable,
                            db,
                            hyperMG,
                            name: 'colab',
                            isUserNamed: true,
                        }),
                    ],
                    [
                        BizComponent.COMPANY,
                        new CompanyBizActors({
                            timetable,
                            db,
                            hyperMG,
                            name: 'our_company',
                            isUserNamed: true,
                        }),
                    ],
                    [
                        BizComponent.USERS,
                        new UserLifeCycleList({
                            timetable,
                            db,
                            hyperMG,
                            name: 'users',
                            isUserNamed: true,
                        }),
                    ],
                    [
                        BizComponent.BIZ_ACTION_PARAMS,
                        new BizActionParam({
                            timetable,
                            db,
                            hyperMG,
                            name: 'biz_action_param',
                            isUserNamed: true,
                        }),
                    ],
                ]),
            });

            expect(bizCompWithInit.children.length).toBe(5);
            expect(bizCompWithInit.environment.name).toBe('environment');
            expect(bizCompWithInit.collaborators.name).toBe('colab');
            expect(bizCompWithInit.company.name).toBe('our_company');
            expect(bizCompWithInit.userLifeCycles.name).toBe('users');
            expect(bizCompWithInit.bizActionParams.name).toBe(
                'biz_action_param'
            );

            // change name
            const target = bizCompWithInit.userLifeCycles;
            target.setName('market_2');
            expect(target.name).toBe('market_2');
        });
    });

    describe('setNames', () => {
        test('default name should be changeable', () => {
            expect(bizComp1.name).toBe('BizComponent');
            expect(bizComp1.isUserNamed).toBe(false);
            bizComp1.setName('bizComp1');
            expect(bizComp1.name).toBe('bizComp1');
            expect(bizComp1.isUserNamed).toBe(true);
        });
    });
});
