import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import Footer from "@/components/Footer";

export default function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50">
      <header className="bg-gradient-to-r from-pink-500 to-purple-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Terms and Conditions</h1>
          <p className="text-pink-100">Last updated: November 22, 2025</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <Card className="bg-white p-8 space-y-6">
          <p className="text-gray-700">
            These Terms and Conditions govern your use of this website and the purchase of products or services offered herein. By accessing or using this website, you agree to be bound by these terms. Please read them carefully.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. General Use</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>By using this website, you confirm that you are at least 18 years old or are using the website under the supervision of a parent or legal guardian.</li>
              <li>All content on this website is for informational purposes only and is subject to change without notice.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Responsibilities</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Users agree not to misuse the website by knowingly introducing viruses, trojans, or other malicious material.</li>
              <li>You must not attempt to gain unauthorized access to the server, database, or any part of the site.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Product & Service Descriptions</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>All efforts are made to ensure accuracy in product descriptions, images, pricing, and availability.</li>
              <li>However, we do not warrant that product descriptions or other content are complete, current, or error-free.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Order Acceptance & Cancellation</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Placing an order on this website does not constitute a confirmed order. We reserve the right to refuse or cancel any order for reasons including but not limited to product availability, pricing errors, or suspected fraud.</li>
              <li>Once placed, orders may not be canceled or modified unless otherwise stated in the return policy.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Pricing and Payment</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>All prices are displayed in INR or the local currency and are inclusive or exclusive of taxes as indicated.</li>
              <li>Payments must be made through secure and approved payment gateways. The website is not liable for any payment gateway errors.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>All text, graphics, logos, images, and other materials on this website are the intellectual property of their respective owners and protected by copyright and trademark laws.</li>
              <li>Unauthorized use or duplication of any materials is prohibited.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>We are not responsible for any indirect or consequential damages that may arise from the use or inability to use the website or the products purchased through it.</li>
              <li>Liability is limited to the value of the product purchased, if applicable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Modifications to Terms</h2>
            <p className="text-gray-700">
              These terms may be revised at any time without prior notice. Continued use of the site after changes implies acceptance of those changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Governing Law</h2>
            <p className="text-gray-700">
              These terms shall be governed by and construed in accordance with the laws of India.
            </p>
          </section>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
