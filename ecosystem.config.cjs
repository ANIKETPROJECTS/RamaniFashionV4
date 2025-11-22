module.exports = {
  apps: [{
    name: 'ramaniV2',
    script: './dist/index.js',
    env: {
      NODE_ENV: 'production',
      MONGODB_URI: 'mongodb+srv://raneaniket23_db_user:heO5JZLpHHdbgiMW@ramanifashion.xcxqbd7.mongodb.net/?appName=ramanifashion',
      PORT: '5000',
      WHATSAPP_API_KEY: '7RlFwj57xE6wHngTfSmNHA',
      WHATSAPP_PHONE_NUMBER_ID: '919970127778',
      PHONEPE_CLIENT_ID: 'M22QN7SRPWWQ4_2511161203',
      PHONEPE_CLIENT_SECRET: 'NGFiNzVkZGYtNjhjYi00OTFjLWI1MWMtMGNkM2U5ZGI4NWJj',
      PHONEPE_MERCHANT_ID: 'M22QN7SRPWWQ4',
      PHONEPE_SALT_INDEX: '5b5b1002-099f-4ae7-abda-a2507503a219',
      PHONEPE_SALT_KEY: '1',
      SHIPROCKET_API_EMAIL: 'raneaniket23@gmail.com',
      SHIPROCKET_API_PASSWORD: '!ExeJ2E&MyR4sUbK'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};