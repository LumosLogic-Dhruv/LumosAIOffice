import { Link } from 'react-router-dom';
import Logo from './Logo';

const PublicFooter = () => {
  return (
    <footer className="pt-20 pb-10 bg-white border-t border-gray-100 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2 space-y-6">
            <Link to="/">
              <Logo size="lg" />
            </Link>
            <p className="text-gray-400 font-medium leading-relaxed max-w-sm text-sm">
              The next-generation AI document automation platform for modern businesses. Generate, edit, and deliver professional documents in seconds.
            </p>
          </div>

          <div>
            <h5 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-6">Product</h5>
            <ul className="space-y-4">
              <li><a href="/#features" className="text-sm text-gray-500 hover:text-gray-900 font-semibold transition-colors">Features</a></li>
              <li><a href="/#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 font-semibold transition-colors">Workflow</a></li>
              <li><a href="/#pricing" className="text-sm text-gray-500 hover:text-gray-900 font-semibold transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-6">Company</h5>
            <ul className="space-y-4">
              <li><Link to="/contact" className="text-sm text-gray-500 hover:text-gray-900 font-semibold transition-colors">Contact Us</Link></li>
              <li><Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-900 font-semibold transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-gray-500 hover:text-gray-900 font-semibold transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400 font-semibold uppercase tracking-widest">
          <p>© 2026 DocuFlow AI. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
