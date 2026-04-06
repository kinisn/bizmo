import { ReactNode } from 'react';

export type Pattern = 'grid' | 'dot';

export type PatternedBackgroundProps = {
    pattern?: Pattern;
    twBGColor?: string;
    widthHeight?: string;
    children?: ReactNode;
};

export const PatternedBackground = ({
    pattern = 'dot',
    twBGColor = 'bg-zinc-50',
    widthHeight = 'min-h-screen min-w-screen',
    children,
}: PatternedBackgroundProps) => {
    let patternCSS = `inset-0 ${widthHeight} ${twBGColor} `;
    // Hack　Tailwindの制約により、動的にbg-[xxx]のxxxを生成しても反映されない
    switch (pattern) {
        case 'grid':
            patternCSS += `bg-[linear-gradient(to_right,#00000015_1px,transparent_1px),linear-gradient(to_bottom,#00000015_1px,transparent_1px)] `;
            break;
        case 'dot':
            patternCSS += `bg-[radial-gradient(#00000015_2px,transparent_1px)] `;
            break;
    }
    patternCSS += `bg-[size:1.5rem_1.5rem] `;
    return <div className={patternCSS}>{children}</div>;
};
