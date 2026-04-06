/**
 * 事業活動のタイプ
 */
export const BizActionType = {
    // 汎用： 「未定義」の事業活動や、大きすぎる活動範囲にまたがる事業活動。 原則として利用すべきではない
    GENERAL: 'GENERAL',

    // 人事管理： 入社・退社や社内昇給など、Staffの雇用条件や、役職・人数に関わるもの
    STAFF_MOVING: 'STAFF_MOVING', // スタッフの異動は 従業員 <-> 役員 もありえる
    EMPLOYEE_EXISTED: 'EMPLOYEE_EXISTED',
    EMPLOYEE_HIRING: 'EMPLOYEE_HIRING',
    EMPLOYEE_RETIREMENT: 'EMPLOYEE_RETIREMENT',
    EMPLOYER_EXISTED: 'EMPLOYER_EXISTED',
    EMPLOYER_HIRING: 'EMPLOYER_HIRING',
    EMPLOYER_RETIREMENT: 'EMPLOYER_RETIREMENT',

    // スタッフ給与支払： スタッフの給与支払いに関するもの
    STAFF_REWARD_PAYMENT: 'STAFF_REWARD_PAYMENT',
};
export type BizActionType = typeof BizActionType[keyof typeof BizActionType];
