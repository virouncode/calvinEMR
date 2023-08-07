import React from "react";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const MessagesLeftBar = ({ section, setSection, setCurrentMsgId }) => {
  const navigate = useNavigate();
  const handleClickSection = (e) => {
    const name = e.target.id;
    setSection(name);
    setCurrentMsgId(0);
  };
  const isActive = (id) =>
    section === id
      ? "messages-section-leftbar-category messages-section-leftbar-category--active"
      : "messages-section-leftbar-category";

  const { user } = useAuth();

  return (
    <div className="messages-section-leftbar">
      <ul>
        <li
          className={isActive("Inbox")}
          id="Inbox"
          onClick={handleClickSection}
        >
          {"Inbox" +
            (user.unreadMessagesNbr ? ` (${user.unreadMessagesNbr})` : "")}
        </li>
        <li
          className={isActive("Sent messages")}
          id="Sent messages"
          onClick={handleClickSection}
        >
          Sent messages
        </li>
        <li
          className={isActive("Deleted messages")}
          id="Deleted messages"
          onClick={handleClickSection}
        >
          Deleted messages
        </li>
      </ul>
    </div>
  );
};

export default MessagesLeftBar;