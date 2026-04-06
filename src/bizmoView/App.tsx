import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useBizmo } from 'globalState/useBizmo';
import { ReactNode, useEffect, useMemo, useRef } from 'react';
import { I18nextProvider } from 'react-i18next';
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
} from 'react-router-dom';
import i18n from '../i18n/configs';
import { BizCanvasPage } from './pages/BizCanvasPage';

const App = () => {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: prefersDarkMode ? 'dark' : 'light',
                },
            }),
        [prefersDarkMode]
    );

    const router = createBrowserRouter(
        createRoutesFromElements(
            <Route errorElement={<div>Error</div>}>
                <Route path="/" element={<BizCanvasPage />}></Route>
            </Route>
        )
    );

    return (
        <PrepareZustand>
            <ThemeProvider theme={theme}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <CssBaseline />
                    <I18nextProvider i18n={i18n}>
                        <RouterProvider router={router} />
                    </I18nextProvider>
                </LocalizationProvider>
            </ThemeProvider>
        </PrepareZustand>
    );
};
export default App;

const PrepareZustand = (props: { children: ReactNode }) => {
    const loadingRef = useRef(false); // simulation の多重loadingの防止
    const bizmo = useBizmo();
    useEffect(() => {
        async function prepare() {
            if (!loadingRef.current && !bizmo.simulator) {
                loadingRef.current = true;
                await bizmo.loadSimulator('BizSimulator');
                loadingRef.current = false;
            }
        }
        prepare();
    }, [bizmo.simulator]);
    return bizmo.simulator ? <div>{props.children}</div> : <div>Loading</div>;
};
