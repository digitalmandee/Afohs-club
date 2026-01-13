import dayjs from 'dayjs';

export function getBookingTypeLabel(type) {
    switch (type) {
        case '0':
            return 'Member';
        case '2':
            return 'Corporate Member';
        case 'guest-1':
            return 'Applied Member';
        case 'guest-2':
            return 'Affiliated Member';
        case 'guest-3':
            return 'VIP Guest';
        default:
            return 'Booking';
    }
}

export const JSONParse = (data) => {
    try {
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};

export const numberToWords = (num) => {
    const units = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
    const teens = ['TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
    const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
    const thousands = ['', 'THOUSAND', 'MILLION', 'BILLION'];

    if (num === 0) return 'ZERO';
    let word = '';
    let i = 0;

    while (num > 0) {
        let chunk = num % 1000;
        if (chunk) {
            let chunkWord = '';
            if (chunk >= 100) {
                chunkWord += units[Math.floor(chunk / 100)] + ' HUNDRED ';
                chunk %= 100;
            }
            if (chunk >= 20) {
                chunkWord += tens[Math.floor(chunk / 10)] + ' ';
                chunk %= 10;
            }
            if (chunk >= 10) {
                chunkWord += teens[chunk - 10] + ' ';
            } else if (chunk > 0) {
                chunkWord += units[chunk] + ' ';
            }
            word = chunkWord + thousands[i] + (word ? ' ' : '') + word;
        }
        num = Math.floor(num / 1000);
        i++;
    }
    return word.trim();
};

export const generateInvoiceContent = (booking) => {
    if (!booking) return '';

    return `<!doctype html>
<html>
    <head>
        <title>Booking Invoice</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                padding: 20px;
                max-width: 930px;
                margin: 0 auto;
            }
            .container {
                margin-top: 16px;

            }
            .paper {
                border-radius: 4px;
                position: relative;
                overflow: hidden;
            }
            .grid-container {
                display: flex;
                flex-wrap: wrap;
                margin-bottom: 32px;
                padding-bottom: 16px;
                border-bottom: 1px solid #f0f0f0;
            }
            .grid-item-left {
                flex: 0 0 33.33%;
                display: flex;
                align-items: center;
            }
            .grid-item-center {
                flex: 0 0 33.33%;
                text-align: center;
            }
            .logo {
                height: 60px;
            }
            .typography-h6 {
                font-size: 18px;
                font-weight: bold;
            }
            .typography-body3 {
                font-size: 12px;
                color: #555;
                line-height: 1.4;
            }
            .typography-body2 {
                font-size: 12px;
                color: #555;
                line-height: 0.6;
            }
            .typography-body2-bold {
                font-size: 13px;
                font-weight: bold;
            }
            .subtitle1 {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 12px;
            }
            .summary-container {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 24px;
            }
            .summary-box {
                width: 33.33%;
                padding-top: 8px;
            }
            .summary-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 16px;
                border-bottom: 1px solid #eee;
            }
            .notes-container {
                display: flex;
                gap: 16px;
                margin-bottom: 24px;
            }
            .notes-item {
                flex: 0 0 50%;
            }
            .amount-in-words {
                font-size: 13px;
                font-weight: bold;
                margin-top: 4px;
                text-transform: uppercase;
            }
            .two-column {
                display: flex;
                flex-wrap: wrap;
                gap: 16px;
            }
            .two-column > div {
                flex: 0 0 48%;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="paper">
                <!-- Header -->
                <div class="grid-container">
                    <div class="grid-item-left">
                        <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1c95d02f2c4a986d4f386920c76ff57c18c81985-YeMq5tNsLWF62HBaZY1Gz1HsT7RyLX.png" alt="Afohs Club Logo" class="logo" />
                    </div>
                    <div class="grid-item-center">
                        <div class="typography-h6" style="color: #063455">Afohs Club</div>
                        <div class="typography-body3">
                            PAF Falcon complex, Gulberg III,<br />
                            Lahore, Pakistan
                        </div>
                    </div>
                    <div class="grid-item-center">
                        <div class="typography-h6" style="color: #333; margin-top: 20px">
                        ${getBookingTypeLabel(booking.booking_type)}
                        </div>
                        <div style="
                            margin-top: 4px;
                            font-size: 14px;
                            font-weight: bold;
                            display: ${booking.invoice?.status === 'cancelled' ? 'none' : 'block'};
                            color: ${booking.invoice?.status === 'paid' ? '#155724' :
            booking.invoice?.status === 'refunded' ? '#004085' :
                booking.invoice?.status === 'unpaid' ? '#721c24' :
                    '#333'
        };
                            background-color: ${booking.invoice?.status === 'paid' ? '#d4edda' :
            booking.invoice?.status === 'refunded' ? '#cce5ff' :
                booking.invoice?.status === 'unpaid' ? '#f8d7da' :
                    '#e2e3e5'
        };
                            text-transform: uppercase;
                            border: 1px solid ${booking.invoice?.status === 'paid' ? '#c3e6cb' :
            booking.invoice?.status === 'refunded' ? '#b8daff' :
                booking.invoice?.status === 'unpaid' ? '#f5c6cb' :
                    '#d6d8db'
        };
                            padding: 2px 8px;
                            display: inline-block;
                            border-radius: 4px;
                        ">
                            ${(booking.invoice?.status || 'Unpaid').replace(/_/g, ' ')}
                            ${booking.invoice?.status === 'refunded' ? (() => {
            const notes = booking.additional_notes || booking.notes;
            const match = notes && notes.match(/Refund Processed: (\d+)/);
            return match ? ` (Rs ${match[1]})` : '';
        })() : ''}
                        </div>
                    </div>
                </div>

                <!-- Bill To Section -->
                <div style="margin-bottom: 20px">
                    <div class="subtitle1">Bill To - #${booking.booking_no || 'N/A'}</div>
                    <div class="two-column">
                        <div class="typography-body2"><span style="font-weight: bold">Guest Name: </span>${booking.customer ? booking.customer.name : booking.member ? booking.member.full_name : (booking.corporateMember || booking.corporate_member) ? (booking.corporateMember || booking.corporate_member).full_name : ''}</div>
                        <div class="typography-body2">
                          <span style="font-weight: bold">Membership ID: </span>
                          ${booking.customer ? booking.customer.customer_no : booking.member ? booking.member.membership_no : (booking.corporateMember || booking.corporate_member) ? (booking.corporateMember || booking.corporate_member).membership_no : 'N/A'}
                        </div>
                        <div class="typography-body2">
                          <span style="font-weight: bold">Phone Number: </span>
                          ${booking.customer ? booking.customer.contact : booking.member ? booking.member.mobile_number_a : (booking.corporateMember || booking.corporate_member) ? (booking.corporateMember || booking.corporate_member).mobile_number_a : 'N/A'}
                        </div>
                        <div class="typography-body2">
                          <span style="font-weight: bold">Email: </span>
                          ${booking.customer ? booking.customer.email : booking.member ? booking.member.personal_email : (booking.corporateMember || booking.corporate_member) ? (booking.corporateMember || booking.corporate_member).personal_email : 'N/A'}
                        </div>
                    </div>
                </div>

                <!-- Booking Details Section -->
                <div style="margin-bottom: 2px">
                    <div class="subtitle1">Booking Details</div>
                    <div class="two-column">
                        <div class="typography-body2"><span style="font-weight: bold">Booking ID: </span>INV-${booking.booking_no ? booking.booking_no : 'N/A'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Booking For: </span>${(booking.booking_For || 'N/A').replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Issue Date: </span>${booking.booking_date ? dayjs(booking.created_at).format('DD-MM-YYYY') : 'N/A'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Booking Type: </span>${getBookingTypeLabel(booking.booking_type)}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Room Name: </span>${booking.room?.name || 'N/A'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Max Capacity: </span>${booking.room?.max_capacity || 'N/A'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Number of Beds: </span>${booking.room?.number_of_beds || 'N/A'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">No of Bathrooms: </span>${booking.room?.number_of_bathrooms}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Check-in: </span>${booking.check_in_date ? dayjs(booking.check_in_date).format('DD-MM-YYYY') : 'N/A'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Check-out: </span>${booking.check_out_date ? dayjs(booking.check_out_date).format('DD-MM-YYYY') : 'N/A'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Guests: </span>${booking.persons || 'N/A'}</div>
                         <div class="typography-body2"><span style="font-weight: bold">Booking Status: </span>${(booking.status || 'N/A').replace(/_/g, ' ').toUpperCase()}</div>
                        ${booking.cancellation_reason ? `<div class="typography-body2"><span style="font-weight: bold">Cancellation Reason: </span>${booking.cancellation_reason}</div>` : ''}
                    </div>
                </div>

                <!-- Summary and Notes sections remain unchanged -->
                 <div class="summary-container">
            <div class="summary-box">
                <div class="summary-row">
                    <span class="typography-body2-bold">Total Amount</span>
                    <span class="typography-body2">Rs ${booking.grand_total || '0'}</span>
                </div>
                <div class="summary-row">
                    <span class="typography-body2-bold">Balance Due</span>
                    <span class="typography-body2">Rs ${(() => {
            const total = parseFloat(booking.grand_total || 0);
            const paid = parseFloat(booking.invoice?.paid_amount || 0);
            return Math.max(0, total - paid).toFixed(2);
        })()}</span>
                </div>
                <div class="summary-row">
                    <span class="typography-body2-bold">Amount Paid</span>
                    <span class="typography-body2">Rs ${(() => {
            let paid = parseFloat(booking.invoice?.paid_amount || 0);
            if (booking.invoice?.status === 'refunded') {
                const notes = booking.additional_notes || booking.notes;
                const match = notes && notes.match(/Refund Processed: (\d+)/);
                if (match) {
                    paid += parseInt(match[1]);
                }
            }
            return paid;
        })()}</span>
                </div>
        </div>
    </div>

        <div class="notes-container">
            <div class="notes-item">
                <div class="typography-body2-bold" style="margin-bottom: 4px">Note:</div>
                <div class="typography-body3">This is a computer-generated receipt. It does not require any signature or stamp.</div>
                <div style="margin-top: 16px">
                    <div class="typography-body2-bold" style="margin-bottom: 4px">Sent By: Admin</div>
                </div>
            </div>
            <div class="notes-item">
                <div class="amount-in-words">AMOUNT IN WORDS: ${numberToWords(booking.grand_total || 0)} RUPEES ONLY</div>
            </div>
        </div>
        </div>
    </body>
</html>
`;
};
