import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import Footer from "@/components/Footer";
import { RotateCcw, Package, CreditCard } from "lucide-react";

export default function Returns() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50">
      <header className="bg-gradient-to-r from-pink-500 to-purple-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Return & Refund Policy</h1>
          <p className="text-pink-100">Your satisfaction is our priority</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-white p-6 text-center">
            <Package className="h-12 w-12 text-pink-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">5 to 7 Working Days Return</h3>
            <p className="text-gray-700">Returns accepted within 5 to 7 working days</p>
          </Card>
          <Card className="bg-white p-6 text-center">
            <CreditCard className="h-12 w-12 text-pink-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">7 Working Days</h3>
            <p className="text-gray-700">Refund processed within 7 working days</p>
          </Card>
        </div>

        <Card className="bg-white p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Return Policy</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Returns are accepted within 5 to 7 working days for items.</li>
              <li>Items must be unused and returned in original packaging.</li>
              <li>Proof of damage (photo/video) may be required.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Refund Policy</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Approved Refunds will be credited to the original mode of payment within 7 working days after the returned item is received and inspected.</li>
              <li>Shipping charges are non-refundable.</li>
            </ul>
          </section>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
