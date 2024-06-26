// React imports
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Routes, Route, useNavigate } from 'react-router-dom';

// Npm libraries
import jwtDecode from 'jwt-decode';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { HMSRoomProvider } from '@100mslive/hms-video-react';

// Actions
import { signInAction } from './actions/actions';

// Custom components
import Home from './components/home/Home';
import LandingPage from './LandingPage';
import Loading from './components/util/Loading';
import ProtectedRoute from './components/util/ProtectedRoute';
import VideoCall from './components/util/VideoCall';
import WorkSpace from './components/workspace/WorkSpace';
import { customGlobalScrollBars } from './components/CustomGlobalCSS';
import Notify from './components/util/Notify';

const App = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const localTheme = window.localStorage.getItem('devcallTheme');

    const [mode, setMode] = useState(localTheme ? localTheme : 'light');

    const darkTheme = createTheme({
        palette: {
            mode: mode,
        },

        typography: {
            fontFamily: "'Open Sans', sans-serif",
        },
    });

    const alwaysDarkTheme = createTheme({
        palette: {
            mode: 'dark',
        },

        typography: {
            fontFamily: "'Open Sans', sans-serif",
        },
    });

    const themeChange = () => {
        const updatedTheme = mode === 'light' ? 'dark' : 'light';
        window.localStorage.setItem('devcallTheme', updatedTheme);
        setMode(updatedTheme);
    };

    useEffect(() => {
        const auth = window.localStorage.getItem('dev');
        if (auth) {
            const { dnd } = JSON.parse(auth);
            const {
                sub: uid,
                email,
                name,
                picture: photoURL,
                iat: signInTime,
            } = jwtDecode(dnd);
            dispatch(signInAction(uid, email, name, photoURL, dnd, signInTime));
            if (window.location.pathname == '/') {
                navigate('/chat');
            } else {
                navigate(window.location.pathname);
            }
        }
    }, []);

    return (
        <ThemeProvider theme={darkTheme}>
            {customGlobalScrollBars(mode)}
            <CssBaseline />
            <Loading />
            <Notify />
            <Routes>
                <Route path='/' element={<LandingPage />} />
                <Route
                    path='/chat'
                    element={
                        <ProtectedRoute>
                            <Home themeChange={themeChange} mode={mode} />
                        </ProtectedRoute>
                    }
                />
                <Route path='/meet/:roomId' element={<VideoCall />} />
                <Route
                    path='/workspace/:workspaceId'
                    element={
                        <HMSRoomProvider>
                            <ThemeProvider theme={alwaysDarkTheme}>
                                <WorkSpace />
                            </ThemeProvider>
                        </HMSRoomProvider>
                    }
                />
            </Routes>
        </ThemeProvider>
    );
};

export default App;
