import { useState, useEffect } from "react";
import axiosInstance from "../components/axiosInstance";

export const useTemperature = () => {
  const [currentTemp, setCurrentTemp] = useState(null);

  useEffect(() => {
    const fetchCurrentTemp = async () => {
      try {
        const res = await axiosInstance.get("/temperature/record/get/recent/?n=1");
        if (res.data && res.data.length > 0) {
          setCurrentTemp(res.data[0].value);
        }
      } catch (err) {
        console.error("Lỗi khi lấy nhiệt độ hiện tại:", err);
      }
    };

    fetchCurrentTemp();
  }, []);

  return currentTemp;
};

