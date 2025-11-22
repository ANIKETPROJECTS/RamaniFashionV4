import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import Footer from "@/components/Footer";

export default function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50">
      <header className="bg-gradient-to-r from-pink-500 to-purple-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-pink-100">Last updated: November 22, 2025</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <Card className="bg-white p-8 space-y-6">
          <p className="text-gray-700">
            This Privacy Policy outlines how personal information is collected, used, and safeguarded when you interact with this website. By accessing or using the website, you agree to the practices described below.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 mb-3">We may collect the following types of information:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Personal Information:</strong> Name, phone number, email address, billing/shipping address.</li>
              <li><strong>Payment Information:</strong> Used to process orders securely through third-party payment gateways.</li>
              <li><strong>Technical Information:</strong> IP address, browser type, device information, and usage data via cookies or similar technologies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>To process and deliver orders.</li>
              <li>To send transactional communications such as order updates or shipping alerts.</li>
              <li>To respond to customer inquiries or service requests.</li>
              <li>To improve website functionality, services, and user experience.</li>
              <li>For marketing purposes (only with your explicit consent).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Sharing</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>We do not sell, rent, or trade your personal data.</li>
              <li>We may share necessary information with third-party service providers such as payment gateways, delivery partners, or IT service providers only to fulfill your order or maintain the website.</li>
              <li>Personal information may be disclosed if required by law or legal proceedings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>We implement reasonable security measures to protect your data from unauthorized access, alteration, or disclosure.</li>
              <li>However, no online transmission is 100% secure. You acknowledge this risk when using the site.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookies and Tracking Technologies</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Cookies are used to personalize your experience, analyze site traffic, and provide relevant ads.</li>
              <li>You can manage or disable cookies via your browser settings, although this may affect site functionality.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Third-Party Links</h2>
            <p className="text-gray-700">
              This website may contain links to third-party websites. We are not responsible for the privacy practices or content of those websites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>You may request access to or correction of your personal data.</li>
              <li>You may opt out of marketing communications at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Changes to This Policy</h2>
            <p className="text-gray-700">
              This privacy policy may be updated periodically. Continued use of the website after changes indicates acceptance of the revised policy.
            </p>
          </section>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
