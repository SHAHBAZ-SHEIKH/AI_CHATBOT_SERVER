import { BADREQUEST, INTERNALERROR, NOTFOUND, OK } from "../constants/httpStatus.js";
import Chat from "../models/Chat.js";
import { responseMessages } from "../constants/responseMessages.js";
export const saveChat = async (req, res) => {
  const { question, answer } = req.body;
  const userId = req.user._id;

  if (!question || !answer) {
    return res
      .status(BADREQUEST)
      .json({ message: responseMessages.QUESTION_AND_ANSWER_REQUIRED });
  }

  try {
    const chat = await Chat.create({
      userId,
      messages: [{ question, answer }],
    });
    res.status(201).json({
        success: true,
        message: responseMessages.CHAT_SAVED,
        data: chat
    });
  } catch (error) {
    res.status(INTERNALERROR).json({ message: error.message });
  }
};

export const updateChat = async (req, res) => {
    const {id} = req.params;
    const {question, answer} = req.body;
    const userId = req.user.id;

    if(!question || !answer) {
        return res.status(BADREQUEST).json({message: responseMessages.QUESTION_AND_ANSWER_REQUIRED});
    }

    try {
        const chat = await Chat.findByIdAndUpdate(id, {
            $push: {messages: {question, answer}}
        }, {new: true});
        res.status(OK).json({
            success: true,
            message: responseMessages.CHAT_UPDATED,
            data: chat
        });
    } catch (error) {
        res.status(INTERNALERROR).json({message: error.message});
    }
    
}

export const getChatHistory = async (req, res) => {
    const chatId = req.params.id;

    if (!chatId) {
        return res.status(BADREQUEST).json({message: responseMessages.CHAT_ID_REQUIRED});
    }
    try {
        const chat = await Chat.findById(chatId);
        if(!chat) {
            return res.status(NOTFOUND).json({message: responseMessages.CHAT_NOT_FOUND});
        }
        res.status(OK).json({
            success: true,
            message: responseMessages.CHAT_HISTORY_FETCHED,
            data: chat
        })
    } catch (error) {
        res.status(INTERNALERROR).json({message: error.message});
    }
}

export const geyChatByUserId = async (req, res) => {
    const userId = req.user.id;

    if (!userId) {
        return res.status(BADREQUEST).json({message: responseMessages.USER_ID_REQUIRED});
    }
    try {
        const chats = await Chat.find({userId});
        res.status(OK).json({
            success: true,
            message: responseMessages.CHATS_FETCHED,
            data: chats
        })
    } catch (error) {
        res.status(INTERNALERROR).json({message: error.message});
    }
}
