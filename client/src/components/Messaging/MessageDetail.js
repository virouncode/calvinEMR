import React, { useEffect, useState } from "react";
import Message from "./Message";
import ReplyForm from "./ReplyForm";
import axiosXano from "../../api/xano";
import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify";
import NewWindow from "react-new-window";
import ForwardForm from "./ForwardForm";
import { staffIdToTitle } from "../../utils/staffIdToTitle";
import { staffIdToName } from "../../utils/staffIdToName";
import { filterAndSortMessages } from "../../utils/filterAndSortMessages";
import { NavLink } from "react-router-dom";
import { confirmAlert } from "../Confirm/ConfirmGlobal";
import formatName from "../../utils/formatName";
import MessagesPrintPU from "./MessagesPrintPU";
import { patientIdToName } from "../../utils/patientIdToName";
import MessagesAttachments from "./MessagesAttachments";

const MessageDetail = ({
  setCurrentMsgId,
  message,
  setMessages,
  setSection,
  section,
  popUpVisible,
  setPopUpVisible,
}) => {
  const [replyVisible, setReplyVisible] = useState(false);
  const [forwardVisible, setForwardVisible] = useState(false);
  const [allPersons, setAllPersons] = useState(false);
  const { auth, user, clinic } = useAuth();
  const [previousMsgs, setPreviousMsgs] = useState(null);
  const patient = clinic.patientsInfos.find(
    ({ id }) => id === message.related_patient_id
  );
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    const abortController = new AbortController();
    const fetchPreviousMsgs = async () => {
      try {
        const response = await axiosXano.post(
          "/messages_selected",
          { messages_ids: message.previous_ids },
          {
            headers: {
              Authorization: `Bearer ${auth.authToken}`,
              "Content-Type": "application/json",
            },
            signal: abortController.signal,
          }
        );
        if (abortController.signal.aborted) return;
        setPreviousMsgs(
          response.data.sort((a, b) => b.date_created - a.date_created)
        );
      } catch (err) {
        if (err.name !== "CanceledError")
          toast.error(
            `Error: unable to fetch previous messages: ${err.message}`,
            { containerId: "A" }
          );
      }
    };
    fetchPreviousMsgs();
    return () => abortController.abort();
  }, [auth.authToken, user.id, message.previous_ids]);

  useEffect(() => {
    const abortController = new AbortController();
    const fetchAttachments = async () => {
      try {
        const response = (
          await axiosXano.post(
            "/attachments_for_message",
            { attachments_ids: message.attachments_ids },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.authToken}`,
              },
              signal: abortController.signal,
            }
          )
        ).data;
        if (abortController.signal.aborted) return;
        setAttachments(response);
      } catch (err) {
        if (err.name !== "CanceledError")
          toast.error(`Error: unable to fetch attachments: ${err.message}`, {
            containerId: "A",
          });
      }
    };
    fetchAttachments();
    return () => {
      abortController.abort();
    };
  }, [auth.authToken, message.attachments_ids]);

  const handleClickBack = (e) => {
    setCurrentMsgId(0);
  };

  const handleDeleteMsg = async (e) => {
    if (
      await confirmAlert({
        content: "Do you really want to delete this message ?",
      })
    ) {
      try {
        await axiosXano.put(
          `/messages/${message.id}`,
          {
            ...message,
            deleted_by_ids: [...message.deleted_by_ids, user.id],
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.authToken}`,
            },
          }
        );
        const response2 = await axiosXano.get(`/messages?staff_id=${user.id}`, {
          headers: {
            Authorization: `Bearer ${auth.authToken}`,
            "Content-Type": "application/json",
          },
        });
        const newMessages = filterAndSortMessages(
          section,
          response2.data,
          user.id
        );
        setMessages(newMessages);
        setCurrentMsgId(0);
        toast.success("Message deleted successfully", { containerId: "A" });
      } catch (err) {
        toast.error(`Error: unable to delete message: ${err.message}`, {
          containerId: "A",
        });
      }
    }
  };

  const handleClickReply = (e) => {
    setReplyVisible(true);
    setAllPersons(false);
  };
  const handleClickReplyAll = (e) => {
    setReplyVisible(true);
    setAllPersons(true);
  };

  const handleClickTransfer = (e) => {
    setForwardVisible(true);
  };

  return (
    <>
      {popUpVisible && (
        <NewWindow
          title={`Message(s) / Subject: ${message.subject} ${
            message.related_patient_id &&
            `/ Patient: ${patientIdToName(
              clinic.patientsInfos,
              message.related_patient_id
            )}`
          }`}
          features={{
            toolbar: "no",
            scrollbars: "no",
            menubar: "no",
            status: "no",
            directories: "no",
            width: 793.7,
            height: 1122.5,
            left: 320,
            top: 200,
          }}
          onUnload={() => setPopUpVisible(false)}
        >
          <MessagesPrintPU
            message={message}
            previousMsgs={previousMsgs}
            author={formatName(
              staffIdToName(clinic.staffInfos, message.from_id)
            )}
            authorTitle={staffIdToTitle(clinic.staffInfos, message.from_id)}
            attachments={attachments}
          />
        </NewWindow>
      )}
      <div className="message-detail-toolbar">
        <i
          className="fa-solid fa-arrow-left message-detail-toolbar-arrow"
          style={{ cursor: "pointer" }}
          onClick={handleClickBack}
        ></i>
        <div className="message-detail-toolbar-subject">{message.subject}</div>
        <div className="message-detail-toolbar-patient">
          {patient && (
            <NavLink
              to={`/patient-record/${patient.id}`}
              className="message-detail-toolbar-patient-link"
            >
              {patient.full_name}
            </NavLink>
          )}
        </div>
        {section !== "Deleted messages" && (
          <i
            className="fa-solid fa-trash  message-detail-toolbar-trash"
            onClick={handleDeleteMsg}
          ></i>
        )}
      </div>
      <div className="message-detail-content">
        <Message
          message={message}
          author={formatName(staffIdToName(clinic.staffInfos, message.from_id))}
          authorTitle={staffIdToTitle(clinic.staffInfos, message.from_id)}
          key={message.id}
          index={0}
        />
        {previousMsgs &&
          previousMsgs.map((message, index) => (
            <Message
              message={message}
              author={formatName(
                staffIdToName(clinic.staffInfos, message.from_id)
              )}
              authorTitle={staffIdToTitle(clinic.staffInfos, message.from_id)}
              key={message.id}
              index={index + 1}
            />
          ))}
        <MessagesAttachments
          attachments={attachments}
          deletable={false}
          cardWidth="15%"
        />
      </div>
      {replyVisible && (
        <ReplyForm
          setReplyVisible={setReplyVisible}
          allPersons={allPersons}
          message={message}
          previousMsgs={previousMsgs}
          setMessages={setMessages}
          section={section}
          patient={patient}
        />
      )}
      {section !== "Deleted messages" && !replyVisible && !forwardVisible && (
        <div className="message-detail-btns">
          {section !== "Sent messages" && (
            <button onClick={handleClickReply}>Reply</button>
          )}
          {message.to_ids.length >= 2 && section !== "Sent messages" && (
            <button onClick={handleClickReplyAll}>Reply all</button>
          )}
          <button onClick={handleClickTransfer}>Forward</button>
        </div>
      )}
      {forwardVisible && (
        <NewWindow
          title="Forward Discussion"
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
          onUnload={() => setForwardVisible(false)}
        >
          <ForwardForm
            setForwardVisible={setForwardVisible}
            setMessages={setMessages}
            section={section}
            message={message}
            previousMsgs={previousMsgs}
            patient={patient}
          />
        </NewWindow>
      )}
    </>
  );
};

export default MessageDetail;
