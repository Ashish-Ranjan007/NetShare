import { ChatType } from '../@types/responseType';

export default (chats: ChatType[], chatId: string, authId: string): number => {
	for (let i = 0; i < chats.length; i++) {
		if (chats[i]._id !== chatId) {
			continue;
		}

		for (let j = 0; j < chats[i].unreadMessages.length; j++) {
			if (chats[i].unreadMessages[j].userId === authId) {
				return chats[i].unreadMessages[j].newMessages;
			}
		}
	}

	return 0;
};
