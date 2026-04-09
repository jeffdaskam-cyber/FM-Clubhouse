import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-4xl font-bold text-gray-200 mb-2">404</h1>
      <p className="text-gray-500 mb-4">Page not found</p>
      <Link to="/" className="text-golf-green underline hover:text-fairway text-sm">
        Go to scoreboard
      </Link>
    </div>
  );
}
