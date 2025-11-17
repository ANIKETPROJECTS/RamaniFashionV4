# Shiprocket API Integration Guide

This guide will help you set up Shiprocket for shipping and courier management in your e-commerce application.

## Required Credentials

You'll need to provide these 2 credentials:

1. **SHIPROCKET_API_EMAIL** - API user email (different from your main account email)
2. **SHIPROCKET_API_PASSWORD** - API user password

---

## Step-by-Step Setup Process

### Step 1: Create Shiprocket Account

1. Go to https://www.shiprocket.in
2. Sign up for a Shiprocket account
3. Complete the registration and KYC process
4. Add wallet balance for shipping charges (for testing)

### Step 2: Create API User

1. Log in to your Shiprocket account
2. Navigate to **Settings** → **API** from the left sidebar menu
3. Click **Configure** → **Create an API User**
4. Enter a **valid email address**
   - ⚠️ Must be different from your registered account email
   - Example: `apiuser@yourcompany.com` or `api+shiprocket@yourcompany.com`
5. Create a **strong password** and confirm it
6. Click **Generate API Credential**

**Important Notes:**
- You can create up to 4 API users per account
- Keep these credentials secure - they provide full API access
- This is NOT your main Shiprocket login email

### Step 3: Provide Credentials

Once you have your API user created, provide these credentials:

```
SHIPROCKET_API_EMAIL=your-api-user@example.com
SHIPROCKET_API_PASSWORD=your-api-password
```

---

## How Shiprocket API Works

### Authentication Flow

Unlike simple API keys, Shiprocket uses a **token-based authentication system**:

1. **Login with credentials** → Get a temporary token
2. **Use token for all API calls** → Token is valid for 10 days
3. **Token expires** → Re-authenticate to get a new token

**Token Details:**
- Valid for **240 hours (10 days)**
- Must be refreshed after expiration
- Automatically managed by the integration

---

## What Will Be Implemented

Once you provide the credentials, the following will be added:

1. **Shiprocket Service File** - Handle all shipping operations
2. **Token Management** - Auto-refresh tokens when expired
3. **API Endpoints:**
   - Check courier serviceability
   - Calculate shipping rates
   - Create shipment orders
   - Generate AWB (Air Waybill) numbers
   - Track shipments
   - Generate shipping labels
   - Schedule pickups

---

## Main Features Available

### 1. Check Serviceability
Check if delivery is possible to a specific pincode:
```
Input: Pickup pincode, Delivery pincode, Weight, COD status
Output: Available couriers, estimated delivery time, rates
```

### 2. Create Order
Create a shipment order in Shiprocket:
```
Input: Order details, customer info, product details
Output: Order ID, Shipment ID
```

### 3. Assign Courier
Automatically assign the best courier:
```
Input: Shipment ID
Output: AWB number, Courier name, Tracking ID
```

### 4. Generate Label
Create shipping label and manifest:
```
Input: Shipment IDs
Output: Label PDF URL
```

### 5. Track Shipment
Real-time shipment tracking:
```
Input: Tracking number or Shipment ID
Output: Current status, location, estimated delivery
```

### 6. Schedule Pickup
Arrange courier pickup:
```
Input: Shipment ID, Pickup date
Output: Pickup ID, Pickup scheduled confirmation
```

---

## API Endpoints That Will Be Available

### Check Serviceability
```
POST /api/shipping/check-serviceability
Body: {
  "pickupPincode": "110001",
  "deliveryPincode": "400001",
  "weight": 1,
  "cod": false
}

Response: {
  "available": true,
  "couriers": [...],
  "estimatedDays": 3
}
```

### Calculate Shipping Rates
```
POST /api/shipping/calculate-rates
Body: {
  "pickupPincode": "110001",
  "deliveryPincode": "400001",
  "weight": 1,
  "cod": false
}

Response: {
  "rates": [
    {
      "courier": "Delhivery",
      "rate": 50,
      "estimatedDays": 3
    }
  ]
}
```

### Create Shipment
```
POST /api/shipping/create-shipment
Body: {
  "orderId": "ORD12345",
  "orderDate": "2024-11-17",
  "pickupLocation": "Primary",
  "billingCustomerName": "John Doe",
  "billingPhone": "9999999999",
  "billingAddress": "...",
  "shippingIsSameBilling": true,
  "orderItems": [...],
  "paymentMethod": "Prepaid",
  "subTotal": 1000,
  "weight": 0.5,
  "length": 10,
  "breadth": 10,
  "height": 10
}

Response: {
  "orderId": "...",
  "shipmentId": "...",
  "status": "Created"
}
```

### Track Shipment
```
GET /api/shipping/track/:awb

Response: {
  "trackingData": {
    "currentStatus": "In Transit",
    "shipmentStatus": "...",
    "activities": [...]
  }
}
```

---

## Important Information

### Testing

⚠️ **No Sandbox Environment**
- Shiprocket doesn't provide dedicated test credentials
- For testing:
  - Create real orders with small amounts
  - Cancel shipments to get refunds
  - Or contact support for test access

### Pricing

- Charges depend on courier, weight, and distance
- COD orders have additional charges
- Weight is calculated volumetrically if needed
- Prepaid orders are usually cheaper than COD

### Volumetric Weight

If your product dimensions create a large package:
```
Volumetric Weight = (Length × Breadth × Height) / 5000
```
Whichever is higher (actual weight or volumetric weight) is used for billing.

### Pickup Locations

Before creating orders, you need to:
1. Add pickup locations in Shiprocket dashboard
2. Use the location name (e.g., "Primary", "Warehouse 1") in API calls

---

## Common Integration Flow

1. **Customer places order** on your website
2. **Check serviceability** to ensure delivery is possible
3. **Calculate shipping rates** and show to customer
4. **Create order** in Shiprocket when payment is confirmed
5. **Assign courier** automatically (best rate/delivery time)
6. **Schedule pickup** for the next available date
7. **Generate label** and print for packaging
8. **Track shipment** and update customer

---

## API Resources

| Resource | URL |
|----------|-----|
| **Official API Documentation** | https://apidocs.shiprocket.in/ |
| **Postman Collection** | Available on API docs page |
| **Support Portal** | https://support.shiprocket.in/ |
| **Base API URL** | `https://apiv2.shiprocket.in/v1/external` |

---

## Troubleshooting

**Authentication Failed:**
- Verify API user email and password are correct
- Ensure you're using API user credentials, not main account login

**Serviceability Check Failed:**
- Verify pincode format (6 digits)
- Check if area is serviceable by any courier
- Ensure weight and dimensions are provided

**Order Creation Failed:**
- Verify pickup location exists in dashboard
- Check all required fields are provided
- Ensure phone numbers are 10 digits
- Validate pincode format

**Pickup Not Scheduled:**
- Ensure courier is assigned (AWB generated)
- Check pickup location operating hours
- Verify you have wallet balance

---

## Token Management

**How it works behind the scenes:**
1. First API call → Login and get token
2. Token cached → Used for subsequent calls
3. Token expires (10 days) → Auto re-authenticate
4. New token obtained → Continue operations

You don't need to worry about this - it's handled automatically!

---

## Rate Limits

- No specific rate limits mentioned in documentation
- Use reasonable request frequency
- Contact support if you need high-volume access

---

## Required Fields for Order Creation

**Minimum Required:**
- Order ID (your internal order ID)
- Order date
- Pickup location
- Customer name, phone, address, pincode, city, state
- Product details (name, SKU, units, price)
- Payment method (Prepaid/COD)
- Sub-total
- Weight and dimensions

**Optional but Recommended:**
- Email
- GST number (for B2B)
- Reseller name
- Gift message
- Customer GSTIN

---

## Weight and Dimension Guidelines

**Weight:**
- Minimum: 0.5 kg
- Maximum: Depends on courier (usually 10-30 kg)
- If below 0.5 kg, provide as 0.5

**Dimensions:**
- Length, Breadth, Height in cm
- Minimum: 0.5 cm each
- Used for volumetric weight calculation

---

## Payment Methods Supported

1. **Prepaid** - Customer paid online
2. **COD** (Cash on Delivery) - Payment collected by courier
3. **PickupRTO** - For return shipments

---

## Status Flow

```
Order Created → 
  Courier Assigned (AWB) → 
    Pickup Scheduled → 
      Shipped → 
        In Transit → 
          Out for Delivery → 
            Delivered
```

---

## Ready to Integrate?

Once you create your Shiprocket account and API user, provide:
- API user email
- API user password

And the integration will be completed with all shipping features!
