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

Tenant (Afohs Restaurant 1):
id: 12345671
URL: http://localhost:8000/afohs
Login URL: http://localhost:8000/afohs/login
Email: afohs1@gmail.com
Password: 123456

Tenant (Afohs Restaurant 2):
id: 12345682
URL: http://localhost:8000/afohs-restaurant-2
Login URL: http://localhost:8000/afohs-restaurant-2/login
Email: afohs2@gmail.com
Password: 123456

Tenant (Afohs Restaurant 3):
id: 12345693
URL: http://localhost:8000/afohs-restaurant-3
Login URL: http://localhost:8000/afohs-restaurant-3/login
Email: afohs3@gmail.com
Password: 123456

Tenant (Afohs Restaurant 4):
id: 12345704
URL: http://localhost:8000/afohs-restaurant-4
Login URL: http://localhost:8000/afohs-restaurant-4/login
Email: afohs4@gmail.com
Password: 123456

Tenant (Afohs Restaurant 5):
id: 12345715
URL: http://localhost:8000/afohs-restaurant-5
Login URL: http://localhost:8000/afohs-restaurant-5/login
Email: afohs5@gmail.com
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

# PHP Extensions

- extension=imagick
