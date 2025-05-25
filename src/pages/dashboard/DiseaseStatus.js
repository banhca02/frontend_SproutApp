import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";
import axiosInstance from "../../components/axiosInstance"; // Dùng axiosInstance đã cấu hình

//const api = "https://doandanganh.onrender.com/api";

const ImageModal = ({ selectedImage, setSelectedImage }) => {
  return (
    <AnimatePresence>
      {selectedImage && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setSelectedImage(null)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-4 rounded-lg shadow-lg"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Ảnh chi tiết"
              className="rounded-md"
            />
            <button
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md w-full"
              onClick={() => setSelectedImage(null)}
            >
              Đóng
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const DiseaseStatus = () => {
  const [firstImage, setFirstImage] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null);
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  useEffect(() => {
    const fetchFirstImage = async () => {
      try {
        const res = await axiosInstance.get("/pest/image/get/");
        setImages(res.data.results);
        setTotalPages(Math.ceil(res.data.count / res.data.results.length));
        setFirstImage(res.data.results[0]);
        console.log(res.data.results[0].predictions)
      } catch (err) {
        console.error(err);
      }
    };
    fetchFirstImage();
  }, []);
  

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await axiosInstance.get(`/pest/image/get/?page=${page}`);
        setImages(res.data.results);
        setTotalPages(Math.ceil(res.data.count / res.data.results.length));
      } catch (err) {
        console.error(err);
      }
    };
    fetchImages(); 
  }, [page]);
  
  

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-grow">
        <Sidebar activeItem="disease-status" />
        <div className="flex-grow p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="w-2/3 pr-4">
              <h2 className="text-xl font-semibold mb-2">
                Ảnh chụp cây gần đây nhất
              </h2>
              <div className="border rounded-lg shadow-md p-2 bg-white">
                {images.length > 0 ? (
                  <img
                    src={firstImage?.annotated_image}
                    alt="Ảnh mới nhất"
                    className="w-full max-w-md rounded-lg cursor-pointer hover:scale-105 transition-transform"
                    onClick={() =>
                      setSelectedImage(firstImage?.annotated_image)
                    }
                  />
                ) : (
                  <div className="text-gray-500 text-center p-4">
                    Không có ảnh gần đây
                  </div>
                )}
              </div>
            </div>
            <div className="w-1/3">
              <h2 className="text-xl font-semibold mb-2">Thông báo</h2>
              <div className="p-4 border rounded-lg shadow-md bg-white">
                <div className="flex items-center border rounded-lg p-3 shadow-sm">
                  <span className="text-2xl pl-4">🕒</span>
                  <div className="flex flex-col ml-3">
                    <span className="text-gray-700 font-medium">
                      Thời gian chụp
                    </span>
                    <span className="text-lg font-bold text-black">
                      {images.length > 0
                        ? firstImage?.timestamp?.slice(11, 16)
                        : "--:--"}
                    </span>
                  </div>
                </div>
                <div className="mt-3 px-4 py-2 bg-green-100 text-green-700 font-semibold text-center rounded-md">
                  {images.length > 0
                    ? (Array.isArray(firstImage?.predictions) && firstImage?.predictions.length === 0
                      ? "Không phát hiện sâu bệnh"
                      : <span className="text-red-600">Phát hiện sâu bệnh</span>)
                    : "Không có ảnh"}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              Lịch sử phân tích trong 24 giờ qua
            </h2>
            <div className="border rounded-lg shadow-md bg-white">
              {images.length > 0 ? (
                images.map((img) => (
                  <div
                    key={img.id}
                    className="flex items-center px-4 py-2 border-b last:border-none"
                  >
                    <img
                      src={`${img.image}`}
                      alt={`Ảnh ${img.timestamp}`}
                      className="w-10 h-10 rounded-md mr-3 cursor-pointer hover:scale-110 transition-transform"
                      onClick={() =>
                        setSelectedImage(`${img.image}`)
                      }
                    />
                    <span className="mr-2 pl-20">🕒</span>
                    <span className="text-gray-700">
                      {img.timestamp?.slice(11, 16) || "--:--"}
                    </span>
                    <span className="ml-auto font-semibold text-green-600">
                    {
                    (Array.isArray(img?.predictions) && img?.predictions.length === 0
                      ? "Không phát hiện sâu bệnh"
                      : <span className="text-red-600">Phát hiện sâu bệnh</span>)
                    }
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center p-4 text-gray-500">
                  Không có lịch sử ảnh
                </div>
              )}
            </div>
            <div className="flex justify-center items-center mt-4 space-x-4">
            {/* Nút Prev */}
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Trang trước
            </button>

            {/* Số trang hiện tại */}
            <span>
              Trang {page} / {totalPages}
            </span>

            {/* Nút Next */}
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Trang sau
            </button>
          </div>


          </div>
        </div>
      </div>
      <ImageModal
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />
      <Footer />
    </div>
  );
};

export default DiseaseStatus;
