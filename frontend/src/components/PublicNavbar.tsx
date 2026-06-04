import { Link } from 'react-router-dom';
import Logo from './Logo';

const PublicNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 py-4">
          <div className="flex items-center gap-10">
            <Link to="/">
              <Logo size="md" />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="/#features" className="text-sm text-gray-500 hover:text-gray-900 font-semibold transition-colors">Features</a>
              <a href="/#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 font-semibold transition-colors">How it Works</a>
              <a href="/#pricing" className="text-sm text-gray-500 hover:text-gray-900 font-semibold transition-colors">Pricing</a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
              Sign In
            </Link>
            <Link
              to="/register"
              style={{ backgroundColor: '#714B67' }}
              className="text-white text-sm px-6 py-2.5 rounded-lg font-bold hover:opacity-90 transition-all shadow-md"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
