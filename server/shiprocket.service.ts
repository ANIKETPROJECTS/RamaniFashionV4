import axios from 'axios';

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

interface ShiprocketAuthResponse {
  token: string;
}

interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
  discount: number;
  tax: number;
  hsn: number;
}

interface ShiprocketOrderRequest {
  order_id: string;
  order_date: string;
  pickup_location: string;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  order_items: ShiprocketOrderItem[];
  payment_method: string;
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

interface ShiprocketOrderResponse {
  order_id: number;
  shipment_id: number;
  status: string;
  status_code: number;
  onboarding_completed_now: number;
  awb_code?: string;
  courier_company_id?: number;
  courier_name?: string;
}

interface ShiprocketCourierServiceability {
  courier_company_id: number;
  courier_name: string;
  freight_charge: number;
  cod_charge: number;
  total_charge: number;
  estimated_delivery_days: string;
  is_surface: boolean;
}

class ShiprocketService {
  private token: string | null = null;
  private tokenExpiry: number = 0;

  async getAuthToken(): Promise<string> {
    const now = Date.now();
    
    if (this.token && this.tokenExpiry > now) {
      return this.token;
    }

    try {
      const response = await axios.post<ShiprocketAuthResponse>(
        `${SHIPROCKET_BASE_URL}/auth/login`,
        {
          email: process.env.SHIPROCKET_API_EMAIL,
          password: process.env.SHIPROCKET_API_PASSWORD,
        }
      );

      this.token = response.data.token;
      this.tokenExpiry = now + (240 * 60 * 60 * 1000);

      console.log('✅ Shiprocket authentication successful');
      return this.token;
    } catch (error: any) {
      console.error('❌ Shiprocket authentication failed:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Shiprocket');
    }
  }

  async getCourierServiceability(
    pickupPincode: string,
    deliveryPincode: string,
    weight: number,
    cod: boolean = false
  ): Promise<ShiprocketCourierServiceability[]> {
    try {
      const token = await this.getAuthToken();
      
      const response = await axios.get(
        `${SHIPROCKET_BASE_URL}/courier/serviceability/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            pickup_postcode: pickupPincode,
            delivery_postcode: deliveryPincode,
            weight: weight,
            cod: cod ? 1 : 0,
          },
        }
      );

      return response.data.data.available_courier_companies || [];
    } catch (error: any) {
      console.error('❌ Failed to get courier serviceability:', error.response?.data || error.message);
      throw new Error('Failed to check courier serviceability');
    }
  }

  async createOrder(orderData: ShiprocketOrderRequest): Promise<ShiprocketOrderResponse> {
    try {
      console.log('\n🔐 Getting Shiprocket auth token...');
      const token = await this.getAuthToken();
      console.log('✅ Token obtained, creating order...');
      
      console.log('\n📨 Shiprocket API Request:');
      console.log('URL:', `${SHIPROCKET_BASE_URL}/orders/create/adhoc`);
      console.log('Order Data:', JSON.stringify(orderData, null, 2));
      
      const response = await axios.post(
        `${SHIPROCKET_BASE_URL}/orders/create/adhoc`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('\n✅ Shiprocket order created successfully!');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error('\n❌ SHIPROCKET ORDER CREATION FAILED');
      console.error('Error Response:', JSON.stringify(error.response?.data, null, 2));
      console.error('Error Message:', error.message);
      console.error('Status Code:', error.response?.status);
      throw new Error(error.response?.data?.message || 'Failed to create Shiprocket order');
    }
  }

  async assignAWB(shipmentId: number, courierId?: number): Promise<any> {
    try {
      const token = await this.getAuthToken();
      
      const payload: any = {
        shipment_id: shipmentId,
      };

      if (courierId) {
        payload.courier_id = courierId;
      }

      const response = await axios.post(
        `${SHIPROCKET_BASE_URL}/courier/assign/awb`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ AWB assigned:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to assign AWB:', error.response?.data || error.message);
      throw new Error('Failed to assign AWB');
    }
  }

  async schedulePickup(shipmentId: number): Promise<any> {
    try {
      const token = await this.getAuthToken();
      
      const response = await axios.post(
        `${SHIPROCKET_BASE_URL}/courier/generate/pickup`,
        {
          shipment_id: [shipmentId],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Pickup scheduled:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to schedule pickup:', error.response?.data || error.message);
      throw new Error('Failed to schedule pickup');
    }
  }

  async generateLabel(shipmentIds: number[]): Promise<{ label_url: string }> {
    try {
      const token = await this.getAuthToken();
      
      const response = await axios.post(
        `${SHIPROCKET_BASE_URL}/courier/generate/label`,
        {
          shipment_id: shipmentIds,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Label generated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to generate label:', error.response?.data || error.message);
      throw new Error('Failed to generate shipping label');
    }
  }

  async trackShipment(awbCode: string): Promise<any> {
    try {
      const token = await this.getAuthToken();
      
      const response = await axios.get(
        `${SHIPROCKET_BASE_URL}/courier/track/awb/${awbCode}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to track shipment:', error.response?.data || error.message);
      throw new Error('Failed to track shipment');
    }
  }
}

export const shiprocketService = new ShiprocketService();
