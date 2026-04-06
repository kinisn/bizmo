/**
 * Material Icons (Google Fonts)
 *
 * https://fonts.google.com/icons
 *
 * Using Material Icons with Filled mode
 */

import { Vector2d } from 'konva/lib/types';
import { Group, Text } from 'react-konva';

export const IconType = {
    OneTwoThree: 0xeb8d,
    AccessTime: 0xe192,
    AccessTimeFilled: 0xefd6,
    AccountCircle: 0xe853,
    AccountTree: 0xe97a,
    Add: 0xe145,
    AddCircle: 0xe147,
    AddCircleOutline: 0xe148,
    AddTask: 0xf23a,
    Apartment: 0xea40,
    Apps: 0xe5c3,
    ArrowDropDown: 0xe5c5,
    ArrowDropUp: 0xe5c7,
    ArrowLeft: 0xe5de,
    ArrowRight: 0xe5df,
    AttachMoney: 0xe227,
    Business: 0xe0af,
    Build: 0xe869,
    Block: 0xe14b,
    ChangeCircle: 0xe2e7,
    Cases: 0xe992,
    Calculate: 0xea5f,
    CardGiftCard: 0xe8f6,
    Cancel: 0xe5c9,
    Check: 0xe5ca,
    Close: 0xe5cd,
    CloseFullscreen: 0xf1cf,
    Construction: 0xea3c,
    CreateNewFolder: 0xe2cc,
    Diversity3: 0xf8d9,
    Description: 0xe873,
    DragHandle: 0xe25d,
    DragIndicator: 0xe945,
    Edit: 0xe3c9,
    ExpandLess: 0xe5ce,
    ExpandMore: 0xe5cf,
    Exposure: 0xe3ca,
    Face: 0xe87c,
    FilterAlt: 0xef4f,
    FilterList: 0xe152,
    Folder: 0xe2c7,
    FormatListBulleted: 0xe241,
    Fullscreen: 0xe5d0,
    FullscreenExit: 0xe5d1,
    Functions: 0xe24a,
    Group: 0xe7ef,
    GroupAdd: 0xe7f0,
    History: 0xe889,
    Home: 0xe88a,
    Input: 0xe890,
    InsertDriveFile: 0xe24d,
    Inventory: 0xe179,
    Label: 0xe892,
    Link: 0xe157,
    List: 0xe896,
    Lock: 0xe897,
    LooksOne: 0xe400,
    Memory: 0xe322,
    Mood: 0xe7f2,
    MoreHoriz: 0xe5d3,
    MoreVert: 0xe5d4,
    NewLabel: 0xe609,
    Note: 0xe06f,
    OpenInFull: 0xf1ce,
    Output: 0xebbe,
    Paid: 0xf041,
    PlayArrow: 0xe037,
    Percent: 0xeb58,
    Person: 0xe7fd,
    PersonAdd: 0xe7fe,
    Phone: 0xe0b0,
    Pin: 0xf045,
    Public: 0xe80b,
    QuestionAnswer: 0xe8af,
    Remove: 0xe15b,
    RemoveCircle: 0xe15c,
    Reply: 0xe15e,
    Report: 0xe160,
    Save: 0xe161,
    Search: 0xe8b6,
    Setting: 0xe8b8,
    ShoppingBag: 0xf1cc,
    ShoppingCart: 0xe8cc,
    SmartToy: 0xf06c,
    Star: 0xe838,
    Stars: 0xe8d0,
    SupportAgent: 0xf0e2,
    Trash: 0xe872,
    UnfoldLess: 0xe5d6,
    UnfoldMore: 0xe5d7,
    Update: 0xe923,
    Visibility: 0xe8f4,
    Widgets: 0xe1bd,
    Work: 0xe8f9,
};
export type IconType = (typeof IconType)[keyof typeof IconType];

export type KonvaMaterialIconProps = {
    size?: number;
    x?: number;
    y?: number;
    color?: string;
    scale?: Vector2d;
};
export const MaterialIconDefault: KonvaMaterialIconProps = {
    size: 32,
    x: 0,
    y: 0,
    color: '#000000',
    scale: { x: 1, y: 1 },
};

export type MaterialIconStyle = { [key: string]: string };
export type MaterialIconProps = {
    isShape?: boolean;
    codePoint: number | IconType;
    className?: string;
    style?: MaterialIconStyle;
    konva?: KonvaMaterialIconProps;
} & React.HTMLAttributes<HTMLSpanElement>;

/**
 * MaterialIcon
 *
 * Konvaで出力したい場合には style に font-size を指定すると大きさを変更できる
 * @param props
 * @returns
 */
export const MaterialIcon = (props: MaterialIconProps) => {
    const {
        isShape = false,
        codePoint,
        className,
        style = {},
        konva,
        ...others
    } = props;
    if (isShape) {
        const fontSize = konva?.size ?? MaterialIconDefault.size;
        return (
            <Text
                x={konva?.x ?? MaterialIconDefault.x}
                y={konva?.y ?? MaterialIconDefault.y}
                width={fontSize}
                fontSize={fontSize}
                text={String.fromCodePoint(codePoint)}
                fontFamily="Material Icons"
                fill={konva?.color ?? MaterialIconDefault.color}
                scale={konva?.scale ?? MaterialIconDefault.scale}
            ></Text>
        );
    } else {
        return (
            <span
                className={`material-icons ${className}`}
                style={style}
                {...others}
            >
                {String.fromCodePoint(codePoint)}
            </span>
        );
    }
};

export const StackedMaterialIconKonvaDefault: {
    base: KonvaMaterialIconProps;
    stacked: KonvaMaterialIconProps;
} = {
    base: {
        size: 32, // MaterialIconDefault.size
        color: '#000000',
    },
    stacked: {
        size: 18, // MaterialIconDefault.size! * (9 / 16)
        x: 7 /*
            MaterialIconDefault.size! -
            (MaterialIconDefault.size! * (9 / 16)) / 2
            */,
        y: 9 /*
            (MaterialIconDefault.size! -
            (MaterialIconDefault.size! * (9 / 16)) / 2) + 2
            */,
        color: '#ffffff',
    },
};
export type StackedMaterialIconProps = {
    base: IconType;
    baseStyle?: string;
    stacked: IconType;
    stackedStyle?: string;
    stackedPosition?: string;
    isShape?: boolean;
    konva?: {
        base: KonvaMaterialIconProps;
        stacked: KonvaMaterialIconProps;
    };
};
export const StackedMaterialIcon = (props: StackedMaterialIconProps) => {
    const {
        base: baseIcon,
        stacked: stackedIcon,
        baseStyle = '',
        stackedStyle = 'text-xs',
        stackedPosition = 'left-0 right-0 top-0 bottom-0',
        isShape = false,
        konva,
    } = props;
    if (isShape) {
        return (
            <Group>
                <MaterialIcon
                    codePoint={baseIcon}
                    className={baseStyle}
                    isShape={true}
                    konva={konva?.base ?? StackedMaterialIconKonvaDefault.base}
                />
                <MaterialIcon
                    codePoint={stackedIcon}
                    className={stackedStyle}
                    isShape={true}
                    konva={
                        konva?.stacked ??
                        StackedMaterialIconKonvaDefault.stacked
                    }
                />
            </Group>
        );
    } else {
        return (
            <span className="relative flex">
                <MaterialIcon codePoint={baseIcon} className={baseStyle} />
                <span
                    className={`z-1 absolute align-middle items-center flex flex-wrap flex-row justify-center ${stackedPosition}`}
                >
                    <MaterialIcon
                        codePoint={stackedIcon}
                        className={stackedStyle}
                    />
                </span>
            </span>
        );
    }
};
