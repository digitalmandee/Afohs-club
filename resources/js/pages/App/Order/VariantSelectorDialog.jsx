// resources/js/Components/VariantSelectorDialog.jsx

import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';

const VariantSelectorDialog = ({ open, onClose, productId, initialItem, onConfirm }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedValues, setSelectedValues] = useState({});
    const [quantity, setQuantity] = useState(initialItem?.quantity || 1);

    useEffect(() => {
        if (!productId) return;

        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await axios.get(route('product.single', { id: productId }));
                setProduct(response.data.product);
            } catch (error) {
                console.error('Error loading product:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    useEffect(() => {
        if (initialItem?.variants?.length && product?.variants?.length) {
            const initial = {};
            for (const v of product.variants) {
                const match = initialItem.variants.find((iv) => iv.id === v.id);
                const option = v.values.find((opt) => opt.name === match?.value);
                if (option) initial[v.name] = option;
            }
            setSelectedValues(initial);
        }
    }, [initialItem, product]);

    const handleSelect = (variantName, value) => {
        setSelectedValues((prev) => ({
            ...prev,
            [variantName]: value,
        }));
    };

    const handleConfirm = () => {
        const selectedVariantItems = product.variants
            .filter((variant) => selectedValues[variant.name])
            .map((variant) => {
                const selected = selectedValues[variant.name];
                return {
                    id: variant.id,
                    name: variant.name,
                    price: parseFloat(selected?.additional_price || 0),
                    value: selected?.name || '',
                };
            });

        const totalVariantPrice = selectedVariantItems.reduce((acc, v) => acc + v.price, 0);
        const total_price = (parseFloat(product.base_price) + totalVariantPrice) * quantity;

        const orderItem = {
            id: product.id,
            name: product.name,
            price: parseFloat(product.base_price),
            kitchen_id: product.kitchen_id,
            total_price,
            quantity,
            category: product.category?.name || '',
            variants: selectedVariantItems,
        };

        onConfirm(orderItem);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            {loading || !product ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <DialogTitle>Customize {product.name}</DialogTitle>
                    <DialogContent dividers>
                        {product.variants.map((variant) => (
                            <Box key={variant.id} mb={2}>
                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                    {variant.name}
                                </Typography>
                                <ToggleButtonGroup
                                    exclusive
                                    value={selectedValues[variant.name]?.name || ''}
                                    onChange={(_, valueName) => {
                                        const selected = variant.values.find((v) => v.name === valueName);
                                        if (selected && selected.stock !== 0) {
                                            handleSelect(variant.name, selected);
                                        }
                                    }}
                                    size="small"
                                >
                                    {variant.values.map((v) => (
                                        <ToggleButton key={v.name} value={v.name} disabled={v.stock === 0}>
                                            {v.name} (R<span style={{ textTransform: 'lowercase' }}>s </span> +{v.additional_price})
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>
                            </Box>
                        ))}
                        <Box mt={2}>
                            <TextField label="Quantity" type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))} inputProps={{ min: 1 }} fullWidth />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button variant="contained" disabled={Object.values(selectedValues).some((v) => !v || v.stock === 0)} onClick={handleConfirm}>
                            {initialItem ? 'Update' : 'Add'}
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
};

export default VariantSelectorDialog;
