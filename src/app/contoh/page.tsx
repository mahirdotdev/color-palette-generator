"use client";

import { useState } from "react";

export default function ContohPage() {
  const [open, setOpen] = useState<boolean>(true);
  const [color, setColor] = useState<string>("");

  const handleOpen = () => {


    setOpen((previous) => {
      if (previous == true) {
        setColor("warna true");
      } else {
        setColor("warna false");
      }

      return !previous;
    });

    // setOpen((value)=>{
    //     if (value === true) return false;

    //     if (value === false) return true;
    // })
  };
  return (
    <div className="flex flex-col gap-2">
      Ini halaman contoh
      <button
        className="block bg-amber-300 px-2 py-2 mx-auto"
        // onClick={() => setOpen(!open)}
        onClick={handleOpen}
      >
        {" "}
        {open ? "buka" : "tutup"}
      </button>
      <button
        className="block bg-green-300 px-2 py-2 mx-auto"
        onClick={() => setColor("satu")}
      >
        {" "}
        {color || "belum ada"}
      </button>
    </div>
  );
}

// !false
//!true

function openObject(value: boolean) {
  if (value === true) return false;

  if (value === false) return true;
}
