import "../assets/css/landing_page.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import NoqLogin from "../components/auth/Login";
import { useState } from "react";

function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [initialAuthView, setInitialAuthView] = useState("login");

  const openAuth = (view) => {
    setInitialAuthView(view);
    setShowLogin(true);
  };

  return (
    <>
      <Navbar onLoginClick={() => openAuth("login")} />

      <div
        className="hero w-full mx-auto py-4 px-8 h-[70vh] grid sm:grid-cols-2 items-center gap-10 bg-[#EEEDFE]"
        id="home"
      >
        <div>
          <h1 className="font-bold text-3xl py-5 text-[#6C4AB7]">
            Welcome to NoQ
          </h1>

          <p className="text-3xl text-[#6C4AB7]">
            Queue smarter, not longer
          </p>

          <p className="text-xl py-2 text-[#6C4AB7]">
            Book your spot online, track your turn in real time, and walk in
            only when you're called. No more waiting in line.
          </p>

          <div className="flex gap-4 py-4">
            <button 
              className="bg-green-500 text-white py-2 px-4 rounded cursor-pointer"
              onClick={() => openAuth("signup")}
            >
              Get a Token
            </button>

            <button 
              className="bg-purple-500 text-white py-2 px-4 rounded cursor-pointer"
              onClick={() => openAuth("login")}
            >
              Check Queue Status
            </button>
          </div>
        </div>

        <div className="ticket-box p-4" id="ticket-box">
          <div className="flex justify-between">
            <p>City Bank Kathmandu</p>
            <p>Live</p>
          </div>

          <div className="grid justify-center text-center py-6">
            <p>Now Serving</p>
            <p>B-039</p>
            <p>General Banking - Counter 3</p>
          </div>

          <div className="grid grid-cols-3 text-center">
            <p>22</p>
            <p>~14 min</p>
            <p>4</p>

            <p>In Queue</p>
            <p>Avg Wait</p>
            <p>Counter Open</p>
          </div>

          <div className="button-track">
            <button onClick={() => openAuth("login")}>
              Enter a token number to track
            </button>
          </div>
        </div>
      </div>

      <div
        className="services grid gap-4 w-full mx-auto scroll-mt-[56px]"
        id="services"
      >
        <p className="text-[#6C4AB7]">Available Services</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="service-card">
            <p className="service-image">1</p>
            <p>Choose a service</p>
            <p>
              Pick the service you need and see real-time wait times before you
              book.
            </p>
          </div>

          <div className="service-card">
            <p className="service-image">2</p>
            <p>Get your token</p>
            <p>
              Receive a digital token instantly via SMS or on screen. No
              printing needed.
            </p>
          </div>

          <div className="service-card">
            <p className="service-image">3</p>
            <p>Track your turn</p>
            <p>
              Monitor your position live from anywhere. Get notified as your
              turn approaches.
            </p>
          </div>

          <div className="service-card">
            <p className="service-image">4</p>
            <p>Walk in &amp; be served</p>
            <p>
              Arrive when it's your turn. Head straight to the counter — no
              waiting around.
            </p>
          </div>
        </div>
      </div>

      <div
        className="how-it-works grid gap-4 w-full mx-auto"
        id="how-it-works"
      >
        <p className="text-[#6C4AB7] font-bold">
          How It Works
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="step-card">
            <p className="step">1</p>
            <div className="py-5">
              <p className="font-bold">Choose a service</p>
              <p>
                Pick the service you need and see real-time wait times before
                you book.
              </p>
            </div>
          </div>

          <div className="step-card">
            <p className="step">2</p>
            <div className="py-5">
              <p className="font-bold">Get your token</p>
              <p>
                Receive a digital token instantly via SMS or on screen. No
                printing needed.
              </p>
            </div>
          </div>

          <div className="step-card">
            <p className="step">3</p>
            <div className="py-5">
              <p className="font-bold">Track your turn</p>
              <p>
                Monitor your position live from anywhere. Get notified as your
                turn approaches.
              </p>
            </div>
          </div>

          <div className="step-card">
            <p className="step">4</p>
            <div className="py-5">
              <p className="font-bold">Walk in &amp; be served</p>
              <p>
                Arrive when it's your turn. Head straight to the counter — no
                waiting around.
              </p>
            </div>
          </div>
        </div>

        <button 
          className="bg-green-500 text-white py-2 px-4 rounded max-w-max cursor-pointer"
          onClick={() => openAuth("signup")}
        >
          Get a Token
        </button>
      </div>
           
      <div id="contact" className="contact grid sm:grid-cols-2">
        <div className="contact-text">
          <p className="font-bold">Contact us</p>
          <p>
            Have questions or need help? Reach out to our support team — we're
            here to assist with bookings, queue setup, or any issues you run
            into.
          </p>
        </div>

        <div className="contact-form">
          <form onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
              />
            </div>

            <div>
              <label htmlFor="email">Email</label>
              <input
                type="type"
                id="email"
                name="email"
              />
            </div>

            <div>
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                cols="30"
                rows="5"
                placeholder="Enter your message"
              ></textarea>
              <button className="send bg-green-400 rounded shadow-md cursor-pointer">Send</button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
      
      <NoqLogin 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)} 
        initialView={initialAuthView}
      />
    </>
  );
}

export default LandingPage;