import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { CollaboratorList } from './CollaboratorBizActors';
import { BizComponentGroupType } from '../BizComponent';

describe('BizActionParam のテスト', () => {
    let timetable: Timetable;
    let db: BizDatabase<any, BizComponentGroupType>;
    let hyperMG: HyperParamManager;
    let collab1: CollaboratorList;

    beforeEach(() => {
        timetable = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 3,
        });
        db = new BizDatabase();
        hyperMG = new HyperParamManager();
        collab1 = new CollaboratorList({
            timetable,
            db,
            hyperMG,
            bizIOId: 'collab_list_id',
            name: 'collab_list_name',
        });
    });

    test('init_param', () => {
        expect(collab1.timetable).toBe(timetable);
        expect(collab1.name).toBe('collab_list_name');
        expect(collab1.id).toBe('collab_list_id');
        expect(collab1.children.length).toBe(0);
        expect(collab1.exportAsTable()).toEqual([]);
    });

    test('test_add_seed_collaborator', () => {
        const collabGP = collab1.addSeedCollaborator('販売代理店');
        expect(collabGP?.timetable).toBe(timetable);
        expect(collabGP?.name).toBe('販売代理店');
        expect(collabGP?.children.length).toBe(0);
        expect(collab1.children.length).toBe(1);
        collabGP?.addSeedAmountIO('代理店1');
        collabGP?.addSeedAmountIO('代理店2');

        const collabGP2 = collab1.addSeedCollaborator('仕入先');
        expect(collabGP2?.timetable).toBe(timetable);
        expect(collabGP2?.name).toBe('仕入先');
        expect(collabGP2?.children.length).toBe(0);
        expect(collab1.children.length).toBe(2);
        collabGP2?.addSeedAmountIO('仕入先1');
        collabGP2?.addSeedAmountIO('仕入先2');

        expect(collab1.selectCollaborator('仕入先')?.name).toBe('仕入先');
        expect(collab1.selectCollaborator('NO_NAME')).toBeUndefined();

        expect(collab1.exportAsTable()).toEqual([
            [
                'collab_list_name:販売代理店:代理店1',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'collab_list_name:販売代理店:代理店2',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'collab_list_name:仕入先:仕入先1',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'collab_list_name:仕入先:仕入先2',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
        ]);
    });
});
