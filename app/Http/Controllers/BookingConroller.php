<?php

namespace App\Http\Controllers;
use App\Models\BookingEvents;
use Inertia\Inertia;

use Illuminate\Http\Request;


class BookingConroller extends Controller
{
     public function index()
    {
        $events = BookingEvents::latest()->get();
        return Inertia::render('App/Admin/Booking/Dashboard', [
            'events' => $events,
        ]);
    }
}
