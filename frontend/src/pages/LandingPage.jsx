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

      <div className="noq-page">
        <div
          className="noq-hero w-full mx-auto py-4 px-8 h-[100vh] grid sm:grid-cols-2 items-center gap-10"
          id="home"
        >
          <div>
            <h1 className="font-bold text-3xl py-5">Welcome to NoQ</h1>

            <p className="py-2">Queue smarter, not longer</p>

            <p className="py-2">
              Book your spot online, track your turn in real time, and walk in
              only when you're called. No more waiting in line.
            </p>

            <div className="flex gap-4 py-4">
              <button
                className="noq-btn noq-btn-primary"
                onClick={() => openAuth("signup")}
              >
                Get a Token
              </button>

              <button
                className="noq-btn noq-btn-secondary"
                onClick={() => openAuth("login")}
              >
                Check Queue Status
              </button>
            </div>
          </div>

          <div className="noq-ticket-box" id="ticket-box">
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

            <div className="noq-button-track">
              <button onClick={() => openAuth("login")}>
                Enter a token number to track
              </button>
            </div>
          </div>
        </div>

        <div
          className="noq-services grid gap-4 w-full mx-auto scroll-mt-[56px]"
          id="services"
        >
          <p>Available Services</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="noq-service-card">
              <p className="noq-service-image">1</p>
              <p>Choose a service</p>
              <p>
                Pick the service you need and see real-time wait times before
                you book.
              </p>
            </div>

            <div className="noq-service-card">
              <p className="noq-service-image">2</p>
              <p>Get your token</p>
              <p>
                Receive a digital token instantly via SMS or on screen. No
                printing needed.
              </p>
            </div>

            <div className="noq-service-card">
              <p className="noq-service-image">3</p>
              <p>Track your turn</p>
              <p>
                Monitor your position live from anywhere. Get notified as your
                turn approaches.
              </p>
            </div>

            <div className="noq-service-card">
              <p className="noq-service-image">4</p>
              <p>Walk in &amp; be served</p>
              <p>
                Arrive when it's your turn. Head straight to the counter — no
                waiting around.
              </p>
            </div>
          </div>
        </div>

        <div
          className="noq-how-it-works grid gap-4 w-full mx-auto"
          id="how-it-works"
        >
          <p className="font-bold">How It Works</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="noq-step-card">
              <p className="noq-step">1</p>
              <div className="py-5">
                <p className="font-bold">Choose a service</p>
                <p>
                  Pick the service you need and see real-time wait times before
                  you book.
                </p>
              </div>
            </div>

            <div className="noq-step-card">
              <p className="noq-step">2</p>
              <div className="py-5">
                <p className="font-bold">Get your token</p>
                <p>
                  Receive a digital token instantly via SMS or on screen. No
                  printing needed.
                </p>
              </div>
            </div>

            <div className="noq-step-card">
              <p className="noq-step">3</p>
              <div className="py-5">
                <p className="font-bold">Track your turn</p>
                <p>
                  Monitor your position live from anywhere. Get notified as your
                  turn approaches.
                </p>
              </div>
            </div>

            <div className="noq-step-card">
              <p className="noq-step">4</p>
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
            className="noq-btn noq-btn-primary"
            onClick={() => openAuth("signup")}
          >
            Get a Token
          </button>
        </div>

        <div id="contact" className="noq-contact grid sm:grid-cols-2">
          <div className="noq-contact-text">
            <p className="font-bold">Contact us</p>
            <p>
              Have questions or need help? Reach out to our support team — we're
              here to assist with bookings, queue setup, or any issues you run
              into.
            </p>
          </div>

          <div className="noq-contact-form">
            <form onSubmit={(e) => e.preventDefault()}>
              <div>
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" />
              </div>

              <div>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" />
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
                <button className="noq-send">Send</button>
              </div>
            </form>
          </div>
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
