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

php artisan migrate --seed || php artisan migrate:fresh --seed

==================== 🌐 App Setup Complete ====================

Super Admin:
URL: http://localhost:8000
Login URL: http://localhost:8000/login
Email: superadmin@gmail.com
Password: 12345678

Tenant (Afohs):
ID: 12345678
URL: http://afohs.localhost:8000
Login URL: http://afohs.localhost:8000/login
Email: afohs@gmail.com
Password: 123456

==============================================================

# Run the application

php artisan serve
&&
npm run dev

Visit http://localhost:8000/ in your browser to access the application.

# Details

- Use for routes located in: routes/web/tenant.php
- Include all pages under: resources/js/pages/App/
  e.g., resources/js/pages/App/Dashboard.jsx
- Include all components under: resources/js/components/App/
  e.g., resources/js/components/App/SideBar
