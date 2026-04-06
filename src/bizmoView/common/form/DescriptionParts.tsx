import { HTMLAttributes, ReactNode } from 'react';

export const DescriptionParts = (
    props: {
        label: ReactNode;
        children?: ReactNode;
        labelStyle?: string;
        bgStyle?: string;
        outerStyle?: string;
    } & HTMLAttributes<HTMLDivElement>
) => {
    const { label, children, labelStyle, bgStyle, outerStyle, ...rest } = props;
    const newLabelStyle =
        'absolute scale-75 -top-3 z-1 origin-[0] px-2 left-1 bg-zinc-900 text-zinc-300 ' +
        (labelStyle ?? '');
    const newBackStyle =
        'block px-2.5 pb-2.5 pt-4 w-full rounded-lg border border-zinc-600 ' +
        (bgStyle ?? '');
    const newOuterStyle = 'relative mt-3 ' + (outerStyle ?? '');
    return (
        <div className={newOuterStyle} {...rest}>
            <div className={newBackStyle}>{children}</div>
            <span className={newLabelStyle}>{label}</span>
        </div>
    );
};
