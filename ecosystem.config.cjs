module.exports = {
  apps: [{
    name: 'ramaniV2',
    script: './dist/index.js',  // Run the built backend directly
    env: {
      NODE_ENV: 'production',
      MONGODB_URI: 'mongodb+srv://raneaniket23_db_user:heO5JZLpHHdbgiMW@ramanifashion.xcxqbd7.mongodb.net/?appName=ramanifashion',
      PORT: '5000',
      WHATSAPP_API_KEY: '7RlFwj57xE6wHngTfSmNHA',
      WHATSAPP_PHONE_NUMBER_ID: '919970127778'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};