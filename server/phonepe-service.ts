import { StandardCheckoutClient, Env, MetaInfo, StandardCheckoutPayRequest } from 'phonepe-pg-sdk-node';
import { randomUUID } from 'crypto';

class PhonePeService {
  private static instance: PhonePeService;
  private client: any;
  private merchantId: string;

  private constructor() {
    const clientId = process.env.PHONEPE_CLIENT_ID;
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
    this.merchantId = process.env.PHONEPE_MERCHANT_ID || '';
    const clientVersion = 1;
    
    if (!clientId || !clientSecret || !this.merchantId) {
      throw new Error('PhonePe credentials are missing. Please set PHONEPE_CLIENT_ID, PHONEPE_CLIENT_SECRET, and PHONEPE_MERCHANT_ID');
    }

    const env = Env.PRODUCTION;
    
    try {
      this.client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);
      console.log(`✅ PhonePe SDK initialized successfully in PRODUCTION mode`);
      console.log(`   Client ID: ${clientId}`);
      console.log(`   Merchant ID: ${this.merchantId}`);
    } catch (error) {
      console.error('❌ Failed to initialize PhonePe SDK:', error);
      throw error;
    }
  }

  public static getInstance(): PhonePeService {
    if (!PhonePeService.instance) {
      PhonePeService.instance = new PhonePeService();
    }
    return PhonePeService.instance;
  }

  async initiatePayment(params: {
    merchantOrderId: string;
    amount: number;
    redirectUrl: string;
    udf1?: string;
    udf2?: string;
    udf3?: string;
    udf4?: string;
    udf5?: string;
  }) {
    try {
      const metaInfoBuilder = MetaInfo.builder();
      
      if (params.udf1) metaInfoBuilder.udf1(params.udf1);
      if (params.udf2) metaInfoBuilder.udf2(params.udf2);
      if (params.udf3) metaInfoBuilder.udf3(params.udf3);
      if (params.udf4) metaInfoBuilder.udf4(params.udf4);
      if (params.udf5) metaInfoBuilder.udf5(params.udf5);
      
      const metaInfo = metaInfoBuilder.build();

      const request = StandardCheckoutPayRequest.builder()
        .merchantOrderId(params.merchantOrderId)
        .amount(params.amount)
        .redirectUrl(params.redirectUrl)
        .metaInfo(metaInfo)
        .build();

      const response = await this.client.pay(request);
      
      return {
        success: true,
        redirectUrl: response.redirectUrl,
        orderId: response.orderId,
        state: response.state,
        expireAt: response.expireAt,
      };
    } catch (error: any) {
      console.error('PhonePe payment initiation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to initiate payment',
      };
    }
  }

  async checkOrderStatus(merchantOrderId: string) {
    try {
      const response = await this.client.getOrderStatus(merchantOrderId);
      
      return {
        success: true,
        state: response.state,
        orderId: response.orderId,
        amount: response.amount,
        paymentDetails: response.paymentDetails,
      };
    } catch (error: any) {
      console.error('PhonePe order status check error:', error);
      return {
        success: false,
        error: error.message || 'Failed to check order status',
      };
    }
  }

  async initiateRefund(params: {
    merchantRefundId: string;
    merchantOrderId: string;
    amount: number;
  }) {
    try {
      const response = await this.client.refund({
        merchantRefundId: params.merchantRefundId,
        merchantOrderId: params.merchantOrderId,
        amount: params.amount,
      });
      
      return {
        success: true,
        state: response.state,
        refundId: response.refundId,
        amount: response.amount,
      };
    } catch (error: any) {
      console.error('PhonePe refund initiation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to initiate refund',
      };
    }
  }

  async checkRefundStatus(merchantRefundId: string) {
    try {
      const response = await this.client.getRefundStatus(merchantRefundId);
      
      return {
        success: true,
        state: response.state,
        refundId: response.refundId,
        amount: response.amount,
        refundDetails: response.refundDetails,
      };
    } catch (error: any) {
      console.error('PhonePe refund status check error:', error);
      return {
        success: false,
        error: error.message || 'Failed to check refund status',
      };
    }
  }

  validateCallback(authHeader: string, responseBody: string, username: string, password: string) {
    try {
      const response = this.client.validateCallback(username, password, authHeader, responseBody);
      
      return {
        success: true,
        isValid: true,
        data: response,
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
