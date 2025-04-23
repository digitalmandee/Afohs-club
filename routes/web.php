<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
 * |--------------------------------------------------------------------------
 * | Web Routes
 * |--------------------------------------------------------------------------
 * |
 * | Here is where you can register web routes for your application. These
 * | routes are loaded by the RouteServiceProvider within a group which
 * | contains the "web" middleware group. Now create something great!
 * |
 */

Route::get('/', function () {
    return Inertia::render('Auth/SignIn');
});

Route::get('/forget-pin', function () {
    return Inertia::render('Auth/ForgetPin');
});

Route::get('/reset/pin', function () {
    return Inertia::render('Auth/Reset');
});

Route::get('/set/new/pin', function () {
    return Inertia::render('Auth/NewPin');
});

Route::get('/employee/sign-in', function () {
    return Inertia::render('Auth/EmployeeSignIn');
});

Route::get('/success', function () {
    return Inertia::render('Auth/Success');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard/Dashboardm');
});

Route::get('/order/queue', function () {
    return Inertia::render('Order/Queue');
});

Route::get('/all/order', function () {
    return Inertia::render('Order/OrderList');
});

Route::get('/new/order', function () {
    return Inertia::render('Order/New/Index');
});

Route::get('/inventory', function () {
    return Inertia::render('Inventory/Dashboard');
});

Route::get('/transaction', function () {
    return Inertia::render('Transaction/Dashboard');
});

Route::get('/settings', function () {
    return Inertia::render('Settings/Dashboard');
});

Route::get('/table/management', function () {
    return Inertia::render('Table/Dashboard');
});

Route::get('/add/newfloor', function () {
    return Inertia::render('Table/Newfloor');
});

Route::get('/kitchen', function () {
    return Inertia::render('Kitchen/Dashboard');
});

Route::get('/add/product', function () {
    return Inertia::render('Inventory/Product');
});

Route::get('/members', function () {
    return Inertia::render('Member/Dashboard');
});

Route::get('/add/information', function () {
    return Inertia::render('Member/AddInfo');
});

Route::get('/customers/list', function () {
    return Inertia::render('Member/Customer');
});

Route::get('/admin/login', function () {
    return Inertia::render('AdminAuth/Login');
});

Route::get('/admin/dashboard', function () {
    return Inertia::render('AdminDashboard/Dashboard');
});

// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

// Route::middleware('auth')->group(function () {
//     Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//     Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//     Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
// });

// require __DIR__ . '/auth.php';