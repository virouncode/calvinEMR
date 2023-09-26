import React from "react";
import axiosXano from "../../api/xano";
import useAuth from "../../hooks/useAuth";
import { NavLink } from "react-router-dom";
import { toLocalDateAndTime } from "../../utils/formatDates";
import { toast } from "react-toastify";
import { filterAndSortMessages } from "../../utils/filterAndSortMessages";
import { staffIdListToTitleAndName } from "../../utils/staffIdListToTitleAndName";
import { confirmAlert } from "../Confirm/ConfirmGlobal";
import { staffIdToTitleAndName } from "../../utils/staffIdToTitleAndName";

const MessageThumbnail = ({
  message,
  setMessages,
  setCurrentMsgId,
  setMsgsSelectedIds,
  msgsSelectedIds,
  section,
}) => {
  const { auth, user, setUser, clinic } = useAuth();
  const patient = clinic.patientsInfos.find(
    ({ id }) => id === message.related_patient_id
  );

  const handleMsgClick = async (e) => {
    //Remove one from the unread messages nbr counter
    if (user.unreadMessagesNbr !== 0) {
      const newUnreadMessagesNbr = user.unreadMessagesNbr - 1;
      setUser({
        ...user,
        unreadMessagesNbr: newUnreadMessagesNbr,
        unreadNbr: newUnreadMessagesNbr + user.unreadMessagesExternalNbr,
      });
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          unreadMessagesNbr: newUnreadMessagesNbr,
          unreadNbr: newUnreadMessagesNbr + user.unreadMessagesExternalNbr,
        })
      );
    }
    setCurrentMsgId(message.id);

    if (!message.read_by_staff_ids.includes(user.id)) {
      //create and replace message with read by user id
      try {
        const newMessage = {
          ...message,
          read_by_staff_ids: [...message.read_by_staff_ids, user.id],
        };
        await axiosXano.put(`/messages/${message.id}`, newMessage, {
          headers: {
            Authorization: `Bearer ${auth.authToken}`,
            "Content-Type": "application/json",
          },
        });
        const response = await axiosXano.get(`/messages?staff_id=${user.id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.authToken}`,
          },
        });
        setMessages(filterAndSortMessages(section, response.data, user.id));
      } catch (err) {
        toast.error(`Error: unable to get messages: ${err.message}`, {
          containerId: "A",
        });
      }
    }
  };

  const THUMBNAIL_STYLE = {
    fontWeight:
      message.to_staff_ids.includes(user.id) &&
      !message.read_by_staff_ids.includes(user.id)
        ? "bold"
        : "normal",
  };

  const handleCheckMsg = (e) => {
    const checked = e.target.checked;
    const id = parseInt(e.target.id);
    if (checked) {
      if (!msgsSelectedIds.includes(id)) {
        setMsgsSelectedIds([...msgsSelectedIds, id]);
      }
    } else {
      let msgsSelectedIdsUpdated = [...msgsSelectedIds];
      msgsSelectedIdsUpdated = msgsSelectedIdsUpdated.filter(
        (messageId) => messageId !== id
      );
      setMsgsSelectedIds(msgsSelectedIdsUpdated);
    }
  };

  const isMsgSelected = (id) => {
    return msgsSelectedIds.includes(parseInt(id));
  };

  const handleDeleteMsg = async (e) => {
    if (
      await confirmAlert({
        content: "Do you really want to remove this message ?",
      })
    ) {
      try {
        await axiosXano.put(
          `/messages/${message.id}`,
          {
            ...message,
            deleted_by_staff_ids: [...message.deleted_by_staff_ids, user.id],
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.authToken}`,
            },
          }
        );
        const response = await axiosXano.get(`/messages?staff_id=${user.id}`, {
          headers: {
            Authorization: `Bearer ${auth.authToken}`,
            "Content-Type": "application/json",
          },
        });
        setMessages(filterAndSortMessages(section, response.data, user.id));
        toast.success("Message deleted successfully", { containerId: "A" });
        setMsgsSelectedIds([]);
      } catch (err) {
        toast.error(`Error: unable to delete message: ${err.message}`, {
          containerId: "A",
        });
      }
    }
  };

  return (
    <div className="message-thumbnail" style={THUMBNAIL_STYLE}>
      <input
        className="message-thumbnail-checkbox"
        type="checkbox"
        id={message.id}
        checked={isMsgSelected(message.id)}
        onChange={handleCheckMsg}
      />
      <div onClick={handleMsgClick} className="message-thumbnail-link">
        <div className="message-thumbnail-author">
          {section !== "Sent messages"
            ? staffIdToTitleAndName(clinic.staffInfos, message.from_id, true)
            : staffIdListToTitleAndName(
                clinic.staffInfos,
                message.to_staff_ids
              )}
        </div>
        <div className="message-thumbnail-sample">
          <span>{message.subject}</span> - {message.body}{" "}
          {message.attachments_ids.length !== 0 && (
            <i
              className="fa-solid fa-paperclip"
              style={{ marginLeft: "5px" }}
            ></i>
          )}
        </div>
      </div>
      <div className="message-thumbnail-patient">
        {patient && (
          <NavLink
            to={`/patient-record/${patient.id}`}
            className="message-thumbnail-patient-link"
          >
            {patient.full_name}
          </NavLink>
        )}
      </div>
      <div className="message-thumbnail-date">
        {toLocalDateAndTime(message.date_created)}
      </div>
      <div className="message-thumbnail-logos">
        {section !== "Deleted messages" && (
          <i
            className="fa-solid fa-trash  message-thumbnail-trash"
            style={{ cursor: "pointer" }}
            onClick={handleDeleteMsg}
          ></i>
        )}
      </div>
    </div>
  );
};

export default MessageThumbnail;
