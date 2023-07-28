//Librairies
import React, { useRef, useState } from "react";
import ConfirmPopUp from "../../Confirm/ConfirmPopUp";

//Components
import CountriesList from "../../Lists/CountriesList";

//Utils
import { getAge } from "../../../utils/getAge";
import { toLocalDate } from "../../../utils/formatDates";
import { confirmAlertPopUp } from "../../Confirm/ConfirmPopUp";
import DoctorsList from "../../Lists/DoctorsLists";
import StudentsList from "../../Lists/StudentsList";
import NursesList from "../../Lists/NursesList";
import useAuth from "../../../hooks/useAuth";
import { putPatientRecord } from "../../../api/fetchRecords";
import axios from "../../../api/xano";
import { toLocalDateAndTime } from "../../../utils/formatDates";
import { CircularProgress } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";

const BASE_URL = "https://xsjk-1rpe-2jnw.n7c.xano.io";

const DemographicsPU = ({ patientInfos, setPatientInfos, setPopUpVisible }) => {
  //get the avatar with a fetch

  //======================= STYLES ========================//

  const DIALOG_CONTAINER_STYLE = {
    height: "100vh",
    width: "200vw",
    fontFamily: "Arial",
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    top: "0px",
    left: "0px",
    background: "rgba(0,0,0,0.8)",
    zIndex: "100000",
  };

  //============================= STATES ==============================//
  const [editVisible, setEditVisible] = useState(false);
  const [errMsgPost, setErrMsgPost] = useState(false);
  const [errMsg, setErrorMsg] = useState(false);
  const [formDatas, setFormDatas] = useState(patientInfos);
  const valid = useRef(Array(23).fill(true));
  const datas = useRef({});
  const { auth } = useAuth();

  const handleChange = (e) => {
    let value = e.target.value;
    const name = e.target.name;
    const id = e.target.id;
    if (
      name === "assigned_md_id" ||
      name === "assigned_resident_id" ||
      name === "assigned_student_id" ||
      name === "assigned_nurse_id" ||
      name === "assigned_midwife_id"
    ) {
      value = parseInt(value);
    }

    setErrMsgPost(false);
    if (
      name === "first_name" ||
      name === "middle_name" ||
      name === "last_name" ||
      name === "gender_at_birth" ||
      name === "gender_identification" ||
      name === "city" ||
      name === "province_state"
    ) {
      if (/^[a-zA-Z^&()\-;'",./ \u00c0-\u024f\u1e00-\u1eff]*$/.test(value)) {
        e.target.style.color = "black";
        valid.current[parseInt(id) - 1] = true;
        if (valid.current.indexOf(false) === -1) setErrorMsg(false);
      } else {
        e.target.style.color = "red";
        valid.current[parseInt(id) - 1] = false;
        if (valid.current.indexOf(false) !== -1) setErrorMsg(true);
      }
    }
    if (
      name === "chart_nbr" ||
      name === "health_insurance_nbr" ||
      name === "cell_phone" ||
      name === "home_phone" ||
      name === "preferred_phone"
    ) {
      if (/^[0-9()_\-'",./ ]*$/.test(value)) {
        e.target.style.color = "black";
        valid.current[parseInt(id) - 1] = true;
        if (valid.current.indexOf(false) === -1) setErrorMsg(false);
      } else {
        e.target.style.color = "red";
        valid.current[parseInt(id) - 1] = false;
        if (valid.current.indexOf(false) !== -1) setErrorMsg(true);
      }
    }
    if (name === "email") {
      const emailRegex = new RegExp(
        /^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/,
        "gm"
      );
      if (emailRegex.test(value)) {
        e.target.style.color = "black";
        valid.current[parseInt(id) - 1] = true;
        if (valid.current.indexOf(false) === -1) setErrorMsg(false);
      } else {
        e.target.style.color = "red";
        valid.current[parseInt(id) - 1] = false;
        if (valid.current.indexOf(false) !== -1) setErrorMsg(true);
      }
    }
    if (name === "health_card_expiry" || name === "date_of_birth") {
      value = value === "" ? null : Date.parse(new Date(value));
    }
    setFormDatas({ ...formDatas, [name]: value });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file.size > 20000000) {
      // setAlertVisible(true);
      return;
    }
    // setting up the reader
    let reader = new FileReader();
    reader.readAsDataURL(file);
    // here we tell the reader what to do when it's done reading...
    reader.onload = async (e) => {
      let content = e.target.result; // this is the content!
      let fileToUpload = await axios.post(
        "/upload/attachment",
        {
          content: content,
        },
        {
          headers: {
            Authorization: `Bearer ${auth?.authToken}`,
          },
        }
      );
      setFormDatas({ ...formDatas, avatar: fileToUpload.data });
    };
  };

  const handleClose = async (e) => {
    if (!editVisible) {
      setPopUpVisible(false);
    } else if (
      editVisible &&
      (await confirmAlertPopUp({
        content:
          "Do you really want to close the window ? Your changes will be lost",
      }))
    ) {
      setPopUpVisible(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (valid.current.indexOf(false) !== -1) {
      setErrMsgPost(true);
    } else {
      datas.current = { ...formDatas };
      datas.current.middle_name !== ""
        ? (datas.current.full_name =
            datas.current.first_name +
            " " +
            datas.current.middle_name +
            " " +
            datas.current.last_name)
        : (datas.current.full_name =
            datas.current.first_name + " " + datas.current.last_name);
      // delete datas.current.assigned_md_name;
      // delete datas.current.assigned_resident_name;
      // delete datas.current.assigned_student_name;
      // delete datas.current.assigned_nurse_name;
      // delete datas.current.assigned_midwife_name;
      try {
        await putPatientRecord(
          "/patients",
          patientInfos.id,
          auth?.userId,
          auth?.authToken,
          datas.current
        );
        const response = await axios.get(`/patients/${patientInfos.id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.authToken}`,
          },
        });
        setPatientInfos(response.data);
        setEditVisible(false);
        toast.success("Saved successfully", { containerId: "B" });
      } catch (err) {
        toast.error("Unable to save, please contact admin", {
          containerId: "B",
        });
      }
    }
  };

  return (
    <>
      {formDatas ? (
        <>
          <div className="demographics-card">
            <div className="demographics-card-header">
              <h1>Patient demographics </h1>
              <div className="demographics-card-header-btns">
                {!editVisible ? (
                  <button onClick={(e) => setEditVisible((v) => !v)}>
                    Edit
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit}>
                    Save
                  </button>
                )}
                <button onClick={handleClose}>Close</button>
              </div>
            </div>
            <form className="demographics-card-form">
              <div className="demographics-card-form-content">
                {errMsgPost && editVisible && (
                  <div className="demographics-card-form-errpost">
                    Unable to save form
                  </div>
                )}
                {errMsg && editVisible && (
                  <p className="demographics-card-form-err">Invalid fields</p>
                )}
                <p>
                  <label>First Name: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      required
                      value={formDatas.first_name}
                      onChange={handleChange}
                      name="first_name"
                      id="1"
                      autoComplete="off"
                    />
                  ) : (
                    patientInfos.first_name
                  )}
                </p>
                <p>
                  <label>Middle Name: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      value={formDatas.middle_name}
                      onChange={handleChange}
                      name="middle_name"
                      id="2"
                      autoComplete="off"
                    />
                  ) : (
                    patientInfos.middle_name
                  )}
                </p>
                <p>
                  <label>Last Name: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      required
                      value={formDatas.last_name}
                      onChange={handleChange}
                      name="last_name"
                      id="3"
                      autoComplete="off"
                    />
                  ) : (
                    patientInfos.last_name
                  )}
                </p>
                <p>
                  <label>Gender at birth: </label>
                  {editVisible ? (
                    <select
                      id="4"
                      value={formDatas.gender_at_birth}
                      onChange={handleChange}
                      name="gender_at_birth"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  ) : (
                    patientInfos.gender_at_birth
                  )}
                </p>
                <p>
                  <label>Gender identification: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      value={formDatas.gender_identification}
                      onChange={handleChange}
                      name="gender_identification"
                      id="5"
                      autoComplete="off"
                    />
                  ) : (
                    patientInfos.gender_identification
                  )}
                </p>
                <p>
                  <label>Chart Nbr: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      required
                      value={formDatas.chart_nbr.toString()}
                      onChange={handleChange}
                      name="chart_nbr"
                      id="6"
                      autoComplete="off"
                    />
                  ) : (
                    patientInfos.chart_nbr
                  )}
                </p>
                <p>
                  <label>Health Insurance Nbr: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      value={formDatas.health_insurance_nbr.toString()}
                      onChange={handleChange}
                      name="health_insurance_nbr"
                      id="7"
                      autoComplete="off"
                    />
                  ) : (
                    patientInfos.health_insurance_nbr
                  )}
                </p>
                <p>
                  <label>Health Card Expiry: </label>
                  {editVisible ? (
                    <input
                      type="date"
                      value={
                        formDatas.health_card_expiry !== null
                          ? toLocalDate(formDatas.health_card_expiry)
                          : ""
                      }
                      onChange={handleChange}
                      name="health_card_expiry"
                      id="8"
                    />
                  ) : formDatas.health_card_expiry !== null ? (
                    toLocalDate(formDatas.health_card_expiry)
                  ) : (
                    ""
                  )}
                </p>
                <p>
                  <label>Date of birth: </label>
                  {editVisible ? (
                    <input
                      type="date"
                      required
                      value={
                        formDatas.date_of_birth !== null
                          ? toLocalDate(formDatas.date_of_birth)
                          : ""
                      }
                      onChange={handleChange}
                      name="date_of_birth"
                      id="9"
                      max={toLocalDate(new Date().toISOString())}
                    />
                  ) : formDatas.date_of_birth !== null ? (
                    toLocalDate(formDatas.date_of_birth)
                  ) : (
                    ""
                  )}
                </p>
                <p>
                  <label>Age: </label>
                  {formDatas.date_of_birth !== null
                    ? getAge(toLocalDate(formDatas.date_of_birth))
                    : ""}
                </p>
                <p>
                  <label>Email: </label>
                  {editVisible ? (
                    <input
                      type="email"
                      required
                      value={formDatas.email}
                      onChange={handleChange}
                      name="email"
                      id="10"
                      autoComplete="off"
                    />
                  ) : (
                    patientInfos.email
                  )}
                </p>
                <p>
                  <label>Cell Phone: </label>
                  {editVisible ? (
                    <input
                      type="tel"
                      value={formDatas.cell_phone}
                      onChange={handleChange}
                      name="cell_phone"
                      id="11"
                      autoComplete="off"
                    />
                  ) : (
                    patientInfos.cell_phone
                  )}
                </p>
                <p>
                  <label>Home Phone: </label>
                  {editVisible ? (
                    <input
                      type="tel"
                      value={formDatas.home_phone}
                      onChange={handleChange}
                      name="home_phone"
                      id="12"
                      autoComplete="off"
                    />
                  ) : (
                    patientInfos.home_phone
                  )}
                </p>
                <p>
                  <label>Preferred Phone: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      value={formDatas.preferred_phone}
                      onChange={handleChange}
                      name="preferred_phone"
                      id="13"
                      autoComplete="off"
                    />
                  ) : (
                    patientInfos.preferred_phone
                  )}
                </p>
                <p>
                  <label>Address: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      value={formDatas.address}
                      onChange={handleChange}
                      name="address"
                      id="14"
                      autoComplete="off"
                    />
                  ) : (
                    patientInfos.address
                  )}
                </p>
                <p>
                  <label>Postal Code: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      value={formDatas.postal_code}
                      onChange={handleChange}
                      name="postal_code"
                      id="15"
                      autoComplete="off"
                    />
                  ) : (
                    patientInfos.postal_code
                  )}
                </p>
                <p>
                  <label>Province State: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      value={formDatas.province_state}
                      onChange={handleChange}
                      name="province_state"
                      id="16"
                      autoComplete="off"
                    />
                  ) : (
                    patientInfos.province_state
                  )}
                </p>
                <p>
                  <label>City: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      value={formDatas.city}
                      onChange={handleChange}
                      name="city"
                      id="17"
                      autoComplete="off"
                    />
                  ) : (
                    patientInfos.city
                  )}
                </p>
                <p>
                  <label>Country: </label>
                  {editVisible ? (
                    <CountriesList
                      id="18"
                      handleChange={handleChange}
                      value={formDatas.country}
                      name="country"
                    />
                  ) : (
                    patientInfos.country
                  )}
                </p>
                <p>
                  <label>Assigned MD: </label>
                  {editVisible ? (
                    <DoctorsList
                      value={formDatas.assigned_md_id}
                      handleChange={handleChange}
                      name="assigned_md_id"
                      id="19"
                      staffInfos={auth?.staffInfos}
                    />
                  ) : (
                    patientInfos.assigned_md_name?.full_name
                  )}
                </p>
                <p>
                  <label>Assigned Resident: </label>
                  {editVisible ? (
                    <DoctorsList
                      value={formDatas.assigned_resident_id}
                      handleChange={handleChange}
                      name="assigned_resident_id"
                      id="20"
                      staffInfos={auth?.staffInfos}
                    />
                  ) : (
                    patientInfos.assigned_resident_name?.full_name
                  )}
                </p>
                <p>
                  <label>Assigned Student: </label>
                  {editVisible ? (
                    <StudentsList
                      value={formDatas.assigned_student_id}
                      handleChange={handleChange}
                      name="assigned_student_id"
                      id="21"
                      staffInfos={auth?.staffInfos}
                    />
                  ) : (
                    patientInfos.assigned_student_name?.full_name
                  )}
                </p>
                <p>
                  <label>Assigned Nurse: </label>
                  {editVisible ? (
                    <NursesList
                      value={formDatas.assigned_nurse_id}
                      handleChange={handleChange}
                      name="assigned_nurse_id"
                      id="22"
                      staffInfos={auth?.staffInfos}
                    />
                  ) : (
                    patientInfos.assigned_nurse_name?.full_name
                  )}
                </p>
                <p>
                  <label>Assigned Midwife: </label>
                  {editVisible ? (
                    <NursesList
                      value={formDatas.assigned_midwife_id}
                      handleChange={handleChange}
                      name="assigned_midwife_id"
                      id="23"
                      staffInfos={auth?.staffInfos}
                    />
                  ) : (
                    patientInfos.assigned_midwife_name?.full_name
                  )}
                </p>
              </div>
              <div className="demographics-card-form-img">
                {formDatas.avatar ? (
                  <img
                    src={`${BASE_URL}${formDatas.avatar.path}`}
                    alt="user-avatar"
                  />
                ) : (
                  <img
                    src="https://placehold.co/300x500/png?font=roboto&text=Profile\nPic"
                    alt="user-avatar-placeholder"
                  />
                )}
                {editVisible && (
                  <input
                    name="avatar"
                    type="file"
                    accept=".jpeg, .jpg, .png, .gif, .tif, .pdf, .svg"
                    onChange={handleAvatarChange}
                  />
                )}
              </div>
            </form>
            <p className="demographics-card-sign">
              {patientInfos.updated_by_name && (
                <em>
                  Updated by {patientInfos.updated_by_name.full_name} on{" "}
                  {toLocalDateAndTime(
                    new Date(patientInfos.date_updated).toISOString()
                  )}
                </em>
              )}
            </p>
          </div>
        </>
      ) : (
        <CircularProgress />
      )}
      <ConfirmPopUp containerStyle={DIALOG_CONTAINER_STYLE} />
      <ToastContainer
        enableMultiContainer
        containerId={"B"}
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={1}
      />
    </>
  );
};

export default DemographicsPU;