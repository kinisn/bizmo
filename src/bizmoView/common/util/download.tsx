import { Button } from '@mui/material';
import { Table } from 'dexie';

export const JSONDownloadButton = (props: { json: string; label: string }) => {
    const { json, label } = props;
    return (
        <Button
            onClick={() => {
                const blob = new Blob([json], {
                    type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${label}.json`;
                a.click();
            }}
        >
            {label}
        </Button>
    );
};

export const IDBDownloadButton = (props: {
    idb: Table<any, string>;
    label: string;
}) => {
    const { idb, label } = props;
    return (
        <Button
            onClick={() => {
                idb.toArray().then((data) => {
                    const blob = new Blob([JSON.stringify(data)], {
                        type: 'application/json',
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${label}.json`;
                    a.click();
                });
            }}
        >
            {label}
        </Button>
    );
};
