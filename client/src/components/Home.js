import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import LogoutIcon from '@mui/icons-material/Logout';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';

import { notifyAction, signOutAction } from '../actions/actions';
import { auth } from '../firebaseConfig';
import ChatInterface from './ChatInterface';
import TabsNav from './TabsNav';
import { db } from '../firebaseConfig';

const drawerWidth = 470;

export default function Home({ themeChange, mode }) {
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.auth);
    const [chat, setChat] = useState([]);
    const [senderid, setSenderid] = useState('');
    const [notificationGranted, setNotificationGranted] = useState(
        Notification.permission === 'granted'
    );

    useEffect(() => {
        const unsub2 = onSnapshot(collection(db, 'chats'), (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'modified') {
                    const modifiedData = change.doc.data();
                    const length = modifiedData.messages.length;
                    const newMessage = modifiedData.messages[length - 1];
                    const sid = newMessage.senderid;
                    const senderUsername = newMessage?.senderUsername;
                    if (
                        sid !== currentUser.uid &&
                        chat[1]?.userInfo?.uid !== sid
                    ) {
                        if (notificationGranted) {
                            const audio = new Audio(
                                '/assets/sounds/notification.mp3'
                            );
                            const notification = new Notification('Dev Chat+', {
                                body:
                                    'New message from ' +
                                    (senderUsername ? senderUsername : sid),
                                icon: '/logo192.png',
                                tag: sid,
                            });
                            audio.play();
                            notification.onclick = () => {
                                window.focus();
                            };
                        } else {
                            dispatch(
                                notifyAction(
                                    true,
                                    'info',
                                    'New message from ' +
                                        (senderUsername ? senderUsername : sid)
                                )
                            );
                        }
                        setSenderid(sid);
                    }
                }
            });
        });

        return () => {
            unsub2();
        };
    }, [chat, notificationGranted]);

    const logOut = () => {
        const choice = window.confirm('Please click on OK to Log Out.');
        if (choice) {
            signOut(auth)
                .then(() => {
                    dispatch(signOutAction());
                })
                .catch((error) => {
                    // eslint-disable-next-line no-console
                    console.log(error);
                    dispatch(
                        notifyAction(
                            true,
                            'error',
                            'Log Out action Failed. Please try again'
                        )
                    );
                });
        }
    };

    const handleInstall = () => {
        dispatch(notifyAction(true, 'info', 'Install feature coming soon...'));
    };

    const notificationPrompt = () => {
        Notification.requestPermission().then((result) => {
            if (result === 'granted') {
                setNotificationGranted(true);
                const notification = new Notification('Dev Chat+', {
                    body: 'You will be notified like this when you receive a new message',
                    icon: '/assets/icons/maskable_icon_x48.png',
                });
                const audio = new Audio('/assets/sounds/notification.mp3');
                audio.play();
                notification.onclick = () => {
                    window.focus();
                    audio.pause();
                };
            }
        });
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        borderRight: 'none',
                        overflow: 'hidden',
                    },
                }}
                variant='permanent'
                anchor='left'
            >
                <Box
                    sx={{
                        height: '75px',
                        display: 'flex',
                        alignItems: 'center',
                        pl: 1,
                        ...(mode === 'dark'
                            ? {
                                  backgroundColor: 'info.dark',
                              }
                            : {
                                  backgroundColor: 'primary.main',
                              }),
                        borderRight: '1px solid',
                        borderColor: 'primary.dark',
                    }}
                >
                    <IconButton sx={{ borderRadius: '0' }}>
                        <Avatar
                            sx={{
                                width: 50,
                                height: 50,
                                mr: 2,
                            }}
                            alt={currentUser.username.charAt(0).toUpperCase()}
                            src={currentUser.photoURL}
                        />
                        <Typography sx={{ color: 'whitesmoke' }} variant='h5'>
                            {currentUser.username}
                        </Typography>
                    </IconButton>
                    <Grid pr='10px' container justifyContent='flex-end'>
                        <Tooltip title='Notifications'>
                            <IconButton
                                sx={{ mr: '10px' }}
                                onClick={notificationPrompt}
                            >
                                <NotificationsActiveIcon
                                    sx={{ color: 'whitesmoke' }}
                                />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title='Toggle Theme'>
                            <IconButton
                                onClick={themeChange}
                                sx={{ mr: '10px' }}
                            >
                                {mode === 'dark' ? (
                                    <LightModeIcon />
                                ) : (
                                    <DarkModeIcon
                                        sx={{ color: 'whitesmoke' }}
                                    />
                                )}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title='Install App '>
                            <IconButton
                                onClick={handleInstall}
                                sx={{ mr: '10px' }}
                            >
                                <DownloadIcon sx={{ color: 'whitesmoke' }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title='Logout'>
                            <IconButton onClick={logOut}>
                                <LogoutIcon sx={{ color: 'lightsteelblue' }} />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Box>
                <Box
                    sx={{
                        height: 'calc(100% - 75px)',
                        ...(mode === 'dark'
                            ? {
                                  borderRight:
                                      '1px solid rgba(255, 255, 255, 0.12)',
                              }
                            : {
                                  borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                              }),
                    }}
                >
                    <TabsNav
                        {...{ mode, chat, setChat, senderid, setSenderid }}
                    />
                </Box>
            </Drawer>
            {chat.length === 0 ? (
                <Box
                    sx={{
                        height: '100vh',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor:
                            mode === 'dark' ? '#1f1f1f' : 'whitesmoke',
                    }}
                >
                    <img
                        src={
                            mode === 'dark'
                                ? '/assets/welcome-screen-dark.svg'
                                : '/assets/welcome-screen.svg'
                        }
                        alt='chat'
                        style={{ width: '400px', height: '400px' }}
                    />
                    <Typography
                        sx={{
                            color: mode === 'dark' ? '#0288d1' : '#1976d2',
                            fontFamily: 'Comfortaa',
                            fontWeight: '700',
                            fontSize: '2rem',
                        }}
                    >
                        welcome to dev chat +
                    </Typography>
                </Box>
            ) : (
                <ChatInterface chat={chat} mode={mode} />
            )}
        </Box>
    );
}
