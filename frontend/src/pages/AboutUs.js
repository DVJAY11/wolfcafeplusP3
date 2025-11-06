import React from "react";
import { FaReact, FaNodeJs, FaCloud, FaGithub } from "react-icons/fa";
import { SiMongodb, SiTailwindcss } from "react-icons/si";

export default function About() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* 🌟 Hero Section */}
      <section className="bg-gradient-to-r from-red-100 via-rose-50 to-white py-20 text-center px-6">
        <h1 className="text-5xl font-extrabold text-red-700 mb-4 tracking-tight">
          WrikiCafe+ — A Smarter, More Social Campus Café Experience
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-700 leading-relaxed">
          Born at North Carolina State University, WrikiCafe+ is our vision for
          a campus where ordering food is not just convenient — it’s
          personalized, connected, and a little bit magical.  
        </p>
        <p className="text-sm mt-3 text-gray-500 italic">
          (“Wriki” comes from <em>vṛkī</em>, Sanskrit for <strong>she-wolf</strong> — a nod to the Wolfpack spirit 🐺)
        </p>
      </section>

      {/* 🌍 The Story */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">
              The Story Behind WrikiCafe+
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Every day, hundreds of students wait in line for coffee, meals, and
              snacks across campus — juggling classes, deadlines, and caffeine
              cravings. We asked ourselves: <em>why can’t this be smarter?</em>
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              WrikiCafe+ was born out of this question — a project for CSC 510 that
              evolved into a mission to make campus dining seamless, social, and
              intelligent. It’s more than a food-ordering system: it’s a re-imagined
              experience where every Wolfpack member feels connected.
            </p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=900&q=60"
            alt="Students in a cafe"
            className="rounded-2xl shadow-lg"
          />
        </div>
      </section>

      {/* ⚙️ What It Does */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            What WrikiCafe+ Offers
          </h2>
          <p className="max-w-3xl mx-auto text-gray-600 mb-8">
            Built on a robust MERN stack, WrikiCafe+ empowers <strong>Admins</strong> to
            manage menus and operations while <strong>Users</strong> enjoy personalized
            ordering, instant notifications, and a smoother pickup experience.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            <div className="p-6 border rounded-xl shadow-sm hover:shadow-md transition">
              <h3 className="font-semibold text-lg mb-2 text-red-600">
                Personalized Ordering
              </h3>
              <p className="text-gray-600">
                View curated recommendations and upcoming “Surprise Me” AI-based
                suggestions for your mood, schedule, or diet.
              </p>
            </div>
            <div className="p-6 border rounded-xl shadow-sm hover:shadow-md transition">
              <h3 className="font-semibold text-lg mb-2 text-red-600">
                Real-Time Updates
              </h3>
              <p className="text-gray-600">
                Receive instant notifications when your order is ready for pickup —
                no more waiting or guessing.
              </p>
            </div>
            <div className="p-6 border rounded-xl shadow-sm hover:shadow-md transition">
              <h3 className="font-semibold text-lg mb-2 text-red-600">
                Role-Based Management
              </h3>
              <p className="text-gray-600">
                Separate admin and user dashboards ensure smooth, secure access
                for staff and customers alike.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 💡 Vision & Future */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Our Vision for the Future
          </h2>
          <p className="max-w-3xl mx-auto text-gray-700 leading-relaxed">
            We’re building toward a platform that uses AI to anticipate student
            needs — recommending what to eat before you even think about it, 
            coordinating shared orders among friends, and ensuring accessibility
            for everyone on campus.
          </p>
        </div>
      </section>

      {/* 🧰 Tech Stack */}
      <section className="bg-gray-100 py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-gray-800 mb-8">Powered By</h2>
          <div className="flex flex-wrap justify-center gap-8 text-gray-700">
            <div className="flex flex-col items-center"><FaReact size={40} className="text-sky-500"/><p>React + Vite</p></div>
            <div className="flex flex-col items-center"><FaNodeJs size={40} className="text-green-600"/><p>Node · Express</p></div>
            <div className="flex flex-col items-center"><SiMongodb size={40} className="text-green-500"/><p>MongoDB Atlas</p></div>
            <div className="flex flex-col items-center"><SiTailwindcss size={40} className="text-cyan-500"/><p>Tailwind CSS</p></div>
            <div className="flex flex-col items-center"><FaCloud size={40} className="text-indigo-500"/><p>Cloudinary Storage</p></div>
            <div className="flex flex-col items-center"><FaGithub size={40} className="text-gray-600"/><p>GitHub Actions CI</p></div>
          </div>
        </div>
      </section>

      {/* 🧑‍💻 Team */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Meet the Team</h2>
          <p className="text-gray-600 mb-8">
            Three computer science students at NC State who decided to turn a class
            assignment into a living, evolving platform.
          </p>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { name: "Dhruva Kamble", github: "Dhruva0101" },
              { name: "Rishitha Ramesh", github: "RishithaRamesh" },
              { name: "Rujuta Budke", github: "Rujuta13" },
            ].map((member) => (
              <div key={member.github} className="p-6 rounded-xl border hover:shadow-md transition">
                <h3 className="font-semibold text-lg mb-2">{member.name}</h3>
                <a
                  href={`https://github.com/${member.github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  @{member.github}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 border-t text-sm text-gray-500">
        <p>© 2025 WrikiCafe+ Team 16 · North Carolina State University</p>
      </footer>
    </div>
  );
}