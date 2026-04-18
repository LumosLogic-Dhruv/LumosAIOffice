import React from 'react';
import PublicNavbar from '../components/PublicNavbar';

const Terms = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PublicNavbar />
      <main className="max-w-4xl mx-auto pt-40 pb-20 px-6">
        <h1 className="text-5xl font-black text-primary mb-10 tracking-tight">Terms of Service</h1>
        
        <div className="space-y-8 text-lg text-gray-600 leading-relaxed font-medium">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900">1. Acceptance of Terms</h2>
            <p>
              By accessing or using AI Office Document Automation System, you agree to be bound by these Terms of Service. If you do not agree, you may not use our services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900">2. Account Responsibility</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900">3. Fair Use & AI Policy</h2>
            <p>
              Our service provides AI-powered document generation. While we strive for accuracy, AI-generated content should be reviewed for professional correctness. Abuse of AI generation capabilities (e.g., bot-driven mass generation) may result in account suspension.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900">4. Intellectual Property</h2>
            <p>
              All documents generated using our system belong to the company that created them. However, the system architecture, code, and AI prompts remain the property of AI Office.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900">5. Limitation of Liability</h2>
            <p>
              We are not liable for any damages resulting from the use or inability to use our services, including errors in AI-generated documents or data loss.
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

export default Terms;
