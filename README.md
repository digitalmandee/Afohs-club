# Project Setup

## Requirements

- PHP 8.0+
- Composer
- Node.js & NPM
- MySQL database

## Installation

# Install dependencies

composer install
npm install

# Set up database

php artisan migrate --seed

==================== 🌐 App Setup Complete ====================

Super Admin:
URL: http://localhost:8000
Login URL: http://localhost:8000/login
Email: superadmin@gmail.com
Password: 12345678

Tenant (Afohs):
id: 12345678
URL: http://afohs.localhost:8000
Login URL: http://afohs.localhost:8000/login
Email: afohs@gmail.com
Password: 123456

==============================================================

# Run the application

php artisan serve
&&
npm run dev

```

Visit http://localhost:8000/ in your browser to access the application.
```
