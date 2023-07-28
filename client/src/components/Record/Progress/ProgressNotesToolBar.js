//Librairies
import React from "react";
import useAuth from "../../../hooks/useAuth";
import axios from "../../../api/xano";

const ProgressNotesToolBar = ({
  addVisible,
  setAddVisible,
  search,
  setSearch,
  contentRef,
  triangleRef,
  setCheckedNotes,
  checkedNotes,
  checkAllNotes,
  setPopUpVisible,
  selectAllDisabled,
  selectAll,
  setSelectAll,
  allBodiesVisible,
  setAllBodiesVisible,
  order,
  setOrder,
}) => {
  //HOOKS
  const { auth } = useAuth();
  //Events
  const handleClickSelectAll = (e) => {
    if (selectAll) {
      setSelectAll(false);
      setCheckedNotes([]);
    } else {
      checkAllNotes();
      setSelectAll(true);
    }
  };
  const handleClickNew = () => {
    setAddVisible(true);
    triangleRef.current.classList.add("triangle--active");
    contentRef.current.classList.add("progress-notes-content--active");
  };

  const handleClickFold = (e) => {
    setAllBodiesVisible((v) => !v);
  };
  const handleClickPrint = () => {
    setPopUpVisible((v) => !v);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    triangleRef.current.classList.add("triangle--active");
    contentRef.current.classList.add("progress-notes-content--active");
  };

  const handleChangeOrder = async (e) => {
    const value = e.target.value;
    setOrder(value);
    try {
      await axios.put(
        `settings/${auth.settings.id}`,
        { ...auth.settings, progress_notes_order: value },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.authToken}`,
          },
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="progress-notes-toolbar">
      <div>
        <label>
          <strong>Search</strong>
        </label>
        <input type="text" value={search} onChange={handleChange}></input>
      </div>
      <div className="progress-notes-toolbar-order">
        <div className="progress-notes-toolbar-order-radio-item">
          <input
            type="radio"
            name="order"
            value="top"
            id="top"
            onChange={handleChangeOrder}
            checked={order === "top"}
          />
          <label htmlFor="top">Top</label>
        </div>
        <div className="progress-notes-toolbar-order-radio-item">
          <input
            type="radio"
            name="order"
            value="bottom"
            id="top"
            onChange={handleChangeOrder}
            checked={order === "bottom"}
          />
          <label>Bottom</label>
        </div>
      </div>
      <div>
        <button onClick={handleClickFold}>
          {allBodiesVisible ? "Fold All" : "Unfold All"}
        </button>
        <button onClick={handleClickNew} disabled={addVisible}>
          New
        </button>
        <button onClick={handleClickPrint} disabled={checkedNotes.length === 0}>
          Print Selection
        </button>
        <button onClick={handleClickSelectAll} disabled={selectAllDisabled}>
          {selectAll ? "Unselect All" : "Select All"}
        </button>
      </div>
    </div>
  );
};

export default ProgressNotesToolBar;