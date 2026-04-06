import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import { BizActors } from './BizActors';

describe('BizActors のテスト', () => {
    let timetable: Timetable;
    let db: BizDatabase<any, BizComponentGroupType>;
    let hyperMG: HyperParamManager;
    let bizActors1: BizActors;
    let bizActors2: BizActors;
    let bizActors3: BizActors;
    let bizActors4: BizActors;
    let bizActors5: BizActors;
    let collection1: CollectionBizIO<any, BizComponentGroupType>;
    let collection2: CollectionBizIO<any, BizComponentGroupType>;
    let collection3: CollectionBizIO<any, BizComponentGroupType>;

    beforeEach(() => {
        timetable = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 3,
        });
        db = new BizDatabase();
        hyperMG = new HyperParamManager();

        // for init

        bizActors1 = new BizActors({
            timetable,
            db,
            hyperMG,
        });

        bizActors2 = new BizActors({
            timetable,
            db,
            hyperMG,
            name: 'BizActors2',
            bizIOId: 'BizActors2_ID',
        });

        // for data
        collection1 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            name: 'Collection1',
            bizIOId: 'Collection1_ID',
        });

        collection2 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            name: 'Collection2',
            bizIOId: 'Collection2_ID',
        });

        collection3 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            name: 'Collection3',
            bizIOId: 'Collection3_ID',
        });

        bizActors3 = new BizActors({
            timetable,
            db,
            hyperMG,
            name: 'BizActors3',
            bizIOId: 'BizActors3_ID',
        });

        bizActors4 = new BizActors({
            timetable,
            db,
            hyperMG,
            name: 'BizActors4',
            bizIOId: 'BizActors4_ID',
        });

        bizActors5 = new BizActors({
            timetable,
            db,
            hyperMG,
            name: 'BizActors5',
            bizIOId: 'BizActors5_ID',
        });

        collection1.appendChild(bizActors3);
        bizActors3.appendChild(collection2);
        collection2.appendChild(bizActors4);
        collection3.appendChild(bizActors4);
        bizActors4.appendChild(bizActors5);
    });

    describe('init', () => {
        test('default', () => {
            expect(bizActors1.timetable).toBe(timetable);
            expect(bizActors1.db).toBe(db);
            expect(bizActors1.id).not.toBeUndefined();
            expect(bizActors1.name).toBe('BizActors');
            expect(bizActors1.exportAsTable()).toEqual([]);
            expect(bizActors1.actorChildren).toEqual([]);
            expect(bizActors1.nonActorChildren).toEqual([]);
            expect(bizActors1.actorParent).toBeUndefined();
            expect(bizActors1.actorAncestors).toEqual([]);
        });

        test('with param', () => {
            expect(bizActors2.timetable).toBe(timetable);
            expect(bizActors2.db).toBe(db);
            expect(bizActors2.id).toBe('BizActors2_ID');
            expect(bizActors2.name).toBe('BizActors2');
            expect(bizActors2.exportAsTable()).toEqual([]);
            expect(bizActors2.actorChildren).toEqual([]);
            expect(bizActors2.nonActorChildren).toEqual([]);
            expect(bizActors2.actorParent).toBeUndefined();
            expect(bizActors2.actorAncestors).toEqual([]);
        });
    });

    describe('actorChildren & nonActorChildren', () => {
        test('bizActors3', () => {
            expect(bizActors3.actorChildren).toEqual([]);
            expect(bizActors3.nonActorChildren).toEqual([collection2]);
            expect(bizActors3.actorParent).toBeUndefined();
            expect(bizActors3.actorAncestors).toEqual([]);
        });
        test('bizActors4', () => {
            expect(bizActors4.actorChildren).toEqual([bizActors5]);
            expect(bizActors4.nonActorChildren).toEqual([]);
            expect(bizActors4.actorParent).toBeUndefined();
            expect(bizActors4.actorAncestors).toEqual([bizActors3]);
        });
        test('bizActors5', () => {
            expect(bizActors5.actorChildren).toEqual([]);
            expect(bizActors5.nonActorChildren).toEqual([]);
            expect(bizActors5.actorParent).toBe(bizActors4);
            expect(bizActors5.actorAncestors).toEqual([bizActors4, bizActors3]);
        });
    });
});
