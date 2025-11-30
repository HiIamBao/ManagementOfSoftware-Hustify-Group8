import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-[#121212] border-t border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header row with titles */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          <div className="col-span-2">
            <div className="items-center flex">
              <div className="w-8 h-8 bg-[#BF3131] rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">hu</span>
              </div>
              <div className="ml-2 flex items-center gap-0.5">
                <span className="font-bold text-[#b10000]">H</span>
                <span className="font-bold text-[#b10000]">u</span>
                <span className="font-bold text-[#b10000]">s</span>
                <span className="font-bold text-[#b10000]">t</span>
                <span className="font-bold text-[#b10000]">i</span>
                <span className="font-bold text-[#b10000]">f</span>
                <span className="font-bold text-[#b10000]">y</span>
              </div>
            </div>
          </div>
          <div className="col-span-5">
            <h3 className="font-medium text-gray-800 dark:text-white text-sm">
              Navigation
            </h3>
          </div>
          <div className="col-span-2">
            <h3 className="font-medium text-gray-800 dark:text-white text-sm">
              Fast access
            </h3>
          </div>
          <div className="col-span-3">
            <h3 className="font-medium text-gray-800 dark:text-white text-sm">
              Language
            </h3>
          </div>
        </div>

        {/* Content row with columns */}
        <div className="grid grid-cols-12 gap-4">
          {/* Column 1: Empty below logo */}
          <div className="col-span-2"></div>

          {/* Column 2: Navigation links in three columns - expanded to take more space */}
          <div className="col-span-5 grid grid-cols-3 gap-2">
            {/* First column */}
            <div>
              <ul className="space-y-2 list-none">
                <li className="list-none">
                  <Link
                    href="/about"
                    className="text-gray-600 dark:text-white text-[#BF3131] text-xs"
                  >
                    About
                  </Link>
                </li>
                <li className="list-none">
                  <Link
                    href="/careers"
                    className="text-gray-600 dark:text-white hover:text-[#BF3131] text-xs"
                  >
                    Careers
                  </Link>
                </li>
                <li className="list-none">
                  <Link
                    href="/advertising"
                    className="text-gray-600 dark:text-white hover:text-[#BF3131] text-xs"
                  >
                    Advertising
                  </Link>
                </li>
                <li className="list-none">
                  <Link
                    href="/small-business"
                    className="text-gray-600 dark:text-white hover:text-[#BF3131] text-xs"
                  >
                    Small Business
                  </Link>
                </li>
              </ul>
            </div>

            {/* Second column */}
            <div>
              <ul className="space-y-2 list-none">
                <li className="list-none">
                  <Link
                    href="/talent-solutions"
                    className="text-gray-600 dark:text-white hover:text-[#BF3131] text-xs"
                  >
                    Talent Solutions
                  </Link>
                </li>
                <li className="list-none">
                  <Link
                    href="/marketing-solutions"
                    className="text-gray-600 dark:text-white hover:text-[#BF3131] text-xs"
                  >
                    Marketing Solutions
                  </Link>
                </li>
                <li className="list-none">
                  <Link
                    href="/sales-solutions"
                    className="text-gray-600 dark:text-white hover:text-[#BF3131] text-xs"
                  >
                    Sales Solutions
                  </Link>
                </li>
                <li className="list-none">
                  <Link
                    href="/safety-center"
                    className="text-gray-600 dark:text-white hover:text-[#BF3131] text-xs"
                  >
                    Safety Center
                  </Link>
                </li>
              </ul>
            </div>

            {/* Third column */}
            <div>
              <ul className="space-y-2 list-none">
                <li className="list-none">
                  <Link
                    href="/community-guidelines"
                    className="text-gray-600 dark:text-white hover:text-[#BF3131] text-xs"
                  >
                    Community Guidelines
                  </Link>
                </li>
                <li className="list-none">
                  <Link
                    href="/privacy-terms"
                    className="text-gray-600 dark:text-white hover:text-[#BF3131] text-xs"
                  >
                    Privacy & Terms
                  </Link>
                </li>
                <li className="list-none">
                  <Link
                    href="/mobile-app"
                    className="text-gray-600 dark:text-white hover:text-[#BF3131] text-xs"
                  >
                    Mobile App
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 3: Fast access with buttons */}
          <div className="col-span-2">
            <button className="w-full bg-[#BF3131] dark:bg-[#7d0a0a] text-white text-xs font-medium rounded-md py-1.5 px-3 mb-2 flex items-center justify-between">
              QUESTIONS?
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
            <button className="w-full bg-white border border-[#B10000] text-[#B10000] text-xs font-medium rounded-md py-1.5 px-3 flex items-center justify-between">
              SETTINGS
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>

          {/* Column 4: Language selector */}
          <div className="col-span-3">
            <select className="block w-full bg-white dark:bg-[#7d0a0a] border border-gray-300 rounded-md py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:border-[#BF3131] focus:ring-[#BF3131]">
              <option>ENGLISH</option>
              <option>ESPAÑOL</option>
              <option>FRANÇAIS</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
