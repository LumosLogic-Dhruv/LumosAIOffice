import { Link } from 'react-router-dom';
import { Globe, Smartphone } from 'lucide-react';

const PublicFooter = () => {
  return (
    <footer className="pt-32 pb-12 bg-white px-4 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
           <div className="md:col-span-2 space-y-8">
              <Link to="/" className="flex items-center">
                <img src="/logo.png" alt="AI Office" className="h-16 object-contain" />
              </Link>
              <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-sm">
                 The next-generation document automation platform for modern businesses. Build trust through precision.
              </p>
              <div className="flex space-x-6">
                 <a href="#" className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-primary transition-colors"><Globe size={24} /></a>
                 <a href="#" className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-primary transition-colors"><Smartphone size={24} /></a>
              </div>
           </div>
           <div>
              <h5 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-10">Product</h5>
              <ul className="space-y-6">
                 <li><a href="/#features" className="text-gray-500 hover:text-primary font-black transition-colors">Features</a></li>
                 <li><a href="/#how-it-works" className="text-gray-500 hover:text-primary font-black transition-colors">Workflow</a></li>
                 <li><a href="/#pricing" className="text-gray-500 hover:text-primary font-black transition-colors">Pricing</a></li>
              </ul>
           </div>
           <div>
              <h5 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-10">Company</h5>
              <ul className="space-y-6">
                 <li><Link to="/contact" className="text-gray-500 hover:text-primary font-black transition-colors">Contact Us</Link></li>
                 <li><Link to="/privacy" className="text-gray-500 hover:text-primary font-black transition-colors">Privacy Policy</Link></li>
                 <li><Link to="/terms" className="text-gray-500 hover:text-primary font-black transition-colors">Terms of Service</Link></li>
              </ul>
           </div>
        </div>
        <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-gray-400 font-bold text-sm uppercase tracking-widest gap-6">
          <p>© 2026 AI Office Automation. All rights reserved.</p>
          <div className="flex items-center space-x-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span>System Status: Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
