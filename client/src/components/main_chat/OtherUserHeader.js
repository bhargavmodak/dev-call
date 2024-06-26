import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import OtherUserModal from './other_user_modal/OtherUserModal';

export default function OtherUserHeader({ chat = [], mode, startVideoCall, startWorkspace }) {
    const [modalOpen, setModalOpen] = useState(false);
    return (
        <>
            {modalOpen && (
                <OtherUserModal
                    modalOpen={modalOpen}
                    setModalOpen={setModalOpen}
                    mode={mode}
                    otherUser={chat[1].userInfo}
                />
            )}

            <Box
                sx={{
                    height: '65px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pl: 2,
                    backgroundColor: mode === 'light' ? 'primary.main' : 'info.dark',
                    position: 'sticky',
                    top: 0,
                }}
            >
                {/* The profile icon and name */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                        sx={{
                            width: 40,
                            height: 40,
                        }}
                        alt={chat[1].userInfo.username.charAt(0).toUpperCase()}
                        src={chat[1].userInfo.photoURL}
                    />
                    &nbsp; &nbsp;
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography sx={{ color: 'whitesmoke' }} variant='h6'>
                            {chat[1].userInfo.name}
                        </Typography>
                        <Typography sx={{ color: 'lightsteelblue' }} variant='subtitle2'>
                            @{chat[1].userInfo.username}
                        </Typography>
                    </Box>
                </Box>

                <Box
                    sx={{
                        borderRadius: '50px',
                        my: 1,
                        mr: 2,
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    }}
                >
                    <Tooltip title='See their profile' arrow>
                        <IconButton onClick={() => setModalOpen(true)}>
                            <AccountCircleIcon sx={{ color: 'whitesmoke', fontSize: '30px' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title='Start a Workspace with them' arrow>
                        <IconButton onClick={startWorkspace}>
                            <WorkspacesIcon sx={{ color: 'whitesmoke', fontSize: '30px' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title='Start a Video Call with them' arrow>
                        <IconButton onClick={startVideoCall}>
                            <VideoCallIcon sx={{ color: 'whitesmoke', fontSize: '30px' }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        </>
    )
}
