import React from "react";
import Logo from "../assets/LogoWebsite.png";

const Footer = () => {
  return (
    <footer className="bg-green-100 p-6 ">
      <div className="grid grid-cols-4 gap-4">
        <div>
          <img src={Logo} alt="SmartSprout" className="w-16" />
          <p className="font-bold">SmartSprout</p>
        </div>
        <div>
          <h3 className="font-semibold">Địa chỉ</h3>
          <p>KTX khu B, ĐHQG HCM</p>
          <p>KTX khu A, ĐHQG HCM</p>
        </div>
        <div>
          <h3 className="font-semibold">Số điện thoại</h3>
          <p>0123 123 123</p>
          <p>0123 123 123</p>
        </div>
        <div>
          <h3 className="font-semibold">Email</h3>
          <p>xxx.XxxxXxxx@hcmut.edu.vn</p>
          <p>abc.Abcdef@hcmut.edu.vn</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
