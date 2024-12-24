import Link from "next/link";
import { UploadButton } from "~/app/_components/UploadButton";
import { api } from "~/trpc/server";

export default async function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center bg-gradient-to-b from-black to-gray-800 text-white">
      {/* Header Section */}
      <header className="w-full py-4 bg-opacity-50 bg-black flex justify-between items-center px-4 fixed top-0 left-0 z-10">
        {/* Menu Top Left */}
        <button className="text-white focus:outline-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 7.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
            />
          </svg>
        </button>

        {/* Title Center */}

        {/* Profile Button Top Right */}
        <button className="text-white focus:outline-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 18a8.25 8.25 0 1115 0H4.5z"
            />
          </svg>
        </button>
      </header>

      {/* Banner Section */}
      <div className="w-full h-[50vh] bg-purple-700 flex items-center justify-center relative mt-[60px]"> {/* Adjust for fixed navbar */}
        <div className="absolute inset-0 w-full h-full bg-black opacity-50"></div>
        <img
          src="/2024tcsnycm.png"
          alt="Banner Image"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Title with improved visibility */}
        <h2 className="text-5xl font-bold text-white z-10 relative px-4 py-2 bg-black bg-opacity-60 rounded-md shadow-lg">
          NY Marathon 2024
        </h2>
      </div>

      {/* Navbar Section Below the Banner with Transparent Background */}
      <div className="w-full flex items-center justify-start py-4 mt-4 border-l-4 border-white">
        <div className="w-full max-w-screen-xl flex items-center justify-start space-x-8 pl-4">
          {/* Navbar Links */}
          <Link href="#" className="text-white text-lg hover:text-gray-400">Home</Link>
          <Link href="#" className="text-white text-lg hover:text-gray-400">Info</Link>
          <Link href="#" className="text-white text-lg hover:text-gray-400">Contact</Link>
        </div>
      </div>

      {/* Main Content Section */}
      <section className="container mx-auto flex-1 flex flex-col items-center justify-center px-4 text-center mt-4">
        <p className="text-lg max-w-prose mb-12">
         By uploading a picture of yourself to our service, we can create a personalized video highlighting all the moments where you appear during the marathon.
        </p>
        <UploadButton />
      </section>


      {/* Footer Section */}
      <footer className="w-full py-4 bg-opacity-50 bg-black text-center">
        <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Relivo. All rights reserved.</p>
      </footer>
    </main>
  );
}
