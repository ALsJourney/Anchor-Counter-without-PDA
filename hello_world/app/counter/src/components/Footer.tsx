import Link from "next/link";
const Footer = () => {
  return (
    <footer className="absolute bottom-0 m-4 rounded-lg bg-white shadow dark:bg-gray-800">
      <div className="mx-auto w-full max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400 sm:text-center">
          Made by{" "}
          <Link
            href="https://github.com/alsjourney"
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            ALsJourney
          </Link>
          <span> for </span>
          <Link
            href="https://thedogecapital.com"
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Doge Capital
          </Link>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
