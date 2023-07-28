import React, { useState } from "react";
import formatName from "../../../../utils/formatName";
import { toISOStringNoMs, toLocalDate } from "../../../../utils/formatDates";
import {
  bodyMassIndex,
  bodySurfaceArea,
  cmToFeet,
  feetToCm,
  kgToLbs,
  lbsToKg,
} from "../../../../utils/measurements";
import useAuth from "../../../../hooks/useAuth";
import {
  postPatientRecord,
  getPatientRecord,
} from "../../../../api/fetchRecords";
import { toast } from "react-toastify";

const MeasurementForm = ({
  editCounter,
  setAddVisible,
  patientId,
  setDatas,
  setErrMsgPost,
}) => {
  //HOOKS
  const { auth } = useAuth();
  const [formDatas, setFormDatas] = useState({
    patient_id: patientId,
    height_cm: "",
    height_feet: "",
    weight_kg: "",
    weight_lbs: "",
    waist_circumference: "",
    body_surface_area: "",
    body_mass_index: "",
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
  });

  //HANDLERS
  const handleChange = async (e) => {
    setErrMsgPost(false);
    const name = e.target.name;
    const value = e.target.value;
    setFormDatas({ ...formDatas, [name]: value });

    switch (name) {
      case "height_cm": {
        const heightFeet = cmToFeet(value);
        if (formDatas.weight_kg) {
          const bmi = bodyMassIndex(value, formDatas.weight_kg);
          const bsa = bodySurfaceArea(value, formDatas.weight_kg);
          setFormDatas({
            ...formDatas,
            height_cm: value,
            height_feet: heightFeet,
            body_mass_index: bmi,
            body_surface_area: bsa,
          });
        } else {
          setFormDatas({
            ...formDatas,
            height_cm: value,
            height_feet: heightFeet,
          });
        }
        break;
      }
      case "height_feet": {
        const heightCm = feetToCm(value);
        if (formDatas.weight_kg) {
          const bmi = bodyMassIndex(heightCm, formDatas.weight_kg);
          const bsa = bodySurfaceArea(heightCm, formDatas.weight_kg);
          setFormDatas({
            ...formDatas,
            height_cm: heightCm,
            height_feet: value,
            body_mass_index: bmi,
            body_surface_area: bsa,
          });
        } else {
          setFormDatas({
            ...formDatas,
            height_cm: heightCm,
            height_feet: value,
          });
        }
        break;
      }
      case "weight_kg": {
        const weightLbs = kgToLbs(value);
        if (formDatas.height_cm) {
          const bmi = bodyMassIndex(formDatas.height_cm, value);
          const bsa = bodySurfaceArea(formDatas.height_cm, value);
          setFormDatas({
            ...formDatas,
            weight_kg: value,
            weight_lbs: weightLbs,
            body_mass_index: bmi,
            body_surface_area: bsa,
          });
        } else {
          setFormDatas({
            ...formDatas,
            weight_kg: value,
            weight_lbs: weightLbs,
          });
        }
        break;
      }
      case "weight_lbs": {
        const weightKg = lbsToKg(value);
        if (formDatas.height_cm) {
          const bmi = bodyMassIndex(formDatas.height_cm, weightKg);
          const bsa = bodySurfaceArea(formDatas.height_cm, weightKg);
          setFormDatas({
            ...formDatas,
            weight_kg: weightKg,
            weight_lbs: value,
            body_mass_index: bmi,
            body_surface_area: bsa,
          });
        } else {
          setFormDatas({
            ...formDatas,
            weight_kg: weightKg,
            weight_lbs: value,
          });
        }
        break;
      }
      default: {
        setFormDatas({ ...formDatas, [name]: value });
        break;
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formDatas.height_cm &&
      !formDatas.weight_kg &&
      !formDatas.blood_pressure_diastolic &&
      !formDatas.blood_pressure_systolic &&
      !formDatas.waist_circumference
    ) {
      setErrMsgPost(true);
      return;
    }
    try {
      await postPatientRecord(
        "/measurements",
        auth?.userId,
        auth?.authToken,
        formDatas
      );
      setDatas(
        await getPatientRecord("/measurements", patientId, auth?.authToken)
      );
      editCounter.current -= 1;
      setAddVisible(false);
      toast.success("Saved successfully", { containerId: "B" });
    } catch (err) {
      toast.error("Unable to save, please contact admin", { containerId: "B" });
    }
  };

  return (
    <tr className="measurements-form">
      <td>
        <input
          name="height_cm"
          type="text"
          value={formDatas.height_cm || ""}
          onChange={handleChange}
          autoComplete="off"
        />
      </td>
      <td>
        <input
          name="height_feet"
          type="text"
          value={formDatas.height_feet || ""}
          onChange={handleChange}
          autoComplete="off"
        />
      </td>
      <td>
        <input
          name="weight_kg"
          type="text"
          value={formDatas.weight_kg || ""}
          onChange={handleChange}
          autoComplete="off"
        />
      </td>
      <td>
        <input
          name="weight_lbs"
          type="text"
          value={formDatas.weight_lbs || ""}
          onChange={handleChange}
          autoComplete="off"
        />
      </td>
      <td>
        <input
          name="waist_circumference"
          type="text"
          value={formDatas.waist_circumference || ""}
          onChange={handleChange}
          autoComplete="off"
        />
      </td>
      <td>
        <input
          name="body_mass_index"
          type="text"
          value={formDatas.body_mass_index || ""}
          readOnly
        />
      </td>
      <td>
        <input
          name="body_surface_area"
          type="text"
          value={formDatas.body_surface_area || ""}
          readOnly
        />
      </td>
      <td>
        <input
          name="blood_pressure_systolic"
          type="text"
          value={formDatas.blood_pressure_systolic || ""}
          onChange={handleChange}
          autoComplete="off"
        />
      </td>
      <td>
        <input
          name="blood_pressure_diastolic"
          type="text"
          value={formDatas.blood_pressure_diastolic || ""}
          onChange={handleChange}
          autoComplete="off"
        />
      </td>
      <td>
        <em>{formatName(auth?.userName)}</em>
      </td>
      <td>
        <em>{toLocalDate(toISOStringNoMs(new Date()))}</em>
      </td>
      <td style={{ textAlign: "center" }}>
        <input type="submit" value="Save" onClick={handleSubmit} />
      </td>
    </tr>
  );
};

export default MeasurementForm;