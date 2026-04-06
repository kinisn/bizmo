/**
 * BizFuncParserで管理する全てのToken文字列
 * 新しいTokenを解析する場合には、必要に応じてここに追加する必要がある
 */
export const TokenKind = {
    // BasicArithmeticOpTokens
    Space: 'Space',
    LParen: 'LParen',
    RParen: 'RParen',
    Comma: 'Comma',
    Number: 'Number',
    Add: 'Add',
    Sub: 'Sub',
    Mul: 'Mul',
    Div: 'Div',
    // GSFunctionTokens
    GSFunc0: 'GSFunc0',
    GSFunc1: 'GSFunc1',
    GSFunc2: 'GSFunc2',
    GSFunc3: 'GSFunc3',
    // BizFuncParamTokens
    BizIO: 'BizIO',
    Res: 'Res',
    Init: 'Init',
    Hyper: 'Hyper',
    Sys: 'Sys',
    // SpecialFunctionTokens
    LBrace: 'LBrace',
    RBrace: 'RBrace',
    Colon: 'Colon',
    BizId: 'BizId',
    IDDict: 'IDDict',
    SPUpdateCohort: 'SPUpdateCohort',
    SPJournalEntry: 'SPJournalEntry',
} as const;
export type TokenKind = typeof TokenKind[keyof typeof TokenKind];
