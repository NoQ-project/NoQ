import React, { useState } from "react";

function Navbar({ onLoginClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm relative">
      <nav className="flex justify-between items-center w-full max-w-7xl mx-auto py-4 px-6 md:px-8">
        {/* 1. Logo (Always Left) */}
        <div className="font-bold text-2xl text-purple-900 tracking-wide">
          <a href="#home">NoQ</a>
        </div>

        {/* 2. Desktop Navigation Links */}
        <ul className="gap-8 md:flex hidden justify-center items-center text-gray-700 font-medium">
          <li>
            <a href="#home" className="hover:text-purple-600 transition">
              Home
            </a>
          </li>
          <li>
            <a href="#services" className="hover:text-purple-600 transition">
              Services
            </a>
          </li>
          <li>
            <a
              href="#how-it-works"
              className="hover:text-purple-600 transition"
            >
              How it works
            </a>
          </li>
          <li>
            <a href="#contact" className="hover:text-purple-600 transition">
              Contact
            </a>
          </li>
        </ul>

        {/* 3. Desktop Action Buttons */}
        <div className="md:flex hidden justify-end gap-4 items-center">
          <button
            className="border border-purple-600 text-purple-700 hover:bg-purple-50 py-2 px-5 rounded-full font-medium transition"
            onClick={onLoginClick}
          >
            Login
          </button>

          <button
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-5 rounded-full font-medium transition shadow-sm"
            onClick={onLoginClick}
          >
            Get a token
          </button>
        </div>

        {/* 4. Mobile Hamburger Toggle Icon (Always Right) */}
        <div
          onClick={toggleMenu}
          className="cursor-pointer md:hidden flex items-center p-2 rounded-lg hover:bg-gray-100 transition ml-auto"
        >
          <i className="fa-solid fa-bars fa-xl text-gray-800"></i>
        </div>
      </nav>

      
      {isMenuOpen && (
        <>
        
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={toggleMenu}
          ></div>

          
          <div className="absolute top-full right-6 mt-2 w-72 bg-white rounded-2xl p-5 pt-8 flex flex-col gap-4 md:hidden shadow-2xl border border-purple-100 z-50">
         
            <button
              onClick={toggleMenu}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            <ul className="flex flex-col gap-3 text-gray-800 font-semibold text-base">
              <li>
                <a
                  href="#home"
                  onClick={toggleMenu}
                  className="block py-1.5 px-3 rounded-lg hover:bg-purple-50 hover:text-purple-700 transition"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  onClick={toggleMenu}
                  className="block py-1.5 px-3 rounded-lg hover:bg-purple-50 hover:text-purple-700 transition"
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  onClick={toggleMenu}
                  className="block py-1.5 px-3 rounded-lg hover:bg-purple-50 hover:text-purple-700 transition"
                >
                  How it works
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={toggleMenu}
                  className="block py-1.5 px-3 rounded-lg hover:bg-purple-50 hover:text-purple-700 transition"
                >
                  Contact
                </a>
              </li>
            </ul>

            <hr className="border-gray-100 my-1" />

            <div className="flex flex-col gap-2.5">
              <button
                className="w-full border border-purple-600 text-purple-700 py-2 rounded-full font-medium hover:bg-purple-50 text-sm transition"
                onClick={() => {
                  toggleMenu();
                  onLoginClick();
                }}
              >
                Login
              </button>
              <button
                className="w-full bg-green-600 text-white py-2 rounded-full font-medium hover:bg-green-700 text-sm transition shadow-sm"
                onClick={() => {
                  toggleMenu();
                  onLoginClick();
                }}
              >
                Get a token
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

export default Navbar;
