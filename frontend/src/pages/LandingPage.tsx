import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PublicNavbar from '../components/PublicNavbar';
import { 
  Sparkles, 
  FileText, 
  Shield, 
  Zap, 
  CheckCircle2, 
  History, 
  ArrowRight, 
  Smartphone, 
  Users, 
  Globe,
  Quote,
  ChevronDown
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Entrance
      const tl = gsap.timeline();
      tl.from(".hero-badge", { y: -50, opacity: 0, duration: 1, ease: "power4.out" })
        .from(".hero-title", { y: 100, opacity: 0, duration: 1.2, ease: "power4.out" }, "-=0.8")
        .from(".hero-desc", { y: 50, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.8")
        .from(".hero-btns", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
        .from(".hero-mockup", { scale: 0.8, opacity: 0, duration: 1.5, ease: "elastic.out(1, 0.5)" }, "-=1");

      // Floating Animation for Mockup
      gsap.to(".hero-mockup", {
        y: 20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // Bento Grid Stagger
      gsap.from(".bento-item", {
        scrollTrigger: {
          trigger: ".bento-grid",
          start: "top 80%",
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out"
      });

      // Section Headers Fade In
      gsap.utils.toArray('.section-header').forEach((header: any) => {
        gsap.from(header, {
          scrollTrigger: {
            trigger: header,
            start: "top 85%",
          },
          y: 40,
          opacity: 0,
          duration: 1,
          ease: "power3.out"
        });
      });

      // How it Works Steps
      gsap.from(".step-item", {
        scrollTrigger: {
          trigger: ".steps-container",
          start: "top 75%",
        },
        x: -50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.3,
        ease: "power2.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-white text-gray-900 overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-32 lg:pt-56 lg:pb-48 px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="hero-badge inline-flex items-center space-x-2 bg-primary/10 text-primary px-6 py-2.5 rounded-full mb-10 font-black text-sm uppercase tracking-widest border border-primary/10 shadow-sm">
            <Sparkles size={16} strokeWidth={3} />
            <span>AI-First Document OS</span>
          </div>
          
          <h1 className="hero-title text-6xl lg:text-9xl font-black mb-10 tracking-tight leading-[0.9] text-gray-900">
            Work Smarter. <br />
            <span style={{ color: '#714B67' }}>Generate Faster.</span>
          </h1>
          
          <p className="hero-desc text-xl lg:text-2xl text-gray-500 mb-14 max-w-3xl mx-auto leading-relaxed font-medium">
            The ultimate multi-tenant SaaS platform for automated business documentation. Professional, secure, and powered by Gemini 2.5 Flash.
          </p>
          
          <div className="hero-btns flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 mb-24">
            <Link 
              to="/register" 
              style={{ backgroundColor: '#714B67' }}
              className="w-full sm:w-auto px-12 py-6 text-white rounded-full font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-primary/30 flex items-center justify-center space-x-3 group"
            >
              <span>Get Started Now</span>
              <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
            </Link>
            <a 
              href="#features"
              className="w-full sm:w-auto px-12 py-6 border-2 border-gray-200 text-gray-900 rounded-full font-black text-xl hover:border-primary hover:text-primary transition-all flex items-center justify-center bg-white/50 backdrop-blur-md"
            >
              View Features
            </a>
          </div>

          <div className="hero-mockup w-full max-w-5xl bg-gray-50 rounded-[48px] p-4 shadow-2xl border border-gray-100 relative group">
             <div className="bg-white rounded-[40px] overflow-hidden shadow-inner aspect-[16/10] flex items-center justify-center border border-gray-100">
                {/* Visual Representation of Dashboard */}
                <div className="w-full h-full flex p-10 gap-6">
                   <div className="w-1/4 bg-gray-50 rounded-3xl animate-pulse" />
                   <div className="flex-1 flex flex-col gap-6">
                      <div className="h-1/4 bg-primary/5 rounded-3xl animate-pulse" />
                      <div className="flex-1 bg-gray-50 rounded-3xl animate-pulse" />
                   </div>
                </div>
             </div>
             {/* Floating UI Elements */}
             <div className="absolute -top-10 -right-10 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 hidden lg:block hover:-translate-y-2 transition-transform cursor-pointer">
                <div className="flex items-center space-x-3 mb-2">
                   <div className="w-3 h-3 rounded-full bg-green-500" />
                   <p className="text-xs font-black uppercase tracking-widest text-gray-400">Status</p>
                </div>
                <p className="text-lg font-black text-gray-900">PDF Synchronized</p>
             </div>
             <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 hidden lg:block hover:translate-y-2 transition-transform cursor-pointer">
                <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center font-black">AI</div>
                   <div>
                      <p className="text-sm font-black text-gray-900">Gemini 2.5 Flash</p>
                      <p className="text-xs font-bold text-gray-400">Processing live...</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 border-y border-gray-100">
         <div className="max-w-7xl mx-auto px-4">
            <p className="text-center text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-12">Trusted by scaling businesses across India</p>
            <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24 opacity-30 grayscale contrast-125">
               {['TechCorp', 'Lumos Logic', 'WashCure', 'TrueHolidays', 'DigitalEdge'].map(name => (
                 <span key={name} className="text-3xl font-black tracking-tighter">{name}</span>
               ))}
            </div>
         </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-32 px-4 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="section-header text-center mb-24">
            <h2 className="text-4xl lg:text-7xl font-black mb-6 tracking-tight">Built for Enterprise. <br /> Designed for Speed.</h2>
            <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">Everything you need to automate your office documentation in one unified platform.</p>
          </div>
          
          <div className="bento-grid grid grid-cols-1 md:grid-cols-6 grid-rows-2 gap-8 h-auto lg:h-[800px]">
            {/* Feature 1: AI Engine */}
            <div className="bento-item md:col-span-3 bg-white p-12 rounded-[48px] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-2xl transition-all cursor-pointer group">
               <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Zap size={32} strokeWidth={3} />
               </div>
               <div>
                  <h3 className="text-3xl font-black mb-4">Gemini 2.5 AI Engine</h3>
                  <p className="text-lg text-gray-500 font-medium leading-relaxed">Just describe your needs and let AI create structured sections, cost tables, and professional summaries in seconds.</p>
               </div>
            </div>

            {/* Feature 2: Multi-Tenant */}
            <div className="bento-item md:col-span-3 bg-gray-900 p-12 rounded-[48px] shadow-xl text-white flex flex-col justify-between hover:bg-black transition-all cursor-pointer group">
               <div className="w-16 h-16 bg-white/10 text-white rounded-3xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform">
                  <Shield size={32} />
               </div>
               <div>
                  <h3 className="text-3xl font-black mb-4">True Multi-Tenancy</h3>
                  <p className="text-lg text-white/60 font-medium leading-relaxed">Complete data isolation. Each company gets a dedicated dashboard, custom branding, and isolated document storage.</p>
               </div>
            </div>

            {/* Feature 3: PDF System */}
            <div className="bento-item md:col-span-2 bg-white p-12 rounded-[48px] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-2xl transition-all cursor-pointer group">
               <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-8 group-hover:translate-y-[-5px] transition-transform">
                  <FileText size={32} />
               </div>
               <div>
                  <h3 className="text-2xl font-black mb-3 text-gray-900">Instant PDF Sync</h3>
                  <p className="text-gray-500 font-bold leading-relaxed">Real-time Cloudinary updates. Your PDFs always reflect your latest manual or AI changes instantly.</p>
               </div>
            </div>

            {/* Feature 4: History */}
            <div className="bento-item md:col-span-2 bg-white p-12 rounded-[48px] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-2xl transition-all cursor-pointer group">
               <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-90 transition-transform">
                  <History size={32} />
               </div>
               <div>
                  <h3 className="text-2xl font-black mb-3 text-gray-900">Unlimited Versions</h3>
                  <p className="text-gray-500 font-bold leading-relaxed">Never lose a single change. View and restore any previous version of your documents with one click.</p>
               </div>
            </div>

            {/* Feature 5: Custom Branding */}
            <div className="bento-item md:col-span-2 bg-primary p-12 rounded-[48px] shadow-xl text-white flex flex-col justify-between hover:opacity-90 transition-all cursor-pointer group">
               <div className="w-16 h-16 bg-white/20 text-white rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Users size={32} />
               </div>
               <div>
                  <h3 className="text-2xl font-black mb-3">Custom Branding</h3>
                  <p className="text-white/70 font-bold leading-relaxed">Automatic logo and detail injection across all documents. Build trust with every download.</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-40 px-4">
        <div className="max-w-7xl mx-auto">
           <div className="flex flex-col lg:flex-row gap-24 items-center">
              <div className="flex-1 steps-container space-y-12">
                 <div className="section-header">
                    <h2 className="text-6xl font-black mb-8 tracking-tighter">Your workflow, <br /> re-imagined.</h2>
                    <p className="text-xl text-gray-500 font-medium leading-relaxed">Stop wasting hours on manual formatting. Follow our simple process to generate world-class documentation.</p>
                 </div>
                 <div className="space-y-10">
                    {[
                      { title: "Input Requirements", desc: "Type your needs in plain English or use our structured manual forms." },
                      { title: "AI Generation", desc: "Our Gemini 2.5 engine builds sections, tables, and branding instantly." },
                      { title: "Edit & Refine", desc: "Fine-tune with the AI Smart Editor or use our interactive manual mode." },
                      { title: "One-Click PDF", desc: "Download a professionally branded, high-contrast PDF ready for clients." }
                    ].map((step, idx) => (
                      <div key={idx} className="step-item flex items-start space-x-6">
                         <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20 shrink-0">
                            {idx + 1}
                         </div>
                         <div>
                            <h4 className="text-2xl font-black text-gray-900 mb-2">{step.title}</h4>
                            <p className="text-lg text-gray-500 font-medium leading-relaxed">{step.desc}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="flex-1 relative">
                 <div className="w-full aspect-square bg-primary/5 rounded-[64px] border border-primary/10 flex items-center justify-center overflow-hidden p-10">
                    <div className="w-full bg-white rounded-[40px] shadow-2xl p-10 border border-gray-100">
                        <div className="flex items-center space-x-4 mb-8">
                           <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Sparkles size={28} /></div>
                           <h5 className="text-2xl font-black">Processing...</h5>
                        </div>
                        <div className="space-y-6">
                           <div className="h-4 bg-gray-50 rounded-full w-full animate-pulse" />
                           <div className="h-4 bg-gray-50 rounded-full w-3/4 animate-pulse" />
                           <div className="h-20 bg-primary/5 rounded-3xl w-full animate-pulse" />
                           <div className="h-4 bg-gray-50 rounded-full w-1/2 animate-pulse" />
                        </div>
                    </div>
                 </div>
                 {/* Floating Badges */}
                 <div className="absolute top-10 -left-10 bg-green-500 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-xl animate-bounce">
                    100% Secure
                 </div>
                 <div className="absolute bottom-10 -right-10 bg-blue-500 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-xl delay-700 animate-bounce">
                    Real-time
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-gray-900 text-white px-4 overflow-hidden relative">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[200px] -z-0" />
         <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-24">
               <Quote size={80} className="mx-auto mb-10 text-primary opacity-50" strokeWidth={3} />
               <h2 className="text-5xl lg:text-7xl font-black tracking-tight max-w-4xl mx-auto leading-tight">"The most powerful document automation system I've used."</h2>
            </div>
            <div className="flex flex-col items-center">
               <div className="w-24 h-24 bg-primary rounded-3xl mb-6 shadow-2xl flex items-center justify-center font-black text-4xl">DL</div>
               <h4 className="text-2xl font-black">Dhruv Shere</h4>
               <p className="text-primary font-black uppercase tracking-widest text-sm mt-1">Founder, Lumos Logic</p>
            </div>
         </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-40 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="section-header text-center mb-24">
            <h2 className="text-6xl font-black mb-8 tracking-tighter">Ready to automate?</h2>
            <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">Start for free during our Beta phase and help us shape the future of office work.</p>
          </div>
          
          <div className="max-w-xl mx-auto bg-white border-2 border-gray-100 rounded-[48px] p-12 lg:p-20 shadow-2xl relative overflow-hidden group hover:border-primary transition-all duration-500">
             <div className="absolute top-0 right-0 bg-primary text-white text-xs font-black px-8 py-2 rounded-bl-3xl uppercase tracking-[0.2em]">Beta Access</div>
             
             <div className="mb-12">
                <h3 className="text-3xl font-black mb-2 text-gray-900 uppercase tracking-tight">The Everything Plan</h3>
                <p className="text-lg text-gray-400 font-bold">Standard features for early adopters</p>
             </div>
             
             <div className="flex items-baseline space-x-2 mb-12">
                <span className="text-8xl font-black text-gray-900 tracking-tighter">₹0</span>
                <span className="text-2xl font-black text-gray-400">/mo</span>
             </div>
             
             <ul className="space-y-6 mb-16">
               {[
                 "Unlimited AI Document Generations",
                 "All Document Types (Invoice, Quotation, NDA...)",
                 "Custom Branding & Logo Injection",
                 "Cloudinary Powered PDF Storage",
                 "Version History & Restoration",
                 "Priority Beta Support"
               ].map((item, idx) => (
                 <li key={idx} className="flex items-center space-x-4 text-gray-700 font-black text-lg">
                   <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={16} strokeWidth={3} />
                   </div>
                   <span>{item}</span>
                 </li>
               ))}
             </ul>
             
             <Link 
              to="/register" 
              style={{ backgroundColor: '#714B67' }}
              className="block w-full py-8 text-white rounded-[32px] font-black text-2xl hover:scale-105 transition-all shadow-2xl shadow-primary/30 text-center uppercase tracking-widest"
             >
               Start Free Trial
             </Link>
             
             <p className="mt-8 text-center text-gray-400 font-bold text-sm">No credit card required during Beta.</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-4 bg-gray-50/50">
         <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-black text-center mb-20 tracking-tight">Frequently Asked Questions</h2>
            <div className="space-y-8">
               {[
                 { q: "Is my data secure?", a: "Yes. We use multi-tenant isolation at the database level, ensuring your documents are only accessible to your company users." },
                 { q: "Can I use my own logo?", a: "Absolutely. Our branding engine automatically injects your logo and company details into every generated PDF." },
                 { q: "Which AI model do you use?", a: "We leverage the power of Google Gemini 2.5 Flash for rapid and accurate document generation." },
                 { q: "Can I restore deleted content?", a: "Our version history system tracks every update. You can view and restore any previous version of a document instantly." }
               ].map((faq, i) => (
                 <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h4 className="text-xl font-black text-gray-900 mb-4">{faq.q}</h4>
                    <p className="text-gray-500 font-medium leading-relaxed">{faq.a}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Footer */}
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
                   <li><a href="#features" className="text-gray-500 hover:text-primary font-black transition-colors">Features</a></li>
                   <li><a href="#how-it-works" className="text-gray-500 hover:text-primary font-black transition-colors">Workflow</a></li>
                   <li><a href="#pricing" className="text-gray-500 hover:text-primary font-black transition-colors">Pricing</a></li>
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
    </div>
  );
};

export default LandingPage;
