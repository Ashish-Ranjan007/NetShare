import React from 'react';
import { Box, Button } from '@mui/material';
import { Close } from '@mui/icons-material';

import ExistGroup from './ExistGroup';
import RenameGroup from './RenameGroup';
import DeleteGroup from './DeleteGroup';
import AddGroupMember from './AddGroupMember';
import SetDisplayPicture from './SetDisplayPicture';
import GroupParticipants from './GroupParticipants';
import { ChatType } from '../../../@types/responseType';

type props = {
	chat: ChatType;
	onClose: React.Dispatch<React.SetStateAction<boolean>>;
};

const GroupSettings = ({ chat, onClose }: props) => {
	return (
		<Box sx={{ minWidth: { xs: '100vw', sm: '400px' } }}>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					padding: '8px 8px 8px 0px',
				}}
			>
				<Button onClick={() => onClose(false)}>
					<Close />
				</Button>

				<AddGroupMember />
			</Box>

			<SetDisplayPicture />
			<RenameGroup />
			<GroupParticipants />
			<ExistGroup />
			<DeleteGroup />
		</Box>
	);
};

export default GroupSettings;
