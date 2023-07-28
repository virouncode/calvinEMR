//Librairies
import React from "react";
import { useState, useRef } from "react";

//Components
import RoomsList from "../../../EventForm/RoomsList";
import StatusList from "../../../EventForm/StatusList";
import HostsList from "../../../EventForm/HostsList";

//Utils
import {
  fromLocalToISOStringNoMs,
  toLocalDate,
  toISOStringNoMs,
} from "../../../../utils/formatDates";
import { getAvailableRooms } from "../../../../api/getAvailableRooms";
import { statuses } from "../../../../utils/statuses";
import { rooms } from "../../../../utils/rooms";
import TimePicker from "../../../Pickers/TimePicker";
import { confirmAlertPopUp } from "../../../Confirm/ConfirmPopUp";
import formatName from "../../../../utils/formatName";
import useAuth from "../../../../hooks/useAuth";
import {
  getPatientRecord,
  postPatientRecord,
} from "../../../../api/fetchRecords";
import { toast } from "react-toastify";

const AppointmentForm = ({
  setDatas,
  patientId,
  editCounter,
  patientInfos,
  setAddVisible,
  setErrMsgPost,
  setAlertVisible,
}) => {
  //HOOKS
  const { auth } = useAuth();
  const [formDatas, setFormDatas] = useState({
    host_id: auth?.title === "Secretary" ? 0 : auth?.userId,
    start: null,
    end: null,
    duration: 0,
    all_day: false,
    status: "Scheduled",
    reason: "New Event",
    staff_guests: [],
    patients_guests: [{ patients_id: patientId }],
    room: "To be determined",
  });
  const [availableRooms, setAvailableRooms] = useState([]);
  const previousStartDate = useRef(toLocalDate(new Date().toISOString()));
  const previousEndDate = useRef(toLocalDate(new Date().toISOString()));
  const previousStartHours = useRef("");
  const previousEndHours = useRef("");
  const previousStartMin = useRef("");
  const previousEndMin = useRef("");
  const previousStartAMPM = useRef("");
  const previousEndAMPM = useRef("");
  const startDateInput = useRef("");
  const endDateInput = useRef("");
  const startHourInput = useRef("");
  const endHourInput = useRef("");
  const startMinInput = useRef("");
  const endMinInput = useRef("");
  const startAMPMInput = useRef("");
  const endAMPMInput = useRef("");
  const minStartDate = useRef(toLocalDate(new Date().toISOString()));
  const minEndDate = useRef(toLocalDate(new Date().toISOString()));

  //STYLE

  //HANDLERS
  const isSecretary = () => {
    return auth?.title === "Secretary";
  };

  const handleChange = (e) => {
    setErrMsgPost(false);
    const name = e.target.name;
    const value = e.target.value;
    setFormDatas({ ...formDatas, [name]: value });
  };

  const handleHostChange = async (e) => {
    setErrMsgPost(false);
    const value = parseInt(e.target.value);
    setFormDatas({ ...formDatas, host_id: value });
  };

  const handleRoomChange = async (e) => {
    const name = e.target.name;
    const value = e.target.value;
    if (
      (isRoomOccupied(value) &&
        (await confirmAlertPopUp({
          content: `${value} will be occupied at this time slot, choose this room anyway ?`,
        }))) ||
      !isRoomOccupied(value)
    ) {
      setFormDatas({ ...formDatas, [name]: value });
    }
  };

  const handleStartChange = async (e) => {
    setErrMsgPost(false);
    const dateValue = startDateInput.current.value; //choosen local date YYYY:MM:DD
    const hourValue = startHourInput.current.value; //choosen local hour
    const minValue = startMinInput.current.value; //choosen local min
    const ampmValue = startAMPMInput.current.value; //choosen local ampm
    const name = e.target.name;

    if (name === "date" && dateValue === "") {
      setFormDatas({ ...formDatas, start: null });
      return;
    }

    let value = fromLocalToISOStringNoMs(
      dateValue,
      hourValue,
      minValue,
      ampmValue
    );

    value = Date.parse(new Date(value));

    const rangeEnd =
      new Date(value) > new Date(formDatas.end) ? value : formDatas.end;

    const hypotheticAvailableRooms = await getAvailableRooms(
      0,
      value,
      rangeEnd,
      auth?.authToken
    );
    if (
      formDatas.room === "To be determined" ||
      hypotheticAvailableRooms.includes(formDatas.room) ||
      (!hypotheticAvailableRooms.includes(formDatas.room) &&
        (await confirmAlertPopUp({
          content: `${formDatas.room} will be occupied at this time slot, book it anyway ?`,
        })))
    ) {
      switch (name) {
        case "date":
          previousStartDate.current = dateValue;
          minEndDate.current = dateValue;
          break;
        case "hour":
          previousStartHours.current = hourValue;
          break;
        case "min":
          previousStartMin.current = minValue;
          break;
        case "ampm":
          previousStartAMPM.current = ampmValue;
          break;
        default:
          break;
      }
      if (new Date(value) > new Date(formDatas.end)) {
        setFormDatas({
          ...formDatas,
          start: value,
          end: value,
          duration: 0,
        });
        endHourInput.value = startHourInput.value;
        endMinInput.value = startMinInput.value;
        endAMPMInput.vzalue = startAMPMInput.value;
        setAvailableRooms(
          await getAvailableRooms(0, value, value, auth?.authToken)
        );
      } else {
        setFormDatas({
          ...formDatas,
          start: value,
          duration: Math.floor((formDatas.end - value) / (1000 * 60)),
        });
        setAvailableRooms(
          await getAvailableRooms(0, value, formDatas.end, auth?.authToken)
        );
      }
    } else {
      //set input value to previous start
      switch (name) {
        case "date":
          e.target.value = previousStartDate.current;
          break;
        case "hour":
          e.target.value = previousStartHours.current;
          break;
        case "min":
          e.target.value = previousStartMin.current;
          break;
        case "ampm":
          e.target.value = previousStartAMPM.current;
          break;
        default:
          break;
      }
    }
  };

  const handleEndChange = async (e) => {
    setErrMsgPost(false);
    const dateValue = endDateInput.current.value;
    const hourValue = endHourInput.current.value; //choosen local hour
    const minValue = endMinInput.current.value; //choosen local min
    const ampmValue = endAMPMInput.current.value; //choosen local ampm
    const name = e.target.name;

    if (name === "date" && dateValue === "") {
      setFormDatas({ ...formDatas, end: null });
      return;
    }

    let value = fromLocalToISOStringNoMs(
      dateValue,
      hourValue,
      minValue,
      ampmValue
    );

    value = Date.parse(new Date(value));

    const hypotheticAvailableRooms = await getAvailableRooms(
      0,
      formDatas.start,
      value,
      auth?.authToken
    );
    if (
      formDatas.room === "To be determined" ||
      hypotheticAvailableRooms.includes(formDatas.room) ||
      (!hypotheticAvailableRooms.includes(formDatas.room) &&
        (await confirmAlertPopUp({
          content: `${formDatas.room} will be occupied at this time slot, book it anyway ?`,
        })))
    ) {
      switch (name) {
        case "date":
          previousEndDate.current = dateValue;
          break;
        case "hour":
          previousEndHours.current = hourValue;
          break;
        case "min":
          previousEndMin.current = minValue;
          break;
        case "ampm":
          previousEndAMPM.current = ampmValue;
          break;
        default:
          break;
      }
      setFormDatas({
        ...formDatas,
        end: value,
        duration: Math.floor((value - formDatas.start) / (1000 * 60)),
      });
      setAvailableRooms(
        await getAvailableRooms(0, formDatas.start, value, auth?.authToken)
      );
    } else {
      switch (name) {
        case "date":
          e.target.value = previousEndDate.current;
          break;
        case "hour":
          e.target.value = previousEndHours.current;
          break;
        case "min":
          e.target.value = previousEndMin.current;
          break;
        case "ampm":
          e.target.value = previousEndAMPM.current;
          break;
        default:
          break;
      }
    }
  };

  const handleAllDayChange = (e) => {
    let value = e.target.value;
    value = value === "true"; //cast to boolean
    if (value) {
      if (formDatas.start === null) {
        setAlertVisible(true);
        return;
      }
      const startAllDay = formDatas.start.setHours(0, 0, 0, 0);
      let endAllDay = new Date(startAllDay);
      endAllDay = endAllDay.setDate(endAllDay.getDate() + 1);

      setFormDatas({
        ...formDatas,
        all_day: true,
        start: startAllDay,
        end: endAllDay,
        duration: 1440,
      });
    } else {
      setFormDatas({
        ...formDatas,
        all_day: false,
        duration: Math.floor((formDatas.end - formDatas.start) / (1000 * 60)),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      formDatas.start === null ||
      formDatas.end === null ||
      formDatas.reason === ""
    ) {
      setErrMsgPost(true);
      return;
    }
    try {
      await postPatientRecord(
        "/appointments",
        auth?.userId,
        auth?.authToken,
        formDatas
      );
      setDatas(
        await getPatientRecord(
          "/patient_appointments",
          patientId,
          auth?.authToken
        )
      );
      editCounter.current -= 1;
      setAddVisible(false);
      toast.success("Saved successfully", { containerId: "B" });
    } catch (err) {
      toast.error("Unable to save, please contact admin", { containerId: "B" });
    }
  };

  const isRoomOccupied = (roomName) => {
    if (roomName === "To be determined") {
      return false;
    }
    return availableRooms.includes(roomName) ? false : true;
  };

  return (
    <tr className="appointments-form">
      <td style={{ minWidth: "170px" }}>
        {isSecretary() ? (
          <HostsList
            staffInfos={auth?.staffInfos}
            handleHostChange={handleHostChange}
            hostId={formDatas.host_id}
          />
        ) : (
          <p>
            {auth?.title === "Doctor" ? "Dr. " : ""}{" "}
            {formatName(auth?.userName)}
          </p>
        )}
      </td>
      <td>
        <input
          type="text"
          name="reason"
          value={formDatas.reason}
          onChange={handleChange}
          autoComplete="off"
        />
      </td>
      <td>
        <div className="appointments-form-date-container">
          <input
            type="date"
            value={formDatas.start !== null ? toLocalDate(formDatas.start) : ""}
            onChange={handleStartChange}
            ref={startDateInput}
            name="date"
            min={minStartDate.current}
          />
          <TimePicker
            handleChange={handleStartChange}
            dateTimeValue={formDatas.start}
            passingRefHour={startHourInput}
            passingRefMin={startMinInput}
            passingRefAMPM={startAMPMInput}
            readOnly={formDatas.all_day}
          />
        </div>
      </td>
      <td>
        <div className="appointments-event-date-container">
          <input
            type="date"
            value={formDatas.end !== null ? toLocalDate(formDatas.end) : ""}
            onChange={handleEndChange}
            min={minEndDate.current}
            ref={endDateInput}
            readOnly={formDatas.all_day}
            name="date"
          />
          <TimePicker
            handleChange={handleEndChange}
            dateTimeValue={formDatas.end}
            passingRefHour={endHourInput}
            passingRefMin={endMinInput}
            passingRefAMPM={endAMPMInput}
            readOnly={formDatas.all_day}
          />
        </div>
      </td>
      <td>
        <select
          name="all_day"
          value={formDatas.all_day.toString()}
          onChange={handleAllDayChange}
          style={{ width: "50px" }}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </td>
      <td>
        <RoomsList
          handleRoomChange={handleRoomChange}
          roomSelected={formDatas.room}
          rooms={rooms}
          isRoomOccupied={isRoomOccupied}
          label={false}
        />
      </td>
      <td>
        <StatusList
          handleChange={handleChange}
          statuses={statuses}
          selectedStatus={formDatas.status}
          label={false}
        />
      </td>
      <td>
        <em>{formatName(auth?.userName)}</em>
      </td>
      <td>
        <em>{toLocalDate(toISOStringNoMs(new Date()))}</em>
      </td>
      <td>
        <input type="submit" value="Save" onClick={handleSubmit} />
      </td>
    </tr>
  );
};

export default AppointmentForm;