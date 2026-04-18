import React from 'react';
import PublicNavbar from '../components/PublicNavbar';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PublicNavbar />
      <main className="max-w-4xl mx-auto pt-40 pb-20 px-6">
        <h1 className="text-5xl font-black text-primary mb-10 tracking-tight">Privacy Policy</h1>
        
        <div className="space-y-8 text-lg text-gray-600 leading-relaxed font-medium">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when you register for an account, create or modify your profile, or use our services. This includes company name, email address, logo, and document data.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900">2. How We Use Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services, including to generate AI-powered documents and store your document history securely. We utilize Cloudinary for image and PDF storage and MongoDB Atlas for data management.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900">3. Data Isolation</h2>
            <p>
              Our multi-tenant architecture ensures that your data is strictly isolated from other companies. Each company has its own dedicated data scope, and we implement rigorous security measures to prevent unauthorized access.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900">4. AI Processing</h2>
            <p>
              We use Google Gemini AI models to process your raw input and generate structured document data. By using our service, you agree to the processing of your data by these AI models as described in our workflows.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at hello@lumoslogic.com.
            </p>
          </section>
        </div>
      </main>

      <footer className="py-12 bg-gray-50 border-t border-gray-100 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-gray-500">
          <div className="text-2xl font-bold text-primary mb-4 md:mb-0">AI Office</div>
          <p>© 2026 AI Office Automation. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Privacy;
