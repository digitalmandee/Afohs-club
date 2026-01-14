import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, IconButton, Paper, TextField, Typography, MenuItem, Divider, FormControl, InputLabel, Select, InputAdornment, ListSubheader } from '@mui/material';
import { Add, Delete, ReceiptLong } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useSnackbar } from 'notistack';

export default function InvoiceItemsGrid({ items, setItems, transactionTypes = [], selectedMember, subscriptionCategories = [], subscriptionTypes = [], onQuickSelectMaintenance }) {
    const { enqueueSnackbar } = useSnackbar();
    // State to control DatePicker open status for each item field
    const [openPickers, setOpenPickers] = useState({});

    const togglePicker = (index, field, isOpen) => {
        setOpenPickers((prev) => ({
            ...prev,
            [`${index}_${field}`]: isOpen,
        }));
    };
    // Add a new empty row
    const handleAddItem = () => {
        setItems([
            ...items,
            {
                id: Date.now(), // Temporary ID
                fee_type: '',
                fee_type_name: '',
                description: '',
                qty: 1,
                amount: '',
                tax_percentage: 0,
                overdue_percentage: 0,
                discount_type: 'fixed', // 'percent' or 'fixed'
                discount_value: 0,
                discount_amount: 0,
                additional_charges: 0,
                valid_from: null,
                valid_to: null,
                remarks: '',
                // Subscription specific
                subscription_type_id: '',
                subscription_category_id: '',
                family_member_id: '',
                total: 0,
            },
        ]);
    };

    // Remove a row
    const handleRemoveItem = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    // Handle field changes
    const handleChange = (index, field, value) => {
        const newItems = [...items];
        const item = { ...newItems[index] };

        // Handle Fee Type Change special logic
        if (field === 'fee_type') {
            if (value === 'maintenance_fee') {
                const hasMaintenance = newItems.some((i, iIdx) => i.fee_type === 'maintenance_fee' && iIdx !== index);
                if (hasMaintenance) {
                    enqueueSnackbar('Only one Maintenance Fee item is allowed per invoice.', { variant: 'warning' });
                    return; // Prevent change
                }
            }

            const selectedType = transactionTypes.find((t) => t.id == value);

            // Auto-fill logic for System Fees
            let autoAmount = '';
            let isFixed = false; // Default editable

            if (value === 'membership_fee' && selectedMember) {
                // Prioritize total_membership_fee, then membership_fee
                autoAmount = selectedMember.total_membership_fee || selectedMember.membership_fee || selectedMember.member_category?.fee || '';
                // Keep editable or fixed? Let's make it editable but pre-filled.
                isFixed = false;
            } else if (value === 'maintenance_fee' && selectedMember) {
                // Prioritize total_maintenance_fee, then maintenance_fee
                autoAmount = selectedMember.total_maintenance_fee || selectedMember.maintenance_fee || '';
                // Maintenance fee is usually per month rate, kept editable.
                isFixed = false;
            } else if (selectedType) {
                autoAmount = selectedType.default_amount;
                isFixed = !!selectedType.is_fixed;
            }

            // logic for fee name
            const feeName = value === 'membership_fee' ? 'Membership Fee' : value === 'maintenance_fee' ? 'Maintenance Fee' : value === 'subscription_fee' ? 'Subscription Fee' : selectedType ? selectedType.name : '';

            // Update local item variable (which is used for calculations and saved at the end)
            item.fee_type = value;
            item.fee_type_name = feeName;
            item.amount = autoAmount !== '' ? autoAmount : '';
            item.is_fixed = isFixed;
            item.description = feeName; // Set description to match fee name
        } else if (field === 'valid_from' || field === 'valid_to') {
            item[field] = value ? dayjs(value).format('YYYY-MM-DD') : null;

            // Auto-calc maintenance amount if dates are set
            if (item.fee_type === 'maintenance_fee' && item.valid_from && item.valid_to && selectedMember) {
                const from = dayjs(item.valid_from);
                const to = dayjs(item.valid_to);
                if (to.isAfter(from) || to.isSame(from)) {
                    // Calculate months difference roughly
                    // Legacy logic: (YearDiff * 12) + MonthDiff + 1 (inclusive)
                    const monthsDiff = (to.year() - from.year()) * 12 + (to.month() - from.month()) + 1;

                    const monthlyFee = parseFloat(String(selectedMember.total_maintenance_fee || 0).replace(/,/g, ''));
                    // User Request: Qty should be 1, Rate should be Total Amount
                    const totalAmount = Math.round(monthlyFee * (monthsDiff > 0 ? monthsDiff : 1));

                    item.amount = totalAmount;
                    item.qty = 1;
                    item.description = `Maintenance Fee (${from.format('MMM YYYY')} - ${to.format('MMM YYYY')})`;
                }
            } else if (item.fee_type === 'subscription_fee' && item.valid_from && item.valid_to && item.subscription_category_id) {
                // Logic for subscription calc if category is selected
                const cat = subscriptionCategories.find((c) => c.id === item.subscription_category_id);
                if (cat && cat.fee) {
                    const from = dayjs(item.valid_from);
                    const to = dayjs(item.valid_to);

                    // Logic: (YearDiff * 12) + MonthDiff + 1 (inclusive basis)
                    // If the user selects e.g. Jan 1 to Jan 31, that's 1 month. Jan 1 to Feb 1 is 2 months?
                    // Let's use the same logic as Maintenance for consistency.
                    // If to >= from:
                    if (to.isAfter(from) || to.isSame(from)) {
                        const monthsDiff = (to.year() - from.year()) * 12 + (to.month() - from.month()) + 1;

                        // User Request: Qty should be 1, Rate should be Total Amount
                        item.amount = cat.fee * (monthsDiff > 0 ? monthsDiff : 1);
                        item.qty = 1;
                        item.description = `${item.fee_type_name} - ${monthsDiff} Months`;
                    }
                }
            }
        } else if (field === 'subscription_category_id') {
            item[field] = value;
            // Set amount from category
            const cat = subscriptionCategories.find((c) => c.id === value);
            if (cat) {
                item.amount = cat.fee;
                item.description = `${item.fee_type_name} - ${cat.name}`;
            }
        } else {
            item[field] = value;
        }

        // Recalculate Totals
        const qty = parseFloat(item.qty) || 0;
        const rate = parseFloat(item.amount) || 0;
        const addCharges = parseFloat(item.additional_charges) || 0;

        let subTotal = qty * rate + addCharges;

        // Discount
        let discountAmt = 0;
        const discVal = parseFloat(item.discount_value) || 0;
        if (item.discount_type === 'percent') {
            discountAmt = (subTotal * discVal) / 100;
        } else {
            discountAmt = discVal;
        }
        item.discount_amount = discountAmt;

        // Net before tax
        const netAmount = subTotal - discountAmt;

        // Tax
        const taxPct = parseFloat(item.tax_percentage) || 0;
        const taxAmt = (netAmount * taxPct) / 100;

        // Overdue
        const overduePct = parseFloat(item.overdue_percentage) || 0;
        const overdueAmt = (netAmount * overduePct) / 100;

        item.total = Math.round(netAmount + taxAmt + overdueAmt);

        newItems[index] = item;
        setItems(newItems);
    };

    // Calculate Grand Total
    const grandTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Paper sx={{ width: '100%', mb: 0, p: 2, borderRadius: 2, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center">
                        <Box sx={{ bgcolor: '#e0f2fe', p: 1, borderRadius: 1, mr: 2 }}>
                            <ReceiptLong sx={{ color: '#0284c7' }} />
                        </Box>
                        <Typography variant="h6" fontWeight="bold" color="#0f172a">
                            Invoice Items
                        </Typography>
                    </Box>
                    <Button startIcon={<Add />} variant="outlined" size="small" onClick={handleAddItem} sx={{ borderRadius: '16px', textTransform: 'none', bgcolor:'#063455', color:'#fff'}}>
                        Add Another Item
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {items.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
                            <Typography color="text.secondary">No items added to this invoice.</Typography>
                            <Button startIcon={<Add />} onClick={handleAddItem} sx={{ mt: 1 }}>
                                Add Item
                            </Button>
                        </Box>
                    ) : (
                        items.map((item, index) => (
                            <Box key={item.id} sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, position: 'relative', border: '1px solid #e2e8f0' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                                        Item #{index + 1}
                                    </Typography>
                                    {items.length > 1 && (
                                        <IconButton size="small" color="error" onClick={() => handleRemoveItem(index)}>
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>

                                <Grid container spacing={1}>
                                    {/* Row 1: Fee Type, Description, Dates */}
                                    <Grid item xs={12} md={4}>
                                        <TextField select fullWidth size="small" label="Fee Type" value={item.fee_type} onChange={(e) => handleChange(index, 'fee_type', e.target.value)} sx={{ bgcolor: 'white' }}>
                                            <ListSubheader sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9', lineHeight: '36px' }}>System Fees</ListSubheader>
                                            <MenuItem value="membership_fee">Membership Fee</MenuItem>
                                            <MenuItem value="maintenance_fee">Maintenance Fee</MenuItem>
                                            <MenuItem value="subscription_fee">Subscription Fee</MenuItem>

                                            <Divider />
                                            <ListSubheader sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9', lineHeight: '36px' }}>Charge Types</ListSubheader>
                                            {transactionTypes.map((type) => (
                                                <MenuItem key={type.id} value={type.id}>
                                                    {type.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Box display="flex" gap={1}>
                                            <DatePicker
                                                format="DD-MM-YYYY"
                                                label="From"
                                                open={openPickers[`${index}_valid_from`] || false}
                                                onOpen={() => togglePicker(index, 'valid_from', true)}
                                                onClose={() => togglePicker(index, 'valid_from', false)}
                                                slotProps={{
                                                    textField: {
                                                        size: 'small',
                                                        fullWidth: true,
                                                        sx: { bgcolor: 'white' },
                                                        onClick: () => togglePicker(index, 'valid_from', true), // Click input to open
                                                    },
                                                    actionBar: {
                                                        actions: ['clear', 'today', 'cancel', 'accept'],
                                                    },
                                                }}
                                                value={item.valid_from ? dayjs(item.valid_from) : null}
                                                onChange={(val) => handleChange(index, 'valid_from', val)}
                                            />
                                            <DatePicker
                                                format="DD-MM-YYYY"
                                                label="To"
                                                open={openPickers[`${index}_valid_to`] || false}
                                                onOpen={() => togglePicker(index, 'valid_to', true)}
                                                onClose={() => togglePicker(index, 'valid_to', false)}
                                                slotProps={{
                                                    textField: {
                                                        size: 'small',
                                                        fullWidth: true,
                                                        sx: { bgcolor: 'white' },
                                                        onClick: () => togglePicker(index, 'valid_to', true), // Click input to open
                                                    },
                                                    actionBar: {
                                                        actions: ['clear', 'today', 'cancel', 'accept'],
                                                    },
                                                }}
                                                value={item.valid_to ? dayjs(item.valid_to) : null}
                                                onChange={(val) => handleChange(index, 'valid_to', val)}
                                            />
                                        </Box>
                                        {/* Quick Select Buttons */}
                                        {item.fee_type === 'maintenance_fee' && onQuickSelectMaintenance && (
                                            <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                                                <Button size="small" sx={{ fontSize: '0.7rem', px: 1, minWidth: 'auto' }} variant="outlined" onClick={() => onQuickSelectMaintenance('monthly', index)}>
                                                    1 Mo
                                                </Button>
                                                <Button size="small" sx={{ fontSize: '0.7rem', px: 1, minWidth: 'auto' }} variant="outlined" onClick={() => onQuickSelectMaintenance('quarterly', index)}>
                                                    1 Qtr
                                                </Button>
                                                <Button size="small" sx={{ fontSize: '0.7rem', px: 1, minWidth: 'auto' }} variant="outlined" onClick={() => onQuickSelectMaintenance('half_yearly', index)}>
                                                    6 Mo
                                                </Button>
                                                <Button size="small" sx={{ fontSize: '0.7rem', px: 1, minWidth: 'auto' }} variant="outlined" onClick={() => onQuickSelectMaintenance('annually', index)}>
                                                    1 Yr
                                                </Button>
                                            </Box>
                                        )}
                                    </Grid>
                                    <Grid item xs={6} md={1}>
                                        <TextField type="number" fullWidth size="small" label="Qty" value={item.qty} onChange={(e) => handleChange(index, 'qty', e.target.value)} sx={{ bgcolor: 'white' }} />
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <TextField
                                            type="number"
                                            fullWidth
                                            size="small"
                                            label="Rate"
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">Rs</InputAdornment>,
                                                readOnly: item.is_fixed, // Lock if fixed
                                            }}
                                            disabled={item.is_fixed} // Visual disable
                                            value={item.amount}
                                            onChange={(e) => handleChange(index, 'amount', e.target.value)}
                                            sx={{ bgcolor: item.is_fixed ? '#f1f5f9' : 'white' }}
                                        />
                                    </Grid>

                                    {/* Row 1b: Subscription Details */}
                                    {item.fee_type === 'subscription_fee' && (
                                        <>
                                            <Grid item xs={12} md={3}>
                                                <TextField select fullWidth size="small" label="Sub Type" value={item.subscription_type_id} onChange={(e) => handleChange(index, 'subscription_type_id', e.target.value)} sx={{ bgcolor: 'white' }}>
                                                    {subscriptionTypes.map((t) => (
                                                        <MenuItem key={t.id} value={t.id}>
                                                            {t.name}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </Grid>
                                            <Grid item xs={12} md={3}>
                                                <TextField select fullWidth size="small" label="Sub Category" value={item.subscription_category_id} onChange={(e) => handleChange(index, 'subscription_category_id', e.target.value)} sx={{ bgcolor: 'white' }}>
                                                    {(item.subscription_type_id ? subscriptionCategories.filter((c) => c.subscription_type_id == item.subscription_type_id) : subscriptionCategories).map((c) => (
                                                        <MenuItem key={c.id} value={c.id}>
                                                            {c.name}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </Grid>
                                            <Grid item xs={12} md={3}>
                                                <TextField select fullWidth size="small" label="Member/Family" value={item.family_member_id} onChange={(e) => handleChange(index, 'family_member_id', e.target.value)} sx={{ bgcolor: 'white' }}>
                                                    <MenuItem value="">Self ({selectedMember?.full_name})</MenuItem>
                                                    {selectedMember?.family_members?.map((fm) => (
                                                        <MenuItem key={fm.id} value={fm.id}>
                                                            {fm.full_name} ({fm.relation})
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </Grid>
                                            <Grid item xs={12} md={3} />
                                        </>
                                    )}

                                    {/* Row 3: Financials & Calculator */}
                                    <Grid item xs={6} md={3}>
                                        <TextField type="number" fullWidth size="small" label="Add. Chrgs" value={item.additional_charges} onChange={(e) => handleChange(index, 'additional_charges', e.target.value)} sx={{ bgcolor: 'white' }} />
                                    </Grid>
                                    <Grid item xs={6} md={2}>
                                        <TextField type="number" fullWidth size="small" label="Tax%" value={item.tax_percentage} onChange={(e) => handleChange(index, 'tax_percentage', e.target.value)} sx={{ bgcolor: 'white' }} />
                                    </Grid>
                                    <Grid item xs={6} md={4}>
                                        <Box display="flex" gap={1}>
                                            <TextField select size="small" label="Disc Type" value={item.discount_type} onChange={(e) => handleChange(index, 'discount_type', e.target.value)} sx={{ bgcolor: 'white', width: '40%' }}>
                                                <MenuItem value="fixed">Fixed</MenuItem>
                                                <MenuItem value="percent">%</MenuItem>
                                            </TextField>
                                            <TextField type="number" size="small" label="Disc Val" value={item.discount_value} onChange={(e) => handleChange(index, 'discount_value', e.target.value)} sx={{ bgcolor: 'white', width: '60%' }} />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <Box sx={{ bgcolor: '#eff6ff', p: 1, borderRadius: 1, textAlign: 'right', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', border: '1px solid #bfdbfe' }}>
                                            <Typography fontWeight="bold" color="primary">
                                                {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(item.total)}
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    {/* Row 3: Remarks */}
                                    <Grid item xs={12}>
                                        <TextField fullWidth size="small" label="Item Remarks" placeholder="Optional details..." value={item.remarks} onChange={(e) => handleChange(index, 'remarks', e.target.value)} sx={{ bgcolor: 'white' }} />
                                    </Grid>
                                </Grid>
                            </Box>
                        ))
                    )}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box display="flex" justifyContent="flex-end">
                    <Box sx={{ minWidth: 200 }}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography color="text.secondary">Total Items:</Typography>
                            <Typography fontWeight="600">{items.length}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" fontWeight="bold" color="#0a3d62">
                                Grand Total:
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="#0a3d62">
                                {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(grandTotal)}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </LocalizationProvider>
    );
}
