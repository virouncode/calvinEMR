import React from "react";
import NewMessage from "./NewMessage";
import NewWindow from "react-new-window";
import { CircularProgress } from "@mui/material";
import MessagesOverview from "./MessagesOverview";
import MessageDetail from "./MessageDetail";
import useAuth from "../../hooks/useAuth";

const MessagesBox = ({
  section,
  search,
  newVisible,
  setNewVisible,
  setSection,
  msgsSelectedIds,
  setMsgsSelectedIds,
  currentMsgId,
  setCurrentMsgId,
  messages,
  setMessages,
  popUpVisible,
  setPopUpVisible,
}) => {
  const emptySectionMessages = (sectionName) => {
    switch (sectionName) {
      case "Inbox":
        return "No inbox messages";
      case "Sent messages":
        return "No sent messages";
      case "Deleted messages":
        return "No deleted messages";
      default:
        break;
    }
  };

  return (
    <>
      <div className="messages-section-box">
        {messages ? (
          messages?.length !== 0 ? (
            currentMsgId === 0 ? (
              <MessagesOverview
                messages={messages}
                setMessages={setMessages}
                setCurrentMsgId={setCurrentMsgId}
                msgsSelectedIds={msgsSelectedIds}
                setMsgsSelectedIds={setMsgsSelectedIds}
                section={section}
              />
            ) : (
              <MessageDetail
                setCurrentMsgId={setCurrentMsgId}
                message={messages.find(({ id }) => id === currentMsgId)}
                setMessages={setMessages}
                setSection={setSection}
                section={section}
                popUpVisible={popUpVisible}
                setPopUpVisible={setPopUpVisible}
              />
            )
          ) : (
            <p>{emptySectionMessages(section)}</p>
          )
        ) : (
          <CircularProgress />
        )}
      </div>
      {newVisible && (
        <NewWindow
          title="New Message"
          features={{
            toolbar: "no",
            scrollbars: "no",
            menubar: "no",
            status: "no",
            directories: "no",
            width: 1000,
            height: 500,
            left: 0,
            top: 0,
          }}
          onUnload={() => setNewVisible(false)}
        >
          <NewMessage
            setNewVisible={setNewVisible}
            setMessages={setMessages}
            section={section}
          />
        </NewWindow>
      )}
    </>
  );
};

export default MessagesBox;
