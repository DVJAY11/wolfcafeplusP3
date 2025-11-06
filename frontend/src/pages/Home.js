import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { FaInstagram, FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";

export default function Home() {
  const [msg, setMsg] = useState("");
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    api
      .get("/")
      .then((res) => setMsg(res.data.message))
      .catch(() => setMsg("Backend not reachable"));
  }, []);

  // 👇 add as many images as you want here
  const images = [
    "/gallery1.jpg",
    "/gallery2.jpg",
    "/gallery3.jpg",
    "/gallery4.jpg",
    "/gallery5.jpg",
    "/gallery6.jpg",
    "/gallery7.jpg",
    "/gallery1.jpg",
    "/gallery2.jpg",
    "/gallery3.jpg",
    "/gallery4.jpg",
    "/gallery5.jpg",
    "/gallery6.jpg",
    "/gallery7.jpg",
  ];

  return (
    <div className="w-full font-sans bg-black text-white">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center flex flex-col justify-center items-center text-center"
        style={{
          height: "75vh",
          backgroundImage:
            "url('https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1800&q=80')",
            backgroundAttachment: "fixed", // optional for a subtle parallax effect
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white tracking-tight">
            Smarter and Social AI-Powered Campus Ordering
            <span className="text-red-500">+</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-6">
            Revolutionizing campus dining with AI Powered Ordering
          </p>
          <Link
            to="/menu"
            className="bg-red-600 hover:bg-red-700 text-white text-lg font-semibold py-3 px-8 rounded-full transition"
          >
            ORDER NOW
          </Link>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="bg-gray-50 py-1">
        <div className="overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`gallery-${i}`}
              className="inline-block w-[300px] h-[250px] object-cover rounded-xl mx-1 cursor-pointer hover:opacity-80 transition"
              onClick={() => setLightbox(src)}
            />
          ))}
        </div>
      </section>

      {/* Lightbox Popup */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 flex justify-center items-center z-50"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="preview"
            className="max-w-[90%] max-h-[80%] rounded-lg shadow-lg"
          />
          <button
            className="absolute top-5 right-8 text-white text-4xl font-bold"
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Info Section */}
      <section className="bg-[#f7f3ed] text-black py-16 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-10">
          Order with Convenience.
        </h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-10 md:gap-20">
          <div>
            <h3 className="text-xl font-semibold mb-2">Location</h3>
            <p className="text-gray-700">
              123 University Ave,<br />
              Raleigh, State 12345
            </p>
          </div>
          <div className="hidden md:block h-16 w-px bg-gray-400"></div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Operating Hours</h3>
            <p className="text-gray-700">
              Mon - Fri: 7:30am - 8pm <br />
              Saturday - Sunday: 9am - 5pm
            </p>
          </div>
        </div>
      </section>

  {/* Footer */}
  <footer className="bg-black text-gray-300 py-10 text-center border-t border-gray-700">
    <h4 className="text-xl font-semibold text-white mb-4">WrikiCafe+</h4>
    <p className="text-gray-400 mb-3">
      📞 (919) 123-4567 &nbsp; | &nbsp; ✉️ wrikicafe@gmail.com
    </p>

  <div className="flex justify-center space-x-6 mt-4 text-2xl">
    <a
      href="https://instagram.com"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-red-500 transition"
    >
      <FaInstagram />
    </a>
    <a
      href="https://facebook.com"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-red-500 transition"
    >
      <FaFacebook />
    </a>
    <a
      href="https://twitter.com"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-red-500 transition"
    >
      <FaTwitter />
    </a>
    <a
      href="https://linkedin.com"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-red-500 transition"
    >
      <FaLinkedin />
    </a>
  </div>

  <p className="text-gray-500 text-sm mt-6">
    © {new Date().getFullYear()} WrikiCafe+. All rights reserved.
  </p>
</footer>

      <div className="text-center py-4 text-gray-400 text-sm">{msg}</div>
    </div>
  );
}