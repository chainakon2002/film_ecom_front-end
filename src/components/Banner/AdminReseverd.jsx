import React, { useContext } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReservedContext from "../contexts/ReservedContext";

export default function ReservedDashboard() {
  return (
      <Reseverd />
  );
}

function Reseverd() {
  const { adminData } = useContext(ReservedContext);



  const navigate = useNavigate();
  const back = () => {
    navigate("/admin");
  };
  const rester = () => {
    window.location.reload();
  };

  return (
    <div>
      {adminData?.map((item) => (
        <ReseverdItem key={item.id} item={item} />
      ))}
      <div className="grid place-items-center">
        <button
          onClick={rester}
          className="btn btn-outline bg-green-500 hover:bg-green-600 focus:bg-green-600 hover:text-white focus:text-white"
        >
          รีเซ็ดหน้าจอ{" "}
        </button>
        <button
          onClick={back}
          className="btn btn-outline bg-green-500 hover:bg-green-600 focus:bg-green-600 hover:text-white focus:text-white"
        >
          กลับหน้าหลัก{" "}
        </button>
      </div>
    </div>
  );
}

function ReseverdItem({ item }) {
  const { deleteReserved } = useContext(ReservedContext);


  return (
    <div className="overflow-x-auto relative mt-4">

</div>
  );
}