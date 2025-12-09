export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>&copy; {currentYear} AJ247 Studios. All rights reserved.</p>
      </div>
    </footer>
  );
}
