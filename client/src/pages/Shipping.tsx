import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import Footer from "@/components/Footer";
import { Truck, Clock } from "lucide-react";

export default function Shipping() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50">
      <header className="bg-gradient-to-r from-pink-500 to-purple-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Shipping Policy</h1>
          <p className="text-pink-100">Fast and Reliable Delivery</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-white p-6 text-center">
            <Clock className="h-12 w-12 text-pink-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Standard Delivery</h3>
            <p className="text-gray-700">5-7 business days</p>
          </Card>
          <Card className="bg-white p-6 text-center">
            <Truck className="h-12 w-12 text-pink-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Express Delivery</h3>
            <p className="text-gray-700">2-3 business days</p>
          </Card>
        </div>

        <Card className="bg-white p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Processing</h2>
            <p className="text-gray-700">
              Orders are typically processed within 1–3 business days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Time</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Standard:</strong> 5-7 business days</li>
              <li><strong>Express:</strong> 2-3 business days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Tracking</h2>
            <p className="text-gray-700">
              Tracking details are shared once the order is shipped.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Delays</h2>
            <p className="text-gray-700">
              The business is not responsible for delays due to courier services or unforeseen circumstances.
            </p>
          </section>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
