import { useState, useEffect } from "react";
import axiosInstance from "../components/axiosInstance";

export const useLight = () => {
  const [currentLight, setCurrentLight] = useState(null);

  useEffect(() => {
    const fetchCurrentLight = async () => {
        try {
          // await axiosInstance.post("/light/record/sync/");
          const res = await axiosInstance.get("/light/record/get/recent/?n=1");
          if (res.data && res.data.length > 0) {
            setCurrentLight(res.data[0].value);
          }
        } catch (err) {
          console.error("Lỗi khi lấy ánh sáng hiện tại:", err);
        }
      };

    fetchCurrentLight();
  }, []);

  return currentLight;
};

