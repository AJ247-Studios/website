import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          AJ247 Studios
        </Link>
        <div className="flex gap-6">
          <Link href="/" className="hover:text-gray-600 dark:hover:text-gray-400">
            Home
          </Link>
          <Link href="/portfolio" className="hover:text-gray-600 dark:hover:text-gray-400">
            Portfolio
          </Link>
          <Link href="/admin" className="hover:text-gray-600 dark:hover:text-gray-400">
            Admin
          </Link>
        </div>
      </nav>
    </header>
  );
}
