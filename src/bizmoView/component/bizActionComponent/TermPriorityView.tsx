import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@mui/material';
import { Timetable } from 'bizmo/core/util/Timetable';
import { DescriptionParts } from 'bizmoView/common/form/DescriptionParts';
import Decimal from 'decimal.js';
import { useState } from 'react';

export const TermPriorityView = (props: {
    timetable: Timetable;
    priorities: Decimal[];
    isEditMode?: boolean;
}) => {
    const { timetable, priorities, isEditMode = false } = props;
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');
    const [version, setVersion] = useState(0);

    const handleStartEdit = (index: number) => {
        if (!isEditMode) return;
        setEditingIndex(index);
        setEditValue(
            priorities[index].isNaN() ? '' : priorities[index].toString()
        );
    };

    const handleConfirm = (index: number) => {
        if (editValue.trim() === '') {
            priorities[index] = new Decimal(NaN);
        } else {
            try {
                priorities[index] = new Decimal(editValue.trim());
            } catch {
                // 無効な値は NaN にする
                priorities[index] = new Decimal(NaN);
            }
        }
        setEditingIndex(null);
        setVersion((v) => v + 1);
    };

    void version;

    return (
        <DescriptionParts label="Priorities（空欄 = 非実行、数値が小さいほど先に実行）">
            <div className="overflow-auto">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {timetable.terms.map((term, index) => (
                                <TableCell
                                    key={index}
                                    align="right"
                                    className="even:bg-white/5"
                                    sx={{ minWidth: 90, whiteSpace: 'nowrap' }}
                                >
                                    {term.toLocaleDateString('ja-JP', {
                                        year: 'numeric',
                                        month: '2-digit',
                                    })}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            {priorities.map((priority, index) =>
                                editingIndex === index ? (
                                    <TableCell key={index} align="right">
                                        <input
                                            type="text"
                                            className="w-16 bg-zinc-800 text-white border border-blue-500 rounded px-1 py-0.5 text-sm font-mono text-right"
                                            value={editValue}
                                            onChange={(e) =>
                                                setEditValue(e.target.value)
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter')
                                                    handleConfirm(index);
                                                if (e.key === 'Escape')
                                                    setEditingIndex(null);
                                            }}
                                            onBlur={() =>
                                                handleConfirm(index)
                                            }
                                            autoFocus
                                        />
                                    </TableCell>
                                ) : (
                                    <TableCell
                                        key={index}
                                        align="right"
                                        className={`even:bg-white/10 ${isEditMode ? 'cursor-pointer hover:bg-blue-900/30' : ''}`}
                                        onClick={() =>
                                            handleStartEdit(index)
                                        }
                                    >
                                        {priority.isNaN()
                                            ? isEditMode
                                                ? '—'
                                                : ''
                                            : priority.toString()}
                                    </TableCell>
                                )
                            )}
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </DescriptionParts>
    );
};
