<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',  // Member, Customer, or Corporate Member ID (Can be polymorphic or handled via separate cols if strict)
        // Ideally, we might want 'payable_type' and 'payable_id' for Member/Corporate/Customer
        'payable_type',
        'payable_id',
        'type',  // 'debit' or 'credit'
        'amount',
        'balance',  // Running balance snapshot
        'reference_type',  // FinancialInvoice, RoomBooking, FinancialReceipt
        'reference_id',
        'trans_type_id',  // Link to TransactionType
        'description',
        'date',
        'remarks',
        'receipt_id'
    ];

    // Polymorphic relation to the entity (Member, Customer, CorporateMember)
    public function payable()
    {
        return $this->morphTo();
    }

    // Polymorphic relation to the source (Invoice, Receipt, RoomBooking)
    public function reference()
    {
        return $this->morphTo();
    }

    public function transactionType()
    {
        return $this->belongsTo(TransactionType::class, 'trans_type_id');
    }
}
