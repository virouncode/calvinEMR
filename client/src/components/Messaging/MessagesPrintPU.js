import React from "react";
import Message from "./Message";
import formatName from "../../utils/formatName";
import { staffIdToName } from "../../utils/staffIdToName";
import { staffIdToTitle } from "../../utils/staffIdToTitle";
import useAuth from "../../hooks/useAuth";
import { patientIdToName } from "../../utils/patientIdToName";

const MessagesPrintPU = ({ message, previousMsgs, author, authorTitle }) => {
  const { clinic } = useAuth();
  const handleClickPrint = (e) => {
    e.nativeEvent.view.print();
  };
  return (
    <div className="message-detail-print">
      <div className="message-detail-print-title">
        <p className="message-detail-print-subject">
          Subject: {message.subject}
        </p>
        {message.related_patient_id && (
          <p className="message-detail-print-patient">
            Patient:{" "}
            {patientIdToName(clinic.patientsInfos, message.related_patient_id)}
          </p>
        )}
      </div>
      <div className="message-detail-content">
        <Message
          message={message}
          author={author}
          authorTitle={authorTitle}
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
      </div>
      <div className="message-detail-print-btn">
        <button onClick={handleClickPrint}>Print</button>
      </div>
    </div>
  );
};

export default MessagesPrintPU;