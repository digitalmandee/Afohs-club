import dayjs from 'dayjs';

// Helper function to safely parse JSON
export const JSONParse = (jsonString) => {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        return [];
    }
};

// Helper function to get booking type label
export function getEventBookingTypeLabel(type) {
    switch (type) {
        case '0':
            return 'Member';
        case '1':
            return 'Guest / Non-Member';
        case '2':
            return 'Corporate Member';
        default:
            return 'Event Booking';
    }
}

// Helper function to convert number to words
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

// Main function to generate event invoice content
export const generateEventInvoiceContent = (booking) => {
    if (!booking) return '';

    // Debug: Log the booking data to console
    console.log('Event Booking Data:', booking);
    console.log('Menu Add-Ons:', booking.menuAddOns || booking.menu_add_ons);
    console.log('Other Charges:', booking.otherCharges || booking.other_charges);

    const customerName = booking.customer?.name || booking.member?.full_name || booking.corporateMember?.full_name || booking.corporate_member?.full_name || booking.name || 'N/A';
    const customerEmail = booking.customer?.email || booking.member?.personal_email || booking.corporateMember?.personal_email || booking.corporate_member?.personal_email || booking.email || 'N/A';
    const customerPhone = booking.customer?.contact || booking.member?.mobile_number_a || booking.corporateMember?.mobile_number_a || booking.corporate_member?.mobile_number_a || booking.mobile || 'N/A';
    const membershipNo = booking.customer?.customer_no || booking.member?.membership_no || booking.corporateMember?.membership_no || booking.corporate_member?.membership_no || 'N/A';

    // Parse menu add-ons and other charges - try both camelCase and snake_case
    const menuAddOns = booking.menuAddOns || booking.menu_add_ons || [];
    const otherCharges = booking.otherCharges || booking.other_charges || [];

    return `<!doctype html>
<html>
    <head>
        <title>Event Booking Invoice</title>
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
            .charges-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            .charges-table th,
            .charges-table td {
                padding: 8px;
                text-align: left;
                border-bottom: 1px solid #ddd;
                font-size: 12px;
            }
            .charges-table th {
                background: #f8f9fa;
                font-weight: bold;
                color: #063455;
            }
            .charges-table .amount {
                text-align: right;
                font-weight: bold;
            }
            .complementary {
                color: #28a745;
                font-style: italic;
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
                            ${getEventBookingTypeLabel(booking.booking_type)}
                        </div>
                    </div>
                </div>

                <!-- Bill To Section -->
                <div style="margin-bottom: 20px">
                    <div class="subtitle1">Bill To - #${booking.booking_no || 'N/A'}</div>
                    <div class="two-column">
                        <div class="typography-body2"><span style="font-weight: bold">Guest Name: </span>${customerName}</div>
                        <div class="typography-body2">
                          <span style="font-weight: bold">Membership ID: </span>
                          ${membershipNo}
                        </div>
                        <div class="typography-body2">
                          <span style="font-weight: bold">Phone Number: </span>
                          ${customerPhone}
                        </div>
                        <div class="typography-body2">
                          <span style="font-weight: bold">Email: </span>
                          ${customerEmail}
                        </div>
                    </div>
                </div>

                <!-- Event Booking Details Section -->
                <div style="margin-bottom: 20px">
                    <div class="subtitle1">Event Booking Details</div>
                    <div class="two-column">
                        <div class="typography-body2"><span style="font-weight: bold">Booking ID: </span>INV-${booking.booking_no || 'N/A'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Booked By: </span>${booking.booked_by || 'N/A'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Issue Date: </span>${dayjs(booking.booking_date).format('MMMM D, YYYY')}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Booking Type: </span>${getEventBookingTypeLabel(booking.booking_type)}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Nature of Event: </span>${booking.nature_of_event || 'N/A'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Event Date: </span>${booking.event_date ? dayjs(booking.event_date).format('MMMM D, YYYY') : 'N/A'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Event Time: </span>${booking.event_time_from || 'N/A'} - ${booking.event_time_to || 'N/A'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Venue: </span>${booking.eventVenue?.name || booking.event_venue?.name || 'N/A'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Number of Guests: </span>${booking.no_of_guests || 'N/A'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Status: </span>${booking.status || 'N/A'}</div>
                        ${booking.family_member ? `<div class="typography-body2"><span style="font-weight: bold">Family Member: </span>${booking.family_member?.full_name} (${booking.family_member?.membership_no})</div>` : ''}
                    </div>
                </div>

                <!-- Menu Details Section -->
                ${booking.menu ? `
                <div style="margin-bottom: 20px">
                    <div class="subtitle1">Menu Details</div>
                    <table class="charges-table">
                        <thead>
                            <tr>
                                <th>Menu</th>
                                <th>Per Person</th>
                                <th>Guests</th>
                                <th class="amount">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${booking.menu.name}</td>
                                <td>Rs ${booking.menu.amount}</td>
                                <td>${booking.no_of_guests}</td>
                                <td class="amount">Rs ${booking.menu.amount * booking.no_of_guests}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                ` : ''}

                <!-- Menu Add-Ons Section -->
                ${menuAddOns.length > 0 ? `
                <div style="margin-bottom: 20px">
                    <div class="subtitle1">Menu Add-Ons</div>
                    <table class="charges-table">
                        <thead>
                            <tr>
                                <th>Add-On Type</th>
                                <th>Details</th>
                                <th>Per Person Rate</th>
                                <th>No. of Guests</th>
                                <th>Status</th>
                                <th class="amount">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${menuAddOns.map(addon => `
                                <tr>
                                    <td><strong>${addon.type}</strong></td>
                                    <td>${addon.details || 'No additional details'}</td>
                                    <td>${addon.is_complementary ? '<span class="complementary">Complimentary</span>' : 'Rs ' + (addon.amount || 0)}</td>
                                    <td>${booking.no_of_guests || 0}</td>
                                    <td>${addon.is_complementary ? '<span class="complementary">✓ Complimentary</span>' : '✓ Paid'}</td>
                                    <td class="amount"><strong>${addon.is_complementary ? '<span class="complementary">FREE</span>' : 'Rs ' + ((addon.amount || 0) * (booking.no_of_guests || 0))}</strong></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div style="margin-top: 10px; text-align: right;">
                        <span class="typography-body2-bold">Total Add-Ons: Rs ${menuAddOns.reduce((sum, addon) => sum + (addon.is_complementary ? 0 : (addon.amount || 0) * (booking.no_of_guests || 0)), 0)}</span>
                    </div>
                </div>
                ` : ''}

                <!-- Other Charges Section -->
                ${otherCharges.length > 0 ? `
                <div style="margin-bottom: 20px">
                    <div class="subtitle1">Other Charges & Services</div>
                    <table class="charges-table">
                        <thead>
                            <tr>
                                <th>Charge Type</th>
                                <th>Bill Details</th>
                                <th>Status</th>
                                <th class="amount">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${otherCharges.map(charge => `
                                <tr>
                                    <td><strong>${charge.type}</strong></td>
                                    <td>${charge.details || 'No additional details provided'}</td>
                                    <td>${charge.is_complementary ? '<span class="complementary">✓ Complimentary Service</span>' : '✓ Paid Service'}</td>
                                    <td class="amount"><strong>${charge.is_complementary ? '<span class="complementary">FREE</span>' : 'Rs ' + (charge.amount || 0)}</strong></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div style="margin-top: 10px; text-align: right;">
                        <span class="typography-body2-bold">Total Other Charges: Rs ${otherCharges.reduce((sum, charge) => sum + (charge.is_complementary ? 0 : (charge.amount || 0)), 0)}</span>
                    </div>
                </div>
                ` : ''}

                <!-- Charges Breakdown Section -->
                <div style="margin-bottom: 20px">
                    <div class="subtitle1">Charges Breakdown</div>
                    <div class="two-column">
                        <div class="typography-body2"><span style="font-weight: bold">Menu Charges: </span>Rs ${booking.menu_charges || '0'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Add-ons Charges: </span>Rs ${booking.addons_charges || '0'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Per Person Charges: </span>Rs ${booking.total_per_person_charges || '0'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Guest Charges: </span>Rs ${booking.guest_charges || '0'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Extra Guests: </span>${booking.extra_guests || '0'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Extra Guest Charges: </span>Rs ${booking.extra_guest_charges || '0'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Total Food Charges: </span>Rs ${booking.total_food_charges || '0'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Total Other Charges: </span>Rs ${booking.total_other_charges || '0'}</div>
                        <div class="typography-body2"><span style="font-weight: bold">Total Charges: </span>Rs ${booking.total_charges || '0'}</div>
                        ${booking.surcharge_type ? `<div class="typography-body2"><span style="font-weight: bold">Surcharge Type: </span>${booking.surcharge_type}</div>` : ''}
                        ${booking.surcharge_amount ? `<div class="typography-body2"><span style="font-weight: bold">Surcharge Amount: </span>Rs ${booking.surcharge_amount}</div>` : ''}
                        ${booking.surcharge_note ? `<div class="typography-body2"><span style="font-weight: bold">Surcharge Note: </span>${booking.surcharge_note}</div>` : ''}
                        ${booking.reduction_type ? `<div class="typography-body2"><span style="font-weight: bold">Discount Type: </span>${booking.reduction_type}</div>` : ''}
                        ${booking.reduction_amount ? `<div class="typography-body2"><span style="font-weight: bold">Discount Amount: </span>Rs ${booking.reduction_amount}</div>` : ''}
                        ${booking.reduction_note ? `<div class="typography-body2"><span style="font-weight: bold">Discount Note: </span>${booking.reduction_note}</div>` : ''}
                    </div>
                </div>

                <!-- Summary Section -->
                <div class="summary-container">
                    <div class="summary-box">
                        <div class="summary-row">
                            <span class="typography-body2-bold">Total Amount</span>
                            <span class="typography-body2">Rs ${booking.total_price || '0'}</span>
                        </div>
                        <div class="summary-row">
                            <span class="typography-body2-bold">Balance Due</span>
                            <span class="typography-body2">Rs ${(booking.total_price || 0) - (booking.paid_amount || 0)}</span>
                        </div>
                        <div class="summary-row">
                            <span class="typography-body2-bold">Amount Paid</span>
                            <span class="typography-body2">Rs ${booking.paid_amount || '0'}</span>
                        </div>
                    </div>
                </div>

                <!-- Documents Section -->
                ${booking.booking_docs ? `
                <div style="margin-bottom: 20px">
                    <div class="subtitle1">Attached Documents</div>
                    <div class="typography-body2">Documents have been uploaded with this booking.</div>
                </div>
                ` : ''}

                <!-- Additional Information Section -->
                ${booking.additional_data ? `
                <div style="margin-bottom: 20px">
                    <div class="subtitle1">Additional Information</div>
                    <div class="two-column">
                        ${booking.additional_data.completed_time ? `<div class="typography-body2"><span style="font-weight: bold">Completed Time: </span>${booking.additional_data.completed_time}</div>` : ''}
                        ${booking.additional_data.cancellation_reason ? `<div class="typography-body2"><span style="font-weight: bold">Cancellation Reason: </span>${booking.additional_data.cancellation_reason}</div>` : ''}
                    </div>
                </div>
                ` : ''}

                <!-- Notes Section -->
                <div class="notes-container">
                    <div class="notes-item">
                        <div class="typography-body2-bold" style="margin-bottom: 4px">Additional Notes:</div>
                        <div class="typography-body3">${booking.additional_notes || 'This is a computer-generated receipt. It does not require any signature or stamp.'}</div>
                        <div style="margin-top: 16px">
                            <div class="typography-body2-bold" style="margin-bottom: 4px">Created By: </div>
                            <div class="typography-body3">Admin (ID: ${booking.created_by || 'N/A'})</div>
                        </div>
                        ${booking.updated_by ? `
                        <div style="margin-top: 8px">
                            <div class="typography-body2-bold" style="margin-bottom: 4px">Last Updated By: </div>
                            <div class="typography-body3">Admin (ID: ${booking.updated_by})</div>
                        </div>
                        ` : ''}
                    </div>
                    <div class="notes-item">
                        <div class="amount-in-words">AMOUNT IN WORDS: ${numberToWords(booking.total_price || 0)} RUPEES ONLY</div>
                        <div style="margin-top: 16px">
                            <div class="typography-body2-bold" style="margin-bottom: 4px">Booking Information:</div>
                            <div class="typography-body3">Created: ${dayjs(booking.created_at).format('MMMM D, YYYY h:mm A')}</div>
                            ${booking.updated_at && booking.updated_at !== booking.created_at ? `<div class="typography-body3">Updated: ${dayjs(booking.updated_at).format('MMMM D, YYYY h:mm A')}</div>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
`;
};
