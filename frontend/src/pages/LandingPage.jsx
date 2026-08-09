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
        {/* ===== Hero Section ===== */}
        <section
          className="noq-hero w-full mx-auto py-12 px-6 min-h-[90vh] grid sm:grid-cols-2 items-center gap-10"
          id="home"
        >
          <div>
            <h1 className="font-bold text-4xl sm:text-5xl py-3">
              Welcome to NoQ
            </h1>
            <p className="noq-subheading font-semibold text-xl sm:text-2xl py-2">
              Queue smarter, not longer
            </p>
            <p className="py-3 text-base">
              Book your spot online, track your turn in real time, and walk in
              only when you're called. No more waiting in line.
            </p>

            <div className="flex flex-wrap gap-4 py-4">
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
        </section>

        {/* ===== Available Services ===== */}
        <section
          className="noq-services grid gap-6 w-full mx-auto scroll-mt-[70px]"
          id="services"
        >
          <h2 className="section-title">Available Services</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="noq-service-card">
              <div className="noq-service-image">1</div>
              <div>
                <p className="font-bold">Hospital</p>
                <p>
                  Book a token for OPD, doctor appointments, laboratory tests,
                  pharmacy, and billing without waiting in long queues.
                </p>
              </div>
            </div>

            <div className="noq-service-card">
              <div className="noq-service-image">2</div>
              <div>
                <p className="font-bold">Bank</p>
                <p>
                  Get a token for cash deposits, withdrawals, account opening,
                  KYC updates, and other banking services without standing in
                  line.
                </p>
              </div>
            </div>

            <div className="noq-service-card">
              <div className="noq-service-image">3</div>
              <div>
                <p className="font-bold">Government Office</p>
                <p>
                  Book a token for citizenship, passport, national ID, driving
                  license, document verification, and other public services.
                </p>
              </div>
            </div>

            <div className="noq-service-card">
              <div className="noq-service-image">4</div>
              <div>
                <p className="font-bold">College / University</p>
                <p>
                  Take a token for admission, exam forms, fee payment,
                  transcripts, certificates, and scholarship-related services
                  without waiting in long queues.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== How It Works ===== */}
        <section
          className="noq-how-it-works grid gap-6 w-full mx-auto scroll-mt-[70px]"
          id="how-it-works"
        >
          <h2 className="section-title font-bold">How It Works</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="noq-step-card">
              <span className="noq-step">1</span>
              <div>
                <p className="font-bold">Choose a service</p>
                <p>
                  Pick the service you need and see real-time wait times before
                  you book.
                </p>
              </div>
            </div>

            <div className="noq-step-card">
              <span className="noq-step">2</span>
              <div>
                <p className="font-bold">Get your token</p>
                <p>
                  Receive a digital token instantly via SMS or on screen. No
                  printing needed.
                </p>
              </div>
            </div>

            <div className="noq-step-card">
              <span className="noq-step">3</span>
              <div>
                <p className="font-bold">Track your turn</p>
                <p>
                  Monitor your position live from anywhere. Get notified as your
                  turn approaches.
                </p>
              </div>
            </div>

            <div className="noq-step-card">
              <span className="noq-step">4</span>
              <div>
                <p className="font-bold">Walk in &amp; be served</p>
                <p>
                  Arrive when it's your turn. Head straight to the counter — no
                  waiting around.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-start">
            <button
              className="noq-btn noq-btn-primary"
              onClick={() => openAuth("signup")}
            >
              Get a Token
            </button>
          </div>
        </section>

        {/* ===== Contact Section ===== */}
        <section id="contact" className="noq-contact scroll-mt-[70px]">
          <div className="noq-contact-text">
            <h2 className="font-bold text-3xl">Contact us</h2>
            <p>
              Have questions or need help? Reach out to our support team — we're
              here to assist with bookings, queue setup, or any issues you run
              into.
            </p>

            <div className="noq-contact-image">
              <img
                src="https://images.unsplash.com/photo-1534536281715-e28d76689b4d?q=80&w=800&auto=format&fit=crop"
                alt="Contact Support"
              />
            </div>
          </div>

          <div className="noq-contact-form">
            <form onSubmit={(e) => e.preventDefault()}>
              <div>
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Your email address"
                />
              </div>

              <div>
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  cols="30"
                  rows="4"
                  placeholder="Enter your message"
                ></textarea>
                <button type="submit" className="noq-send">
                  Send
                </button>
              </div>
            </form>
          </div>
        </section>
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
