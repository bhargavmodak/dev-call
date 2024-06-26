import React, { useState, useEffect } from 'react';
import {
    collection,
    getDocs,
    query,
    where,
    getDoc,
    doc,
    setDoc,
    serverTimestamp,
    onSnapshot,
    updateDoc
} from 'firebase/firestore';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import List from '@mui/material/List';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import ChatIcon from '@mui/icons-material/Chat';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { useDispatch, useSelector } from 'react-redux';

import { db } from '../../firebaseConfig';
import {
    notifyAction,
    startLoadingAction,
    stopLoadingAction,
} from '../../actions/actions';

const imageRegex =
    /(https:\/\/)([^\s(["<,>/]*)(\/)[^\s[",><]*(.png|.jpg|.jpeg|.gif)(\?[^\s[",><]*)?/gi;

function TabPanel(props) {
    const {
        chat,
        item,
        value,
        index,
        empty,
        loading,
        mode,
        handleSelect,
        search,
        setChat,
        senderid,
        setSenderid,
        ...other
    } = props;

    return (
        <div
            role='tabpanel'
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && !empty && !loading && !search && (
                <Box sx={{ py: 0.5, px: 1, borderRadius: '50px' }}>
                    <ListItem
                        onClick={() => {
                            setChat(item);
                            if (item[1].userInfo.uid === senderid) {
                                setSenderid('');
                            }
                        }}
                        sx={{
                            p: 0,
                            backgroundColor: mode === 'light' ? '#F2F2F2' : '#2f3136',
                            borderRadius: '50px',
                        }}
                    >
                        <ListItemButton sx={{ px: 1, height: '60px', borderRadius: '50px' }}>
                            <Avatar
                                alt={item[1].userInfo.username
                                    .charAt(0)
                                    .toUpperCase()}
                                src={item[1].userInfo.photoURL}
                                sx={{ width: 50, height: 50, mr: 2 }}
                            />
                            <Box
                                sx={{
                                    display: 'block',
                                }}
                            >
                                <Typography sx={{ fontSize: '18px' }}>
                                    {item[1].userInfo.name}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: '14px',
                                        color: mode === 'light' ? 'darkgray' : 'lightsteelblue',
                                    }}
                                >
                                    {item[1].lastMessage &&
                                        item[1].lastMessage.text &&
                                        item[1].lastMessage.text.match(imageRegex) ? (
                                        <span>
                                            🖼️{' '} Image
                                        </span>
                                    ) : item[1].lastMessage &&
                                    (item[1].lastMessage.text.length > 30
                                        ? item[1].lastMessage.text.substring(
                                            0,
                                            30
                                        ) + '.......'
                                        : item[1].lastMessage.text)}
                                </Typography>
                            </Box>
                            <Typography
                                sx={{
                                    position: 'absolute',
                                    right: '20px',
                                    fontSize: '12px',
                                    color: mode === 'light' ? 'darkgray' : 'lightsteelblue',
                                }}
                            >
                                {/* if item[1].date is the same as today's date, then extract the time only as hh:mm */}
                                {item[1]?.date?.toDate().toDateString() ===
                                    new Date().toDateString()
                                    ? item[1]?.date?.toDate().toLocaleTimeString().slice(0, -3)
                                    // else extract the date only as 12 Jan
                                    : item[1]?.date?.toDate().toLocaleDateString("en-US", {
                                        day: "numeric",
                                        month: "short",
                                    })}
                            </Typography>
                            {item[1].userInfo.uid === senderid &&
                                chat[1]?.userInfo?.uid !== senderid && (
                                    <Box
                                        sx={{
                                            width: '15px',
                                            height: '15px',
                                            borderRadius: '50%',
                                            backgroundColor: '#25d366',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            position: 'absolute',
                                            right: '20px',
                                            ...(mode === 'dark'
                                                ? { color: 'black' }
                                                : { color: 'white' }),
                                            '&::after': {
                                                width: '100%',
                                                height: '100%',
                                                borderRadius: '50%',
                                                animation:
                                                    'ripple 1.2s infinite ease-in-out',
                                                border: '1px solid #25d366',
                                                content: '""',
                                            },
                                            content: '""',
                                            '@keyframes ripple': {
                                                '0%': {
                                                    transform: 'scale(.8)',
                                                    opacity: 1,
                                                },
                                                '100%': {
                                                    transform: 'scale(2.4)',
                                                    opacity: 0,
                                                },
                                            },
                                        }}
                                    ></Box>
                                )}
                        </ListItemButton>
                    </ListItem>
                </Box>
            )}
            {value === index && !empty && !loading && search && (
                <Box sx={{ mt: 1, py: 0.5, px: 1, borderRadius: '50px' }}>
                    <ListItem
                        sx={{
                            p: 0,
                            backgroundColor: mode === 'light' ? '#F2F2F2' : '#2f3136',
                            borderRadius: '50px',
                        }}
                        onClick={handleSelect}
                    >
                        <ListItemButton sx={{ px: 1, height: '60px', borderRadius: '50px' }}>
                            <Avatar
                                alt={item.username.charAt(0).toUpperCase()}
                                src={item.photoURL}
                                sx={{ width: 50, height: 50, mr: 2 }}
                            />
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography sx={{ fontSize: '18px' }}>
                                    {item.name}
                                </Typography>
                                <Typography sx={{ fontSize: '12px', color: 'darkgray' }}>
                                    @{item.username}
                                </Typography>
                            </Box>
                        </ListItemButton>
                    </ListItem>
                </Box>
            )}
            {value === index && empty && !loading && (
                <Box
                    sx={{
                        p: 0,
                        height: '400px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Typography sx={{ mb: 3, fontSize: '18px' }}>
                        No user found 🙁
                    </Typography>
                </Box>
            )}
            {value === index && loading && (
                <Box
                    sx={{
                        p: 0,
                        height: '400px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                    }}
                >
                    <Typography sx={{ mb: 3, fontSize: '18px' }}>
                        Type username & <br /> press Enter or click on 🔍 to
                        search
                    </Typography>

                    <Divider />
                </Box>
            )}
        </div>
    );
}

function a11yProps(index) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}

export default function TabsNav({
    mode,
    chat,
    setChat,
    senderid,
    setSenderid,
}) {
    const dispatch = useDispatch();
    const [value, setValue] = useState(0);
    const [searchResults, setSearchResults] = useState(null);
    const [foundUser, setFoundUser] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);
    const [userChats, setUserChats] = useState([]);

    const currentUser = useSelector((state) => state.auth);

    useEffect(() => {
        const getUserChats = () => {
            dispatch(notifyAction(true, 'info', 'Loading your chats...'));
            try {
                const unsub = onSnapshot(
                    doc(db, 'userChats', currentUser.uid),
                    (doc) => {
                        setUserChats(doc.data());
                    }
                );
                return () => {
                    unsub();
                };
            } catch (error) {
                dispatch(
                    notifyAction(
                        true,
                        'error',
                        error.message || 'Something went wrong, please try again'
                    )
                );
            }
        };
        currentUser.uid && getUserChats();
    }, [currentUser.uid]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleSearch = async () => {
        if (!searchText) {
            dispatch(notifyAction(true, 'error', 'Please enter username'));
            return;
        }
        const q = query(
            collection(db, 'users'),
            where('username', '==', searchText.toLowerCase())
        );
        try {
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                setFoundUser(false);
                setSearchResults(null);
            } else {
                querySnapshot.forEach((doc) => {
                    setSearchResults(doc.data());
                    setFoundUser(true);
                });
            }
        } catch (error) {
            dispatch(
                notifyAction(
                    true,
                    'error',
                    'Something went wrong, please try again'
                )
            );
        }
        setLoading(false);
    };

    const handleKey = (e) => {
        e.code === 'Enter' && handleSearch();
    };

    const handleSearchText = (e) => {
        setSearchResults(null);
        setLoading(true);
        setFoundUser(true);
        setSearchText(e.target.value);
    };

    const handleUserChat = async (userId, combinedId, userInfo) => {
        const userChats = await getDoc(doc(db, 'userChats', userId));

        if (!userChats.exists()) {
            await setDoc(doc(db, 'userChats', userId), {
                [combinedId]: {
                    userInfo,
                    date: serverTimestamp(),
                },
            });
        } else {
            await updateDoc(doc(db, 'userChats', userId), {
                [combinedId]: {
                    userInfo,
                    date: serverTimestamp(),
                },
            });
        }
    };

    const handleSelect = async () => {
        // The id of the common chatRoom
        const combinedId =
            currentUser.uid > searchResults.uid
                ? currentUser.uid + searchResults.uid
                : searchResults.uid + currentUser.uid;

        try {
            // Check if the chat already exists, if not create a new one
            const res = await getDoc(doc(db, 'chats', combinedId));

            if (!res.exists()) {
                dispatch(startLoadingAction());

                await setDoc(doc(db, 'chats', combinedId), { messages: [] });

                // Check if this is the first chat for the user
                const currentUserInfo = {
                    uid: searchResults.uid,
                    name: searchResults.name,
                    photoURL: searchResults.photoURL,
                    username: searchResults.email.split('@')[0],
                    email: searchResults.email,
                };
                await handleUserChat(currentUser.uid, combinedId, currentUserInfo);

                // Check if this is the first chat for the other user
                const otherUserInfo = {
                    uid: currentUser.uid,
                    name: currentUser.name,
                    photoURL: currentUser.photoURL,
                    username: currentUser.username,
                    email: currentUser.email,
                };
                await handleUserChat(searchResults.uid, combinedId, otherUserInfo);

                dispatch(stopLoadingAction());
            }
        } catch (err) {
            dispatch(
                notifyAction(
                    true,
                    'error',
                    err.message || 'Something went wrong, please try again'
                )
            );
        }
        setChat([
            combinedId, {
                userInfo: {
                    username: searchResults.email.split('@')[0],
                    photoURL: searchResults.photoURL,
                    uid: searchResults.uid,
                },
            },
        ]);
        setSearchResults(null);
        setLoading(true);
        setFoundUser(true);
        setSearchText('');
        setValue(0);
    };

    const tabStyle = {
        p: 0,
        fontSize: '1rem',
        minHeight: '45px',
        m: 1,
        borderRadius: '30px',
        ...(mode === 'dark'
            ? {
                backgroundColor: 'info.dark',
                borderRight: '1px solid rgba(255, 255, 255, 0.12)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            }
            : {
                backgroundColor: 'primary.main',
                borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
            }),
    };

    return (
        <Box sx={{ bgcolor: 'background.paper', width: '100%' }}>
            <AppBar elevation={0} color='inherit' position='static'>
                <Tabs
                    TabIndicatorProps={{ style: { display: 'none' } }}
                    sx={{ alignItems: 'center' }}
                    value={value}
                    onChange={handleChange}
                    textColor='inherit'
                    variant='fullWidth'
                    aria-label='full width tabs example'
                >
                    <Tab sx={tabStyle} icon={<ChatIcon />} iconPosition="start" label='CHATS' {...a11yProps(0)} />
                    <Tab sx={{ ...tabStyle, borderRight: 'none' }} icon={<PersonSearchIcon />} iconPosition="start" label='SEARCH' {...a11yProps(1)} />
                </Tabs>
            </AppBar>
            <List sx={{ p: 0, pt: 0.5 }}>
                {userChats &&
                    Object.entries(userChats)
                        ?.sort((a, b) => b[1].date - a[1].date)
                        .map((item) => {
                            return (
                                <TabPanel
                                    chat={chat}
                                    mode={mode}
                                    item={item}
                                    value={value}
                                    index={0}
                                    key={item[0]}
                                    setChat={setChat}
                                    senderid={senderid}
                                    setSenderid={setSenderid}
                                />
                            );
                        })}
            </List>
            <List sx={{ p: 0 }} >
                {value === 1 && (
                    <Box
                        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                        <TextField
                            label='username'
                            sx={{
                                m: 1,
                                width: '93%',
                                '& .MuiOutlinedInput-root': {
                                    paddingRight: '6px',
                                    borderRadius: '20px',
                                },
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position='end'>
                                        <IconButton onClick={handleSearch}>
                                            <SearchIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            size='small'
                            value={searchText}
                            onChange={(e) => handleSearchText(e)}
                            onKeyDown={handleKey}
                        />
                        <Divider flexItem />
                    </Box>
                )}

                {searchResults && (
                    <TabPanel
                        handleSelect={handleSelect}
                        item={searchResults}
                        value={value}
                        index={1}
                        search={true}
                        mode={mode}
                    />
                )}
                {!foundUser && searchText != '' && (
                    <TabPanel empty={true} value={value} index={1} />
                )}
                {loading && <TabPanel loading={true} value={value} index={1} />}
            </List>
        </Box >
    );
}
