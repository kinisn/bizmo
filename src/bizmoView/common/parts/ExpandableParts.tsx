import { Button, Collapse } from '@mui/material';
import { ReactNode, useState } from 'react';
import { IconType, MaterialIcon } from '../materialIcon';

export type ExpandablePartsProps = {
    header: ReactNode;
    bgStyle?: string;
    headerStyle?: string;
    children?: ReactNode;
};
export const ExpandableParts = (props: ExpandablePartsProps) => {
    const {
        header,
        bgStyle = 'bg-black m-4 rounded',
        headerStyle = 'flex items-center p-4',
        children,
    } = props;
    const [open, setOpen] = useState(false);
    const handleOpen = () => {
        setOpen(!open);
    };
    return (
        <div className={bgStyle}>
            <div
                className={`cursor-pointer ${headerStyle}`}
                onClick={handleOpen}
            >
                {header}
                <Button onClick={handleOpen} color="inherit">
                    <MaterialIcon
                        codePoint={
                            open ? IconType.ExpandLess : IconType.ExpandMore
                        }
                    ></MaterialIcon>
                </Button>
            </div>
            <Collapse in={open}>{children}</Collapse>
        </div>
    );
};
