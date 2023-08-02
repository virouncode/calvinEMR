import React, { useState } from "react";
import Message from "./Message";
import ReplyForm from "./ReplyForm";
import axios from "../../api/xano";
import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { filterAndSortDiscussions } from "../../utils/filterAndSortDiscussions";

const DiscussionDetail = ({
  setCurrentDiscussionId,
  discussion,
  messages,
  setMessages,
  staffInfos,
  setDiscussions,
  setSection,
  section,
}) => {
  const [replyVisible, setReplyVisible] = useState(false);
  const [transferVisible, setTransferVisible] = useState(false);
  const [allPersons, setAllPersons] = useState(false);
  const { auth } = useAuth();

  const handleClickBack = (e) => {
    setCurrentDiscussionId(0);
  };

  const handleDeleteDiscussion = async (e) => {
    try {
      await axios.put(
        `/discussions/${discussion.id}`,
        {
          ...discussion,
          deleted_by_ids: [...discussion.deleted_by_ids, auth.userId],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.authToken}`,
          },
        }
      );
      const response2 = await axios.get(
        `/discussions?staff_id=${auth.userId}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const newDiscussions = filterAndSortDiscussions(
        section,
        response2.data,
        auth.userId
      );
      setDiscussions(newDiscussions);
      setSection("Inbox");
      setCurrentDiscussionId(0);
      toast.success("Discussion deleted successfully", { containerId: "A" });
    } catch (err) {
      console.log(err);
      toast.error("Couldn't delete discussion", { containerId: "A" });
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
    setTransferVisible(true);
  };

  return (
    <>
      <div className="discussion-detail-toolbar">
        <i
          className="fa-solid fa-arrow-left discussion-detail-toolbar-arrow"
          style={{ cursor: "pointer" }}
          onClick={handleClickBack}
        ></i>
        <div className="discussion-detail-toolbar-subject">
          {discussion.subject}
        </div>
        {section !== "Deleted messages" && (
          <i
            className="fa-solid fa-trash  discussion-detail-toolbar-trash"
            style={{ cursor: "pointer" }}
            onClick={handleDeleteDiscussion}
          ></i>
        )}
      </div>
      <div className="discussion-detail-content">
        {messages
          .filter(({ discussion_id }) => discussion_id === discussion.id)
          .map((message) => (
            <Message
              message={message}
              author={
                staffInfos.find(({ id }) => id === message.from_id).full_name
              }
              authorTitle={
                staffInfos.find(({ id }) => id === message.from_id).title ===
                "Doctor"
                  ? "Dr. "
                  : ""
              }
              discussion={discussion}
              staffInfos={staffInfos}
              key={message.id}
            />
          ))}
      </div>
      {replyVisible && (
        <ReplyForm
          setReplyVisible={setReplyVisible}
          allPersons={allPersons}
          discussion={discussion}
          staffInfos={staffInfos}
          setMessages={setMessages}
          setDiscussions={setDiscussions}
          section={section}
        />
      )}
      {section !== "Deleted messages" && (
        <div className="discussion-detail-btns">
          <button onClick={handleClickReply} disabled={replyVisible}>
            Reply
          </button>
          {discussion.participants_ids.length >= 3 && (
            <button onClick={handleClickReplyAll} disabled={replyVisible}>
              Reply all
            </button>
          )}
          <button onClick={handleClickTransfer} disabled={replyVisible}>
            Transfer
          </button>
        </div>
      )}
    </>
  );
};

export default DiscussionDetail;
