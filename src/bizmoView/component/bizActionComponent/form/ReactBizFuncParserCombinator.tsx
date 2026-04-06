import { Tooltip } from '@mui/material';
import { BizIOId } from 'bizmo/core/bizIO/single/BizIOs';
import {
    BizFuncParserCombinatorBase,
    BizFuncParserCombinatorParam,
} from 'bizmo/core/bizProcessor/func/parser/core/BizFuncParserCombinator';
import { GSFunctionToken } from 'bizmo/core/bizProcessor/func/parser/core/GSFunctionTokens';
import {
    BizIdDict,
    BizIdDictElem,
    BizIdDictElemId,
    isCohortFucProtocol,
} from 'bizmo/core/bizProcessor/func/parser/core/SpecialFunctionTokens';
import { TokenKind } from 'bizmo/core/bizProcessor/func/parser/core/TokenKind';
import { IconType, MaterialIcon } from 'bizmoView/common/materialIcon';
import { HTMLAttributes, ReactNode } from 'react';
import { Token } from 'typescript-parsec';

export class ReactBizFuncParserCombinator extends BizFuncParserCombinatorBase<ReactNode> {
    // BizFuncParserCombinatorBase
    caseCodeZero(): ReactNode {
        return <FunctionPrimitive value="0" />;
    }

    caseCodeEmpty(): ReactNode {
        return <FunctionPrimitive value="NaN" className="text-xs" />;
    }

    caseCodeDefault(): ReactNode {
        return this.caseCodeEmpty();
    }

    // == BasicArithmeticOpTokensIF ==
    applyNumber(value: Token<TokenKind>): ReactNode {
        return <FunctionPrimitive value={value.text} />;
    }
    applyUnaryPlus(value: [Token<TokenKind>, ReactNode]): ReactNode {
        return value[1]; // 何もしない
    }
    applyUnaryMinus(value: [Token<TokenKind>, ReactNode]): ReactNode {
        return (
            <FunctionPrimitive
                value={
                    <div className="flex items-center justify-center">
                        -{value[1]}
                    </div>
                }
            />
        );
    }
    applyBinaryPlus(
        first: ReactNode,
        second: [Token<TokenKind>, ReactNode]
    ): ReactNode {
        return (
            <FunctionView
                listedClassName=""
                params={[first, <FunctionPrimitive value={'+'} />, second[1]]}
            />
        );
    }
    applyBinaryMinus(
        first: ReactNode,
        second: [Token<TokenKind>, ReactNode]
    ): ReactNode {
        return (
            <FunctionView
                listedClassName=""
                params={[first, <FunctionPrimitive value={'-'} />, second[1]]}
            />
        );
    }
    applyBinaryMultiple(
        first: ReactNode,
        second: [Token<TokenKind>, ReactNode]
    ): ReactNode {
        return (
            <FunctionView
                listedClassName=""
                params={[first, <FunctionPrimitive value={'×'} />, second[1]]}
            />
        );
    }
    applyBinaryDivide(
        first: ReactNode,
        second: [Token<TokenKind>, ReactNode]
    ): ReactNode {
        return (
            <FunctionView
                listedClassName=""
                params={[first, <FunctionPrimitive value={'÷'} />, second[1]]}
            />
        );
    }

    applyParen(value: [{}, ReactNode, {}]): ReactNode {
        return (
            <FunctionView
                listedClassName=""
                params={[
                    <span className="text-3xl">{'('}</span>,
                    value[1],
                    <span className="text-3xl">{')'}</span>,
                ]}
            />
        );
    }

    // == GSFunctionTokensIF ==
    isTruthy(value: ReactNode): boolean {
        return true; // 呼ばれないはず
    }

    // no parameter
    applyNA(value: [Token<TokenKind>, {}, {}]): ReactNode {
        return this.caseCodeEmpty();
    }
    applyPi(value: [Token<TokenKind>, {}, {}]): ReactNode {
        return (
            <FunctionChip
                className="bg-emerald-500"
                value={'π'}
                chipLabel={GSFunctionToken.PI.toString()}
            />
        );
    }
    // single parameter
    applyAbs(value: [Token<TokenKind>, {}, ReactNode, {}]): ReactNode {
        return <FunctionView name="abs" params={[value[2]]} />;
    }
    applyLog10(value: [Token<TokenKind>, {}, ReactNode, {}]): ReactNode {
        return <FunctionView name="log10" params={[value[2]]} />;
    }
    applyLn(value: [Token<TokenKind>, {}, ReactNode, {}]): ReactNode {
        return <FunctionView name="ln" params={[value[2]]} />;
    }
    applySin(value: [Token<TokenKind>, {}, ReactNode, {}]): ReactNode {
        return <FunctionView name="sin" params={[value[2]]} />;
    }
    applyCos(value: [Token<TokenKind>, {}, ReactNode, {}]): ReactNode {
        return <FunctionView name="cos" params={[value[2]]} />;
    }
    applyTan(value: [Token<TokenKind>, {}, ReactNode, {}]): ReactNode {
        return <FunctionView name="tan" params={[value[2]]} />;
    }
    applyRadians(value: [Token<TokenKind>, {}, ReactNode, {}]): ReactNode {
        return <FunctionView name="radians" params={[value[2]]} />;
    }
    applyDegrees(value: [Token<TokenKind>, {}, ReactNode, {}]): ReactNode {
        return <FunctionView name="degrees" params={[value[2]]} />;
    }
    applyExp(value: [Token<TokenKind>, {}, ReactNode, {}]): ReactNode {
        return <FunctionView name="exp" params={[value[2]]} />;
    }
    applyFact(value: [Token<TokenKind>, {}, ReactNode, {}]): ReactNode {
        return <FunctionView name="fact" params={[value[2]]} />;
    }
    applyNot(value: [Token<TokenKind>, {}, ReactNode, {}]): ReactNode {
        return <FunctionView name="not" params={[value[2]]} />;
    }
    // double parameter
    applyPower(
        value: [Token<TokenKind>, {}, ReactNode, {}, ReactNode, {}]
    ): ReactNode {
        return (
            <FunctionView
                name="power"
                params={[value[2], value[4]]}
                inserts={[<div className="mt-4">,</div>]}
            />
        );
    }
    applyLog(
        value: [Token<TokenKind>, {}, ReactNode, {}, ReactNode, {}]
    ): ReactNode {
        return (
            <FunctionView
                name="log"
                params={[value[2], value[4]]}
                inserts={[<div className="mt-4">,</div>]}
            />
        );
    }
    applyMod(
        value: [Token<TokenKind>, {}, ReactNode, {}, ReactNode, {}]
    ): ReactNode {
        return (
            <FunctionView
                name="mod"
                params={[value[2], value[4]]}
                inserts={[<div className="mt-4">,</div>]}
            />
        );
    }
    applyRound(
        value: [Token<TokenKind>, {}, ReactNode, {}, ReactNode, {}]
    ): ReactNode {
        return (
            <FunctionView
                name="round"
                params={[value[2], value[4]]}
                inserts={[<div className="mt-4">,</div>]}
            />
        );
    }
    applyEq(
        value: [Token<TokenKind>, {}, ReactNode, {}, ReactNode, {}]
    ): ReactNode {
        return (
            <TwoParamInsertFunctionView
                name="="
                paramA={value[2]}
                paramB={value[4]}
            />
        );
    }
    applyNe(
        value: [Token<TokenKind>, {}, ReactNode, {}, ReactNode, {}]
    ): ReactNode {
        return (
            <TwoParamInsertFunctionView
                name="≠"
                paramA={value[2]}
                paramB={value[4]}
            />
        );
    }
    applyLt(
        value: [Token<TokenKind>, {}, ReactNode, {}, ReactNode, {}]
    ): ReactNode {
        return (
            <TwoParamInsertFunctionView
                name="<"
                paramA={value[2]}
                paramB={value[4]}
            />
        );
    }
    applyLte(
        value: [Token<TokenKind>, {}, ReactNode, {}, ReactNode, {}]
    ): ReactNode {
        return (
            <TwoParamInsertFunctionView
                name="≦"
                paramA={value[2]}
                paramB={value[4]}
            />
        );
    }
    applyGt(
        value: [Token<TokenKind>, {}, ReactNode, {}, ReactNode, {}]
    ): ReactNode {
        return (
            <TwoParamInsertFunctionView
                name=">"
                paramA={value[2]}
                paramB={value[4]}
            />
        );
    }
    applyGte(
        value: [Token<TokenKind>, {}, ReactNode, {}, ReactNode, {}]
    ): ReactNode {
        return (
            <TwoParamInsertFunctionView
                name="≧"
                paramA={value[2]}
                paramB={value[4]}
            />
        );
    }
    applyAnd(
        value: [Token<TokenKind>, {}, ReactNode, {}, ReactNode, {}]
    ): ReactNode {
        return (
            <TwoParamInsertFunctionView
                name="and"
                paramA={value[2]}
                paramB={value[4]}
            />
        );
    }
    applyOr(
        value: [Token<TokenKind>, {}, ReactNode, {}, ReactNode, {}]
    ): ReactNode {
        return (
            <TwoParamInsertFunctionView
                name="or"
                paramA={value[2]}
                paramB={value[4]}
            />
        );
    }
    applyIfna(
        value: [Token<TokenKind>, {}, ReactNode, {}, ReactNode, {}]
    ): ReactNode {
        return (
            <FunctionView
                name=" "
                params={[value[2], value[4]]}
                inserts={[
                    <span className="min-w-[7rem] w-[7rem]">
                        but if NaN then
                    </span>,
                ]}
            />
        );
    }

    // triple parameter
    applyIf(
        value: [
            Token<TokenKind>,
            {},
            ReactNode,
            {},
            ReactNode,
            {},
            ReactNode,
            {},
        ]
    ): ReactNode {
        return (
            <FunctionView
                name="if"
                params={[value[2], value[4], value[6]]}
                inserts={['then', 'else']}
            />
        );
    }

    // == BizFuncParamTokensIF ==
    applyBizIOValue(
        index: number,
        param?: BizFuncParserCombinatorParam<ReactNode> | undefined
    ): ReactNode {
        return (
            <IndexedItemView
                tipLabel="BizIO Value"
                iconName={IconType.Business}
                indexNumber={index}
                mainColor="bg-emerald-800"
                subColor="bg-emerald-500"
                param={
                    <>{param?.bizIOInputs[index] ?? this.caseCodeDefault()}</>
                }
            />
        );
    }
    applyBizFuncResultValue(
        index: number,
        param?: BizFuncParserCombinatorParam<ReactNode> | undefined
    ): ReactNode {
        return (
            <IndexedItemView
                tipLabel="Function calculated result"
                iconName={IconType.Functions}
                indexNumber={index}
                mainColor="bg-emerald-800"
                subColor="bg-emerald-500"
            />
        );
    }
    applyInitialValue(
        index: number,
        param?: BizFuncParserCombinatorParam<ReactNode> | undefined
    ): ReactNode {
        return (
            <IndexedItemView
                tipLabel="Fixed Values"
                iconName={IconType.Pin}
                indexNumber={index}
                mainColor="bg-emerald-800"
                subColor="bg-emerald-500"
                param={
                    <>{param?.initValues[index] ?? this.caseCodeDefault()}</>
                }
            />
        );
    }
    applyHyperValue(
        index: number,
        param?: BizFuncParserCombinatorParam<ReactNode> | undefined
    ): ReactNode {
        return (
            <IndexedItemView
                tipLabel="Hyper Parameter"
                iconName={IconType.List}
                indexNumber={index}
                mainColor="bg-emerald-800"
                subColor="bg-emerald-500"
                param={
                    <>{param?.hyperParams[index] ?? this.caseCodeDefault()}</>
                }
            />
        );
    }
    applySystemValue(
        index: number,
        param?: BizFuncParserCombinatorParam<ReactNode> | undefined
    ): ReactNode {
        return (
            <IndexedItemView
                tipLabel="System Provided Value"
                iconName={IconType.Widgets}
                indexNumber={index}
                mainColor="bg-emerald-800"
                subColor="bg-emerald-500"
                param={<>{param?.sysInputs[index] ?? this.caseCodeDefault()}</>}
            />
        );
    }

    // == SpecialFunctionTokensIF ==

    parseBizIdDictElem(
        value: [BizIdDictElemId, {}, ReactNode]
    ): BizIdDictElem<ReactNode> {
        return value[0] && value[2] ? [value[0], value[2]] : undefined;
    }

    parseUpdateCohort(
        value: [Token<TokenKind>, {}, BizIOId | undefined, {}],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        param?: BizFuncParserCombinatorParam<ReactNode>
    ): ReactNode {
        const cohort = value[2] ? param?.db.selectById(value[2]) : undefined;
        if (cohort && isCohortFucProtocol(cohort)) {
            return <FunctionView name="cohort" params={[<>{cohort.name}</>]} />;
        } else {
            console.log(`Target bizID[${value[2]}] is not CohortComponent.`);
        }
        return <></>;
    }

    parseJournalEntry(
        value: [
            Token<TokenKind>,
            {},
            BizIdDict<ReactNode>,
            {},
            BizIdDict<ReactNode>,
            {},
        ],
        param?: BizFuncParserCombinatorParam<ReactNode>
    ): ReactNode {
        if (param && value[2] && value[4]) {
            return (
                <FunctionView
                    name="journalEntry"
                    params={[value[2], value[4]]}
                />
            );
        }
        return <></>;
    }
}

// == Util ==

const IndexedItemView = (
    props: {
        tipLabel: string;
        iconName: IconType;
        indexNumber: number;
        mainColor: string;
        subColor: string;
        param?: ReactNode;
    } & HTMLAttributes<HTMLDivElement>
) => {
    const {
        tipLabel,
        iconName,
        indexNumber,
        param,
        mainColor,
        subColor,
        ...rest
    } = props;
    const classNameCommon =
        'flex items-center justify-center min-w-8 min-h-8 overflow-hidden max-w-max';
    let currentClassName = `${classNameCommon} m-0  rounded-full ${mainColor}`;
    let currentListedClassName = `${classNameCommon} m-0 p-1 pr-2 ${subColor}`;

    return (
        <Tooltip title={`${tipLabel} #${indexNumber}`}>
            <div className={currentClassName} {...rest}>
                <div className="ml-2 flex flex-row items-center justify-center">
                    <MaterialIcon codePoint={iconName} className="mr-1" />
                    <span className="mr-2">{`#${indexNumber}`}</span>
                </div>
                {param && <div className={currentListedClassName}>{param}</div>}
            </div>
        </Tooltip>
    );
};

const FunctionView = (
    props: {
        name?: ReactNode;
        listedClassName?: string;
        params: ReactNode[];
        inserts?: ReactNode[];
    } & HTMLAttributes<HTMLDivElement>
) => {
    const { name, params, listedClassName, inserts, ...rest } = props;
    const classNameCommon = 'flex items-center justify-center min-w-8 min-h-8';
    let currentClassName = `${classNameCommon} m-0 ${name ? 'border rounded-full' : ''}`;
    let currentListedClassName =
        listedClassName ??
        `${classNameCommon} m-1 p-1 bg-white/20 border rounded-full`;
    let currentInsertClassName = `flex items-center justify-center`;

    let labelElem: ReactNode = <></>;
    if (name) {
        if (typeof name === 'string') {
            labelElem = <FunctionLabel name={name} />;
        } else {
            labelElem = name;
        }
    }

    const currentParams: ReactNode[] = [];
    let currentIndex = 0;
    params.forEach((param, index) => {
        currentParams.push(
            <div key={currentIndex} className={currentListedClassName}>
                {param}
            </div>
        );
        currentIndex++;
        if (inserts && inserts[index]) {
            currentParams.push(
                <div key={currentIndex} className={currentInsertClassName}>
                    {inserts[index]}
                </div>
            );
            currentIndex++;
        }
    });

    return (
        <div className={currentClassName} {...rest}>
            {labelElem}
            {currentParams.map((param) => param)}
        </div>
    );
};

const TwoParamInsertFunctionView = (
    props: {
        name?: ReactNode;
        listedClassName?: string;
        paramA: ReactNode;
        paramB: ReactNode;
    } & HTMLAttributes<HTMLDivElement>
) => {
    const { name, paramA, paramB, listedClassName, ...rest } = props;
    const classNameCommon = 'flex items-center justify-center min-w-8 min-h-8';
    let currentClassName = `${classNameCommon} m-0 ${name ? 'border rounded-full' : ''}`;
    let currentListedClassName =
        listedClassName ??
        `${classNameCommon} m-1 p-1 bg-white/20 border rounded-full`;

    let labelElem: ReactNode = <></>;
    if (name) {
        if (typeof name === 'string') {
            labelElem = <FunctionLabel name={name} />;
        } else {
            labelElem = name;
        }
    }
    return (
        <div className={currentClassName} {...rest}>
            <div className={currentListedClassName}>{paramA}</div>
            {labelElem}
            <div className={currentListedClassName}>{paramB}</div>
        </div>
    );
};

const FunctionLabel = (
    props: {
        name: ReactNode;
    } & HTMLAttributes<HTMLDivElement>
) => {
    const { name, className, ...rest } = props;
    let currentClassName = `ml-2 mr-1 ${className ?? ''}`;
    return (
        <div className={currentClassName} {...rest}>
            <span>{name}</span>
        </div>
    );
};

const FunctionPrimitive = (
    props: {
        value: ReactNode;
    } & HTMLAttributes<HTMLDivElement>
) => {
    const { value, className, ...rest } = props;
    let currentClassName = `flex items-center justify-center mx-1 ${className ?? ''}`;
    return (
        <div className={currentClassName} {...rest}>
            <span>{value}</span>
        </div>
    );
};

const FunctionChip = (
    props: {
        value: string;
        chipLabel?: string;
    } & HTMLAttributes<HTMLDivElement>
) => {
    const { value, chipLabel, className, ...rest } = props;
    let currentClassName = `flex items-center justify-center min-w-6 min-h-6 rounded-full  ${className ?? ''}`;
    return chipLabel ? (
        <Tooltip title={chipLabel}>
            <div className={currentClassName} {...rest}>
                <span>{value}</span>
            </div>
        </Tooltip>
    ) : (
        <div className={currentClassName} {...rest}>
            <span>{value}</span>
        </div>
    );
};
