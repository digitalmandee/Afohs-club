import { Box, Button, Dialog, DialogContent, DialogTitle, FormControl, FormControlLabel, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField, Typography } from '@mui/material';
import { useState, useEffect } from 'react';

const CancelItemDialog = ({ open, onClose, onConfirm, item }) => {
    const [quantity, setQuantity] = useState(1);
    const [remark, setRemark] = useState('CANCELLED BY CUSTOMER');
    const [instructions, setInstructions] = useState('');
    const [cancelType, setCancelType] = useState('void');

    useEffect(() => {
        if (open && item) {
            // Default quantity to 1 or full quantity? Let's default to full quantity for convenience, or 1?
            // "Specific quantity" implies user choice. Let's default to 1, or maybe the item's quantity.
            // If I want to cancel *all*, I'd probably use the main checkbox.
            // But if I want to cancel specific, I might want 1.
            // Let's default to item.quantity (Cancel All) and let user reduce it for partial.
            setQuantity(item.order_item.quantity);
            setRemark('CANCELLED BY CUSTOMER');
            setInstructions('');
            setCancelType('void');
        }
    }, [open, item]);

    const handleConfirm = () => {
        onConfirm({
            quantity: parseInt(quantity, 10),
            remark,
            instructions,
            cancelType,
        });
    };

    if (!item) return null;

    const maxQty = item.order_item.quantity;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Cancel Item: {item.order_item.name}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {/* Quantity Input */}
                    <TextField
                        label="Quantity to Cancel"
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (val > 0 && val <= maxQty) setQuantity(val);
                        }}
                        inputProps={{ min: 1, max: maxQty }}
                        helperText={`Max: ${maxQty}`}
                        fullWidth
                    />

                    {/* Remark Dropdown */}
                    <FormControl fullWidth>
                        <InputLabel>Reason</InputLabel>
                        <Select value={remark} label="Reason" onChange={(e) => setRemark(e.target.value)}>
                            <MenuItem value="CANCELLED BY CUSTOMER">CANCELLED BY CUSTOMER</MenuItem>
                            <MenuItem value="GUEST MIND CHANGE">GUEST MIND CHANGE</MenuItem>
                            <MenuItem value="FOOD COMPLAIN">FOOD COMPLAIN</MenuItem>
                            <MenuItem value="GUEST DIDN'T PICK THE CALL">GUEST DIDN'T PICK THE CALL</MenuItem>
                            <MenuItem value="GUEST DIDN'T LIKE THE FOOD">GUEST DIDN'T LIKE THE FOOD</MenuItem>
                            <MenuItem value="OTHER">OTHER</MenuItem>
                            <MenuItem value="WRONG PUNCHING">WRONG PUNCHING</MenuItem>
                            <MenuItem value="RUN OUT">RUN OUT</MenuItem>
                            <MenuItem value="DIDN'T SERVED">DIDN'T SERVED</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Instructions */}
                    <TextField label="Additional Remarks" multiline rows={2} fullWidth value={instructions} onChange={(e) => setInstructions(e.target.value)} />

                    {/* Cancel Type */}
                    <FormControl component="fieldset">
                        <Typography variant="caption" color="text.secondary">
                            Cancel Type
                        </Typography>
                        <RadioGroup row value={cancelType} onChange={(e) => setCancelType(e.target.value)}>
                            <FormControlLabel value="void" control={<Radio size="small" />} label="Void" />
                            <FormControlLabel value="return" control={<Radio size="small" />} label="Return" />
                            <FormControlLabel value="complementary" control={<Radio size="small" />} label="Comp." />
                        </RadioGroup>
                    </FormControl>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                        <Button onClick={onClose} variant="outlined" color="inherit">
                            Back
                        </Button>
                        <Button onClick={handleConfirm} variant="contained" color="error">
                            Confirm Cancel
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default CancelItemDialog;
