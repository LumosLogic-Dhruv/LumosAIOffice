import { Link } from 'react-router-dom';

const PublicNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/logo.png" alt="AI Office" className="h-12 md:h-16 object-contain" />
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <a href="#features" className="text-gray-500 hover:text-gray-900 font-bold transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-500 hover:text-gray-900 font-bold transition-colors">How it Works</a>
              <a href="#pricing" className="text-gray-500 hover:text-gray-900 font-bold transition-colors">Pricing</a>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/login" className="text-gray-700 hover:text-black font-black uppercase text-sm tracking-widest">
              Login
            </Link>
            <Link 
              to="/register" 
              style={{ backgroundColor: '#714B67' }}
              className="text-white px-8 py-3 rounded-full font-black uppercase text-sm tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20"
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
