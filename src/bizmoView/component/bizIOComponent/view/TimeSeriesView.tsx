import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { BizIO } from 'bizmo/core/bizIO/single/BizIOs';
import { BizIOExtData } from 'bizmoView/common/external/bizIOExtData';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BizIOItemBaseParts } from '../parts/collectionViewer/BizIOParts';

/**
 * 時系列データビュー（推移表）
 *
 * 親子関係をインデント+折りたたみで表現する MFクラウド風の推移表
 */

type TimeSeriesRow = {
    id: string;
    depth: number;
    isCollection: boolean;
    hasValue: boolean;
    systemLabeled: boolean;
    bizIO: BizIO<BizIOExtData, BizComponentGroupType>;
    childIds: string[];
};

function collectTreeRows(
    bizIO: BizIO<BizIOExtData, BizComponentGroupType>,
    depth: number,
    rows: TimeSeriesRow[],
    systemLabeled: boolean,
    visitedIds: Set<string> = new Set()
) {
    if (visitedIds.has(bizIO.id)) return;
    visitedIds.add(bizIO.id);

    const isCollection = bizIO instanceof CollectionBizIO;
    const childIds: string[] = [];
    if (isCollection) {
        for (const { bizIO: child } of (
            bizIO as CollectionBizIO<BizIOExtData, BizComponentGroupType>
        ).exposedChildrenWithSystemLabeledFlag) {
            if (!visitedIds.has(child.id)) {
                childIds.push(child.id);
            }
        }
    }

    rows.push({
        id: bizIO.id,
        depth,
        isCollection,
        hasValue: bizIO.hasOwnValue,
        systemLabeled,
        bizIO,
        childIds,
    });

    if (isCollection) {
        for (const { bizIO: child, systemLabeled: childSL } of (
            bizIO as CollectionBizIO<BizIOExtData, BizComponentGroupType>
        ).exposedChildrenWithSystemLabeledFlag) {
            collectTreeRows(child, depth + 1, rows, childSL, visitedIds);
        }
    }
}

function getDescendantIds(
    rowMap: Map<string, TimeSeriesRow>,
    id: string
): Set<string> {
    const result = new Set<string>();
    const row = rowMap.get(id);
    if (!row) return result;
    for (const childId of row.childIds) {
        result.add(childId);
        for (const descendant of getDescendantIds(rowMap, childId)) {
            result.add(descendant);
        }
    }
    return result;
}

export const TimeSeriesView = (props: {
    targetBizIO: BizIO<BizIOExtData, BizComponentGroupType>;
}) => {
    const { targetBizIO } = props;
    const { t } = useTranslation();
    const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

    const rows: TimeSeriesRow[] = [];
    collectTreeRows(targetBizIO, 0, rows, false);

    const rowMap = new Map<string, TimeSeriesRow>();
    for (const row of rows) {
        rowMap.set(row.id, row);
    }

    // 折りたたまれた親の子孫を非表示にする
    const hiddenIds = new Set<string>();
    for (const collapsedId of collapsedIds) {
        for (const descendant of getDescendantIds(rowMap, collapsedId)) {
            hiddenIds.add(descendant);
        }
    }

    const visibleRows = rows.filter(
        (row) => !hiddenIds.has(row.id) && (row.hasValue || row.isCollection)
    );

    if (visibleRows.length === 0) {
        return (
            <div className="p-4 text-zinc-400">
                {t('common.label.noData') ?? 'データがありません'}
            </div>
        );
    }

    // タームヘッダー
    const sampleRow = rows.find((r) => r.hasValue);
    if (!sampleRow) {
        return (
            <div className="p-4 text-zinc-400">
                {t('common.label.noData') ?? 'データがありません'}
            </div>
        );
    }
    const terms = sampleRow.bizIO.timetableHistory.map((bv) =>
        bv.date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
        })
    );

    const toggleCollapse = (id: string) => {
        setCollapsedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    return (
        <div className="overflow-auto max-h-[70vh]">
            <table className="text-sm border-collapse whitespace-nowrap">
                <thead>
                    <tr className="border-b border-zinc-600">
                        <th className="text-left p-0 sticky left-0 top-0 bg-zinc-800 z-20 min-w-[300px]">
                            <div className="p-2">
                                {t('common.label.name')}
                            </div>
                        </th>
                        {terms.map((term, i) => (
                            <th
                                key={i}
                                className="text-right p-2 sticky top-0 bg-zinc-800 z-10 min-w-[90px]"
                            >
                                {term}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {visibleRows.map((row) => {
                        const isCollapsed = collapsedIds.has(row.id);
                        const hasChildren =
                            row.isCollection && row.childIds.length > 0;
                        const isParent = row.isCollection;

                        return (
                            <tr
                                key={row.id}
                                className={`border-b border-zinc-700 hover:bg-zinc-700 ${
                                    isParent ? 'bg-zinc-800' : ''
                                }`}
                            >
                                <td className={`p-0 sticky left-0 z-10 ${isParent ? 'bg-zinc-800' : 'bg-zinc-900'}`}>
                                    <div
                                        className="flex items-center"
                                        style={{
                                            marginLeft: `${row.depth * 24}px`,
                                        }}
                                    >
                                        {hasChildren ? (
                                            <span
                                                className="cursor-pointer select-none text-zinc-400 hover:text-white inline-flex items-center justify-center w-7 shrink-0"
                                                onClick={() =>
                                                    toggleCollapse(row.id)
                                                }
                                            >
                                                {isCollapsed ? '▶' : '▼'}
                                            </span>
                                        ) : (
                                            <span className="inline-block w-7 shrink-0" />
                                        )}
                                        <BizIOItemBaseParts
                                            bizIO={row.bizIO}
                                            systemLabeled={row.systemLabeled}
                                            nameCss={
                                                isParent
                                                    ? 'text-sm font-bold'
                                                    : 'text-sm'
                                            }
                                        />
                                    </div>
                                </td>
                                {row.hasValue ? (
                                    row.bizIO.timetableHistory.map(
                                        (bv, colIndex) => (
                                            <td
                                                key={colIndex}
                                                className={`p-2 text-right font-mono ${
                                                    isParent
                                                        ? 'font-bold'
                                                        : ''
                                                }`}
                                            >
                                                {row.bizIO.isMonetary
                                                    ? bv.value
                                                          .toNumber()
                                                          .toLocaleString(
                                                              'ja-JP'
                                                          )
                                                    : bv.value.toString()}
                                            </td>
                                        )
                                    )
                                ) : (
                                    <td
                                        colSpan={terms.length}
                                        className="p-2"
                                    />
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
