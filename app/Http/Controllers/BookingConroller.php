<?php

namespace App\Http\Controllers;
use App\Models\Booking;
use Inertia\Inertia;

use Illuminate\Http\Request;


class BookingConroller extends Controller
{
     public function index()
    {
        $booking = Booking::latest()->get();
        return Inertia::render('App/Admin/Booking/Dashboard', [
            'booking' => $booking,
        ]);
        //  return Booking::latest()->get();
    }
}
