import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import { 
  Sparkles, 
  FileText, 
  Shield, 
  Zap, 
  History, 
  ArrowRight, 
  Smartphone, 
  Users, 
  Globe,
  Quote,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Entrance
      const tl = gsap.timeline();
      tl.from(".hero-badge", { y: -30, opacity: 0, duration: 0.8, ease: "power3.out" })
        .from(".hero-title", { y: 60, opacity: 0, duration: 1, ease: "power4.out" }, "-=0.5")
        .from(".hero-desc", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.7")
        .from(".hero-btns", { y: 20, opacity: 0, duration: 0.6, ease: "power3.out" }, "-=0.5")
        .from(".hero-mockup-wrapper", { y: 100, opacity: 0, duration: 1.2, ease: "power4.out" }, "-=0.8");

      // Floating Background Blobs
      gsap.to(".blob-1", {
        x: '30%',
        y: '20%',
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
      gsap.to(".blob-2", {
        x: '-20%',
        y: '-30%',
        duration: 15,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // Floating Animation for Mockup
      gsap.to(".hero-mockup", {
        y: -15,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // Bento Grid Stagger
      const bentoItems = gsap.utils.toArray('.bento-item');
      bentoItems.forEach((item: any) => {
        gsap.from(item, {
          scrollTrigger: {
            trigger: item,
            start: "top 90%",
            toggleActions: "play none none none"
          },
          y: 50,
          opacity: 0,
          duration: 1,
          ease: "power4.out"
        });
      });

      // Section Headers Fade In
      gsap.utils.toArray('.section-header').forEach((header: any) => {
        gsap.from(header, {
          scrollTrigger: {
            trigger: header,
            start: "top 90%",
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
          start: "top 80%",
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
      <section className="relative pt-48 pb-32 lg:pt-64 lg:pb-48 px-4 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
           <div className="blob-1 absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
           <div className="blob-2 absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="hero-badge inline-flex items-center space-x-3 bg-white border border-gray-100 px-6 py-2 rounded-full mb-12 shadow-xl shadow-primary/5">
            <div className="flex -space-x-2">
               {[1,2,3].map(i => (
                 <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200" />
               ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
               Trusted by <span className="text-primary">2,500+</span> teams
            </span>
            <div className="w-px h-4 bg-gray-200 mx-2" />
            <div className="flex items-center space-x-1 text-primary">
               <Sparkles size={14} fill="currentColor" />
               <span className="text-[10px] font-black uppercase tracking-widest">New: Gemini 2.5</span>
            </div>
          </div>
          
          <h1 className="hero-title text-7xl lg:text-[140px] font-black mb-12 tracking-[-0.04em] leading-[0.85] text-gray-900">
            Automate <br />
            <span style={{ color: '#714B67' }}>Everything.</span>
          </h1>
          
          <p className="hero-desc text-xl lg:text-2xl text-gray-500 mb-16 max-w-2xl mx-auto leading-relaxed font-bold">
            The intelligent document operating system. Stop manual formatting and start generating professional assets with AI.
          </p>
          
          <div className="hero-btns flex flex-col sm:flex-row items-center justify-center gap-6 mb-32">
            <Link 
              to="/register" 
              style={{ backgroundColor: '#714B67' }}
              className="w-full sm:w-auto px-14 py-7 text-white rounded-[24px] font-black text-xl hover:scale-105 hover:shadow-primary/40 transition-all shadow-2xl shadow-primary/20 flex items-center justify-center space-x-4 group"
            >
              <span>Get Started Free</span>
              <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
            </Link>
            <a 
              href="#features"
              className="w-full sm:w-auto px-14 py-7 border-2 border-gray-100 text-gray-900 rounded-[24px] font-black text-xl hover:bg-gray-50 transition-all flex items-center justify-center bg-white"
            >
              Learn More
            </a>
          </div>

          <div className="hero-mockup-wrapper w-full max-w-6xl relative perspective-1000">
            <div className="hero-mockup bg-white rounded-[40px] p-2 shadow-[0_50px_100px_-20px_rgba(113,75,103,0.3)] border border-gray-100 relative z-10">
               <div className="bg-gray-50 rounded-[32px] overflow-hidden border border-gray-100 aspect-[16/9] flex items-center justify-center">
                  <div className="w-full h-full flex flex-col p-8 gap-8">
                     <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                           <div className="w-3 h-3 rounded-full bg-red-400" />
                           <div className="w-3 h-3 rounded-full bg-yellow-400" />
                           <div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>
                        <div className="h-8 w-64 bg-white rounded-xl shadow-sm border border-gray-100" />
                     </div>
                     <div className="flex-1 flex gap-8">
                        <div className="w-1/4 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
                           <div className="h-4 w-full bg-gray-100 rounded-full" />
                           <div className="h-4 w-3/4 bg-gray-100 rounded-full" />
                           <div className="h-4 w-1/2 bg-gray-100 rounded-full" />
                        </div>
                        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-10 flex flex-col gap-6">
                           <div className="h-12 w-1/2 bg-primary/5 rounded-2xl" />
                           <div className="space-y-3">
                              <div className="h-3 w-full bg-gray-50 rounded-full" />
                              <div className="h-3 w-full bg-gray-50 rounded-full" />
                              <div className="h-3 w-3/4 bg-gray-50 rounded-full" />
                           </div>
                           <div className="mt-auto h-32 w-full bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center text-gray-300 font-black tracking-widest uppercase text-xs">Document Preview</div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            
            {/* Floating High-End UI Badges */}
            <div className="absolute -top-12 -left-12 bg-white/90 backdrop-blur-xl p-8 rounded-[32px] shadow-2xl border border-white/20 hidden lg:block hover:-translate-y-4 transition-transform duration-500 cursor-none pointer-events-none z-20">
               <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/30">
                     <Zap size={32} fill="currentColor" />
                  </div>
                  <div>
                     <p className="text-xl font-black text-gray-900 leading-tight">Instant <br /> Generation</p>
                     <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">0.8s Latency</p>
                  </div>
               </div>
            </div>

            <div className="absolute -bottom-16 -right-12 bg-gray-900 p-8 rounded-[32px] shadow-2xl border border-white/10 hidden lg:block hover:translate-y-4 transition-transform duration-500 cursor-none pointer-events-none z-20">
               <div className="flex items-center space-x-4">
                  <div className="text-right">
                     <p className="text-xl font-black text-white leading-tight">Cloud <br /> Secured</p>
                     <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">AES-256 Encrypted</p>
                  </div>
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                     <Shield size={32} />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 border-y border-gray-100">
         <div className="max-w-7xl mx-auto px-4">
            <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 mb-16">Powering modern workflows at world-class companies</p>
            <div className="flex flex-wrap justify-center items-center gap-16 lg:gap-32 opacity-20 grayscale transition-all hover:opacity-40">
               {['TechCorp', 'Lumos Logic', 'WashCure', 'TrueHolidays', 'DigitalEdge'].map(name => (
                 <span key={name} className="text-4xl font-black tracking-tighter">{name}</span>
               ))}
            </div>
         </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-32 px-4 bg-gray-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="section-header text-center mb-24">
            <h2 className="text-5xl lg:text-8xl font-black mb-6 tracking-tight text-gray-900 leading-[0.95]">Built for Teams. <br /> Optimized for Scale.</h2>
            <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">The only platform that combines enterprise security with the speed of Gemini 2.5 Flash.</p>
          </div>
          
          <div className="bento-grid grid grid-cols-1 md:grid-cols-6 grid-rows-2 gap-8 h-auto lg:h-[800px]">
            <div className="bento-item md:col-span-3 bg-white p-12 rounded-[48px] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-2xl transition-all cursor-pointer group">
               <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Zap size={32} strokeWidth={3} />
               </div>
               <div>
                  <h3 className="text-3xl font-black mb-4 text-gray-900">Gemini 2.5 AI Engine</h3>
                  <p className="text-lg text-gray-500 font-medium leading-relaxed">Just describe your needs and let AI create structured sections, cost tables, and professional summaries in seconds.</p>
               </div>
            </div>

            <div className="bento-item md:col-span-3 bg-gray-900 p-12 rounded-[48px] shadow-xl text-white flex flex-col justify-between hover:bg-black transition-all cursor-pointer group">
               <div className="w-16 h-16 bg-white/10 text-white rounded-3xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform">
                  <Shield size={32} />
               </div>
               <div>
                  <h3 className="text-3xl font-black mb-4">True Multi-Tenancy</h3>
                  <p className="text-lg text-white/60 font-medium leading-relaxed">Complete data isolation. Each company gets a dedicated dashboard, custom branding, and isolated document storage.</p>
               </div>
            </div>

            <div className="bento-item md:col-span-2 bg-white p-12 rounded-[48px] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-2xl transition-all cursor-pointer group">
               <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-8 group-hover:translate-y-[-5px] transition-transform">
                  <FileText size={32} />
               </div>
               <div>
                  <h3 className="text-2xl font-black mb-3 text-gray-900">Instant PDF Sync</h3>
                  <p className="text-gray-500 font-bold leading-relaxed">Real-time Cloudinary updates. Your PDFs always reflect your latest manual or AI changes instantly.</p>
               </div>
            </div>

            <div className="bento-item md:col-span-2 bg-white p-12 rounded-[48px] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-2xl transition-all cursor-pointer group">
               <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-90 transition-transform">
                  <History size={32} />
               </div>
               <div>
                  <h3 className="text-2xl font-black mb-3 text-gray-900">Unlimited Versions</h3>
                  <p className="text-gray-500 font-bold leading-relaxed">Never lose a single change. View and restore any previous version of your documents with one click.</p>
               </div>
            </div>

            <div className="bento-item md:col-span-2 bg-primary p-12 rounded-[48px] shadow-xl text-white flex flex-col justify-between hover:opacity-90 transition-all cursor-pointer group" style={{ backgroundColor: '#714B67' }}>
               <div className="w-16 h-16 bg-white/20 text-white rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Users size={32} />
               </div>
               <div>
                  <h3 className="text-2xl font-black mb-3 text-white">Custom Branding</h3>
                  <p className="text-white/70 font-bold leading-relaxed">Automatic logo and detail injection across all documents. Build trust with every download.</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-40 px-4">
        <div className="max-w-7xl mx-auto">
           <div className="flex flex-col lg:flex-row gap-32 items-center">
              <div className="flex-1 steps-container space-y-16">
                 <div className="section-header">
                    <h2 className="text-7xl font-black mb-8 tracking-tighter text-gray-900">Re-imagine <br /> your output.</h2>
                    <p className="text-xl text-gray-500 font-medium leading-relaxed">Stop wasting hours on manual formatting. Follow our zero-effort process to generate world-class assets.</p>
                 </div>
                 <div className="space-y-12">
                    {[
                      { title: "Input Requirements", desc: "Type your needs in plain English or use our structured manual forms." },
                      { title: "AI Generation", desc: "Our Gemini 2.5 engine builds sections, tables, and branding instantly." },
                      { title: "Edit & Refine", desc: "Fine-tune with the AI Smart Editor or use our interactive manual mode." },
                      { title: "One-Click PDF", desc: "Download a professionally branded, high-contrast PDF ready for clients." }
                    ].map((step, idx) => (
                      <div key={idx} className="step-item flex items-start space-x-8">
                         <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-primary/20 shrink-0" style={{ backgroundColor: '#714B67' }}>
                            {idx + 1}
                         </div>
                         <div>
                            <h4 className="text-3xl font-black text-gray-900 mb-2">{step.title}</h4>
                            <p className="text-lg text-gray-500 font-medium leading-relaxed">{step.desc}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="flex-1 relative">
                 <div className="w-full aspect-square bg-primary/5 rounded-[80px] border border-primary/10 flex items-center justify-center overflow-hidden p-12">
                    <div className="w-full bg-white rounded-[48px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] p-12 border border-gray-50">
                        <div className="flex items-center space-x-5 mb-10">
                           <div className="w-16 h-16 bg-primary/10 rounded-[20px] flex items-center justify-center text-primary"><Sparkles size={32} /></div>
                           <h5 className="text-3xl font-black">AI Processing...</h5>
                        </div>
                        <div className="space-y-8">
                           <div className="h-5 bg-gray-50 rounded-full w-full animate-pulse" />
                           <div className="h-5 bg-gray-50 rounded-full w-3/4 animate-pulse" />
                           <div className="h-24 bg-primary/5 rounded-[24px] w-full animate-pulse" />
                           <div className="h-5 bg-gray-50 rounded-full w-1/2 animate-pulse" />
                        </div>
                    </div>
                 </div>
                 <div className="absolute top-12 -left-12 bg-green-500 text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl animate-bounce">
                    100% Isolated
                 </div>
                 <div className="absolute bottom-12 -right-12 bg-blue-500 text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl delay-1000 animate-bounce">
                    Zero Latency
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-40 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="section-header mb-24">
            <h2 className="text-7xl font-black mb-8 tracking-tighter text-gray-900">Ready to start?</h2>
            <p className="text-2xl text-gray-400 font-bold max-w-2xl mx-auto leading-relaxed">Join the Beta phase and get full access for free.</p>
          </div>
          
          <div className="max-w-2xl mx-auto bg-white border-2 border-gray-100 rounded-[64px] p-16 lg:p-24 shadow-[0_80px_120px_-30px_rgba(113,75,103,0.15)] relative overflow-hidden group hover:border-primary transition-all duration-700">
             <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black px-10 py-3 rounded-bl-[24px] uppercase tracking-[0.3em]" style={{ backgroundColor: '#714B67' }}>Standard Beta</div>
             
             <div className="mb-16">
                <h3 className="text-4xl font-black mb-4 text-gray-900 uppercase tracking-tighter">Everything Included</h3>
                <p className="text-xl text-gray-400 font-bold">Limitless AI generations for early adopters</p>
             </div>
             
             <div className="flex items-baseline justify-center space-x-3 mb-16">
                <span className="text-9xl font-black text-gray-900 tracking-tighter">₹0</span>
                <span className="text-3xl font-black text-gray-400">/mo</span>
             </div>
             
             <ul className="space-y-8 mb-20 text-left max-w-md mx-auto">
               {[
                 "Unlimited AI Document Generations",
                 "Premium Cloudinary PDF Storage",
                 "Multi-tenant Data Isolation",
                 "Instant Restoration History",
                 "Custom Branding & Logo Injection"
               ].map((item, idx) => (
                 <li key={idx} className="flex items-center space-x-5 text-gray-800 font-black text-xl">
                   <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
                      <CheckCircle2 size={20} strokeWidth={4} />
                   </div>
                   <span className="tracking-tight">{item}</span>
                 </li>
               ))}
             </ul>
             
             <Link 
              to="/register" 
              style={{ backgroundColor: '#714B67' }}
              className="block w-full py-10 text-white rounded-[32px] font-black text-3xl hover:scale-105 transition-all shadow-2xl shadow-primary/40 text-center uppercase tracking-widest"
             >
               Create Account
             </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-40 px-4 bg-gray-50/50">
         <div className="max-w-4xl mx-auto">
            <h2 className="text-6xl font-black text-center mb-24 tracking-tighter text-gray-900">Common Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               {[
                 { q: "Is my data secure?", a: "Yes. We use multi-tenant isolation at the database level, ensuring your documents are only accessible to your company users." },
                 { q: "Can I use my own logo?", a: "Absolutely. Our branding engine automatically injects your logo and company details into every generated PDF." },
                 { q: "Which AI model do you use?", a: "We leverage the power of Google Gemini 2.5 Flash for rapid and accurate document generation." },
                 { q: "Can I restore changes?", a: "Our version history system tracks every update. You can view and restore any previous version of a document instantly." }
               ].map((faq, i) => (
                 <div key={i} className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                    <h4 className="text-2xl font-black text-gray-900 mb-6 leading-tight">{faq.q}</h4>
                    <p className="text-lg text-gray-500 font-medium leading-relaxed">{faq.a}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default LandingPage;
