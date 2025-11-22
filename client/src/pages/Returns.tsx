import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import Footer from "@/components/Footer";
import { RotateCcw } from "lucide-react";

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
        <div className="grid md:grid-cols-1 gap-6 mb-12">
          <Card className="bg-white p-6 text-center">
            <RotateCcw className="h-12 w-12 text-pink-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Return & Refund Policy</h3>
            <p className="text-gray-700">Please contact us for return and refund information</p>
          </Card>
        </div>

        <Card className="bg-white p-8 space-y-6">
          <section>
            <p className="text-gray-700">
              For information about returns and refunds, please contact our customer service team.
            </p>
          </section>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
