import { CircularProgress } from "@mui/material";
import React from "react";
import FakeWindow from "../../Presentation/FakeWindow";
import MessagePatientDetail from "./MessagePatientDetail";
import MessagesPatientOverview from "./MessagesPatientOverview";
import NewMessagePatient from "./NewMessagePatient";

const MessagesPatientBox = ({
  section,
  newVisible,
  setNewVisible,
  msgsSelectedIds,
  setMsgsSelectedIds,
  currentMsgId,
  setCurrentMsgId,
  messages,
  popUpVisible,
  setPopUpVisible,
}) => {
  const emptySectionMessages = (sectionName) => {
    switch (sectionName) {
      case "Inbox":
        return `No inbox messages`;
      case "Sent messages":
        return `No sent messages`;
      case "Deleted messages":
        return `No deleted messages`;
      default:
        break;
    }
  };

  return (
    <>
      <div className="messages-content-box">
        {messages ? (
          messages?.length !== 0 ? (
            currentMsgId === 0 ? (
              <MessagesPatientOverview
                messages={messages}
                setCurrentMsgId={setCurrentMsgId}
                msgsSelectedIds={msgsSelectedIds}
                setMsgsSelectedIds={setMsgsSelectedIds}
                section={section}
              />
            ) : (
              <MessagePatientDetail
                setCurrentMsgId={setCurrentMsgId}
                message={messages.find(({ id }) => id === currentMsgId)}
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
        <FakeWindow
          title="NEW MESSAGE"
          width={1000}
          height={600}
          x={(window.innerWidth - 1000) / 2}
          y={(window.innerHeight - 600) / 2}
          color={"#94bae8"}
          setPopUpVisible={setNewVisible}
        >
          <NewMessagePatient setNewVisible={setNewVisible} />
        </FakeWindow>
      )}
    </>
  );
};

export default MessagesPatientBox;
