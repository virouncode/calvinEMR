import React, { useRef, useState } from "react";
import useAuth from "../../hooks/useAuth";
import { postPatientRecord } from "../../api/fetchRecords";
import axiosXano from "../../api/xano";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";
import { firstLetterUpper } from "../../utils/firstLetterUpper";
import DocMailboxPatients from "./DocMailboxPatients";
import DocMailboxAssignedPractician from "./DocMailboxAssignedPractician";
const BASE_URL = "https://xsjk-1rpe-2jnw.n7c.xano.io";

const DocMailboxFormSecretary = ({ errMsg, setErrMsg }) => {
  //HOOKS
  const { auth, user, clinic } = useAuth();
  const [formDatas, setFormDatas] = useState({
    patient_id: 0,
    assigned_id: 0,
    description: "",
    file: null,
    acknowledged: false,
  });
  const fileInputRef = useRef(null);
  const [saveDisabled, setSaveDisabled] = useState(true);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  //HANDLERS
  const handleChange = (e) => {
    setErrMsg("");
    let value = e.target.value;
    const name = e.target.name;
    setFormDatas({ ...formDatas, [name]: value });
  };

  const isPatientChecked = (id) => {
    return formDatas.patient_id === parseInt(id);
  };

  const isPracticianChecked = (id) => {
    return formDatas.assigned_id === parseInt(id);
  };

  const handleCheckPatient = (e) => {
    setErrMsg("");
    setFormDatas({ ...formDatas, patient_id: parseInt(e.target.id) });
  };

  const handleCheckPractician = (e) => {
    setErrMsg("");
    setFormDatas({ ...formDatas, assigned_id: parseInt(e.target.id) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");
    console.log("submit");
    const datasToPost = {
      ...formDatas,
      description: firstLetterUpper(formDatas.description),
    };
    //Validation
    if (datasToPost.description === "") {
      setErrMsg("Description field is required");
      return;
    }
    if (datasToPost.patient_id === 0) {
      setErrMsg("Please choose a related patient");
      return;
    }
    if (datasToPost.assigned_id === 0) {
      setErrMsg("Please choose an assigned practician");
      return;
    }
    // Formatting
    setFormDatas({
      ...formDatas,
      description: firstLetterUpper(formDatas.description),
    });
    if (!datasToPost.file.type) datasToPost.file.type = "document";

    try {
      await postPatientRecord(
        "/documents",
        user.id,
        auth.authToken,
        datasToPost
      );
      toast.success("Posted successfully", { containerId: "A" });
      fileInputRef.current.value = null;
      setFormDatas({
        patient_id: 0,
        assigned_id: 0,
        description: "",
        file: null,
        acknowledged: false,
      });
    } catch (err) {
      toast.error(`Error unable to save document: ${err.message}`, {
        containerId: "A",
      });
    }
  };
  const handleUpload = async (e) => {
    setErrMsg("");
    setSaveDisabled(true);
    const file = e.target.files[0];
    if (file.size > 25000000) {
      setErrMsg("The file is over 25Mb, please choose another file");
      setIsLoadingFile(false);
      return;
    }
    // setting up the reader
    setIsLoadingFile(true);
    let reader = new FileReader();
    reader.readAsDataURL(file);
    // here we tell the reader what to do when it's done reading...
    reader.onload = async (e) => {
      let content = e.target.result; // this is the content!
      let fileToUpload;
      try {
        fileToUpload = await axiosXano.post(
          "/upload/attachment",
          {
            content: content,
          },
          {
            headers: {
              Authorization: `Bearer ${auth.authToken}`,
            },
          }
        );
        setIsLoadingFile(false);
        setSaveDisabled(false);
        setFormDatas({
          ...formDatas,
          file: fileToUpload.data,
        });
      } catch (err) {
        setIsLoadingFile(false);
        toast.error(`Error unable to load document: ${err.message}`, {
          containerId: "B",
        });
      }
    };
  };

  return (
    <div className="docinbox-form">
      <form className="docinbox-form-content" onSubmit={handleSubmit}>
        <div className="docinbox-form-content-row">
          <input type="submit" value="Post" disabled={saveDisabled} />
        </div>
        <div className="docinbox-form-content-row">
          <label>Description</label>
          <input
            name="description"
            type="text"
            value={formDatas.description}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>
        <div className="docinbox-form-content-row docinbox-form-content-row--patients">
          <label>Related patient</label>
          <DocMailboxPatients
            isPatientChecked={isPatientChecked}
            handleCheckPatient={handleCheckPatient}
            label={false}
          />
        </div>
        <div className="docinbox-form-content-row">
          <DocMailboxAssignedPractician
            staffInfos={clinic.staffInfos}
            handleCheckPractician={handleCheckPractician}
            isPracticianChecked={isPracticianChecked}
          />
        </div>
        <div className="docinbox-form-content-row">
          <label>Upload document</label>
          <input
            ref={fileInputRef}
            name="file"
            required
            type="file"
            onChange={handleUpload}
            accept=".jpeg, .jpg, .png, .gif, .tif, .pdf, .svg, .mp3, .aac, .aiff, .flac, .ogg, .wma, .wav, .mov, .mp4, .avi, .wmf, .flv, .doc, .docm, .docx, .txt, .csv, .xls, .xlsx, .ppt, .pptx"
          />
        </div>
        <div className="docinbox-form-content-row">
          {isLoadingFile && (
            <CircularProgress size="1rem" style={{ margin: "5px" }} />
          )}
        </div>
      </form>
      <div className="docinbox-form-content-preview">
        {formDatas.file && formDatas.file.mime.includes("image") ? (
          <img src={`${BASE_URL}${formDatas.file.path}`} alt="" width="100%" />
        ) : formDatas.file && formDatas.file.mime.includes("video") ? (
          <video controls>
            <source
              src={`${BASE_URL}${formDatas.file.path}`}
              type={formDatas.file.mime}
            />
          </video>
        ) : formDatas.file && formDatas.file.mime.includes("officedocument") ? (
          <div>
            <iframe
              title="office document"
              src={`https://docs.google.com/gview?url=${BASE_URL}${formDatas.file.path}&embedded=true&widget=false`}
              width="100%"
              height="500px"
              frameBorder="0"
            />
          </div>
        ) : (
          formDatas.file && (
            <iframe
              title={formDatas.alias}
              src={`${BASE_URL}${formDatas.file.path}`}
              type={formDatas.file.type}
              width="100%"
              style={{ border: "none" }}
              height="500px"
            />
          )
        )}
      </div>
    </div>
  );
};

export default DocMailboxFormSecretary;
