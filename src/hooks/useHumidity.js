import { useState, useEffect } from "react";
import axiosInstance from "../components/axiosInstance";

export const useMoisture = () => {
  const [currentMoisture, setCurrentMoisture] = useState(null);

  useEffect(() => {
    const fetchCurrentMoisture = async () => {
        try {
          // await axiosInstance.post("/moisture/record/sync/");
          const res = await axiosInstance.get("/moisture/record/get/recent/?n=1");
          if (res.data && res.data.length > 0) {
            setCurrentMoisture(res.data[0].value);
          }
        } catch (err) {
          console.error("Lỗi khi lấy độ ẩm hiện tại:", err);
        }
      };

    fetchCurrentMoisture();
  }, []);

  return currentMoisture;
};

