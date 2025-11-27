import axios from 'axios';
import crypto from 'crypto';

class PhonePeService {
  private static instance: PhonePeService;
  private merchantId: string;
  private saltKey: string;
  private saltIndex: string;
  private baseUrl: string;

  private constructor() {
    this.merchantId = process.env.PHONEPE_MERCHANT_ID || '';
    this.saltKey = process.env.PHONEPE_SALT_INDEX || '';
    this.saltIndex = process.env.PHONEPE_SALT_KEY || '1';
    
    if (!this.merchantId || !this.saltKey) {
      throw new Error('PhonePe credentials are missing. Please set PHONEPE_MERCHANT_ID and PHONEPE_SALT_INDEX');
    }

    const phonepeMode = process.env.PHONEPE_MODE || 'PRODUCTION';
    
    if (phonepeMode === 'SANDBOX') {
      this.baseUrl = 'https://api-preprod.phonepe.com/apis/pg-sandbox';
    } else {
      this.baseUrl = 'https://api.phonepe.com/apis/hermes';
    }
    
    console.log(`✅ PhonePe API initialized successfully in ${phonepeMode} mode`);
    console.log(`   Merchant ID: ${this.merchantId}`);
    console.log(`   Base URL: ${this.baseUrl}`);
  }

  public static getInstance(): PhonePeService {
    if (!PhonePeService.instance) {
      PhonePeService.instance = new PhonePeService();
    }
    return PhonePeService.instance;
  }

  private generateChecksum(base64Payload: string, endpoint: string): string {
    const stringToHash = base64Payload + endpoint + this.saltKey;
    const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
    return `${sha256Hash}###${this.saltIndex}`;
  }

  private generateStatusChecksum(endpoint: string): string {
    const stringToHash = endpoint + this.saltKey;
    const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
    return `${sha256Hash}###${this.saltIndex}`;
  }

  async initiatePayment(params: {
    merchantOrderId: string;
    amount: number;
    redirectUrl: string;
    callbackUrl?: string;
    mobileNumber?: string;
    udf1?: string;
    udf2?: string;
    udf3?: string;
    udf4?: string;
    udf5?: string;
  }) {
    try {
      const paymentPayload: any = {
        merchantId: this.merchantId,
        merchantTransactionId: params.merchantOrderId,
        merchantUserId: `MUID_${Date.now()}`,
        amount: params.amount,
        redirectUrl: params.redirectUrl,
        redirectMode: 'POST',
        callbackUrl: params.callbackUrl || params.redirectUrl,
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };

      if (params.mobileNumber) {
        paymentPayload.mobileNumber = params.mobileNumber;
      }

      const payloadString = JSON.stringify(paymentPayload);
      const base64Payload = Buffer.from(payloadString).toString('base64');

      const endpoint = '/pg/v1/pay';
      const checksum = this.generateChecksum(base64Payload, endpoint);

      const response = await axios({
        method: 'POST',
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'accept': 'application/json'
        },
        data: {
          request: base64Payload
        }
      });

      if (response.data.success) {
        return {
          success: true,
          redirectUrl: response.data.data?.instrumentResponse?.redirectInfo?.url,
          orderId: params.merchantOrderId,
          state: response.data.code,
          data: response.data.data
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Payment initiation failed',
          code: response.data.code
        };
      }
    } catch (error: any) {
      console.error('PhonePe payment initiation error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to initiate payment',
      };
    }
  }

  async checkOrderStatus(merchantOrderId: string) {
    try {
      const endpoint = `/pg/v1/status/${this.merchantId}/${merchantOrderId}`;
      const checksum = this.generateStatusChecksum(endpoint);

      const response = await axios({
        method: 'GET',
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': this.merchantId,
          'accept': 'application/json'
        }
      });

      const paymentData = response.data;

      return {
        success: paymentData.success,
        state: paymentData.code,
        orderId: merchantOrderId,
        amount: paymentData.data?.amount,
        paymentDetails: paymentData.data,
        transactionId: paymentData.data?.transactionId,
        paymentInstrument: paymentData.data?.paymentInstrument
      };
    } catch (error: any) {
      console.error('PhonePe order status check error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to check order status',
      };
    }
  }

  async initiateRefund(params: {
    merchantRefundId: string;
    merchantOrderId: string;
    amount: number;
  }) {
    try {
      const refundPayload = {
        merchantId: this.merchantId,
        merchantUserId: `MUID_${Date.now()}`,
        originalTransactionId: params.merchantOrderId,
        merchantTransactionId: params.merchantRefundId,
        amount: params.amount,
        callbackUrl: process.env.HOST_URL ? `${process.env.HOST_URL}/api/payment/refund-callback` : undefined
      };

      const payloadString = JSON.stringify(refundPayload);
      const base64Payload = Buffer.from(payloadString).toString('base64');

      const endpoint = '/pg/v1/refund';
      const checksum = this.generateChecksum(base64Payload, endpoint);

      const response = await axios({
        method: 'POST',
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'accept': 'application/json'
        },
        data: {
          request: base64Payload
        }
      });

      if (response.data.success) {
        return {
          success: true,
          state: response.data.code,
          refundId: params.merchantRefundId,
          amount: params.amount,
          data: response.data.data
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Refund initiation failed',
          code: response.data.code
        };
      }
    } catch (error: any) {
      console.error('PhonePe refund initiation error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to initiate refund',
      };
    }
  }

  async checkRefundStatus(merchantRefundId: string) {
    try {
      const endpoint = `/pg/v1/status/${this.merchantId}/${merchantRefundId}`;
      const checksum = this.generateStatusChecksum(endpoint);

      const response = await axios({
        method: 'GET',
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': this.merchantId,
          'accept': 'application/json'
        }
      });

      return {
        success: response.data.success,
        state: response.data.code,
        refundId: merchantRefundId,
        amount: response.data.data?.amount,
        refundDetails: response.data.data,
      };
    } catch (error: any) {
      console.error('PhonePe refund status check error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to check refund status',
      };
    }
  }

  validateCallback(requestBody: any) {
    try {
      if (requestBody.response) {
        const decodedResponse = Buffer.from(requestBody.response, 'base64').toString('utf-8');
        const parsedResponse = JSON.parse(decodedResponse);
        
        return {
          success: true,
          isValid: true,
          data: parsedResponse,
        };
      }
      
      return {
        success: true,
        isValid: true,
        data: requestBody,
      };
    } catch (error: any) {
      console.error('PhonePe callback validation error:', error);
      return {
        success: false,
        isValid: false,
        error: error.message || 'Failed to validate callback',
      };
    }
  }

  getMerchantId(): string {
    return this.merchantId;
  }
}

export const phonePeService = PhonePeService.getInstance();
