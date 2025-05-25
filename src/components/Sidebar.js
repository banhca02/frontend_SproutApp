import React from "react";

const Sidebar = ({ activeItem }) => {
  const items = [
    //{ label: "Thông báo chung", path: "/dashboard/notifications", key: "notifications" },
    { label: "Tổng quan thông số", path: "/dashboard/overview", key: "overview", isMain: true },
    { label: "Ánh sáng", path: "/dashboard/light", key: "light" },
    { label: "Nhiệt độ", path: "/dashboard/temperature", key: "temperature" },
    { label: "Độ ẩm", path: "/dashboard/humidity", key: "humidity" },
    { label: "Tình trạng sâu bệnh", path: "/dashboard/diseasestatus", key: "disease-status" },
  ];

  return (
    <div className="w-1/6 bg-[#598868] text-white p-2">
      <ul className="w-full">
        {items.map((item) => (
          <li
          key={item.key}
          className={`py-3 pl-4 rounded-lg cursor-pointer ${item.isMain ? "text-lg font-bold" : "text-sm pl-6 font-bold"} 
            ${activeItem === item.key ? "bg-gray-300 text-black font-bold" : "hover:bg-green-600"}`}
        >
            <a className="block" href={item.path}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
