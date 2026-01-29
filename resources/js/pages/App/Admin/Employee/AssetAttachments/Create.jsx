import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Grid, Autocomplete, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Typography } from '@mui/material';
import { Delete as DeleteIcon, AttachFile as AttachFileIcon } from '@mui/icons-material';
import axios from 'axios';

const Create = ({ open, onClose, onSuccess }) => {
    const [data, setData] = useState({
        employee_id: null,
        employee_asset_id: null,
        attachment_date: new Date().toISOString().split('T')[0],
        comments: '',
        status: 'assigned',
        return_date: '',
        documents: [],
    });

    const [options, setOptions] = useState({
        employees: [],
        assets: [],
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (open) {
            fetchOptions();
        }
    }, [open]);

    const fetchOptions = async () => {
        try {
            const res = await axios.get(route('employees.asset-attachments.form-data'));
            if (res.data.success) {
                setOptions({
                    employees: res.data.employees,
                    assets: res.data.assets,
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setData({ ...data, documents: [...data.documents, ...Array.from(e.target.files)] });
    };

    const handleRemoveNewFile = (index) => {
        const newDocs = [...data.documents];
        newDocs.splice(index, 1);
        setData({ ...data, documents: newDocs });
    };

    const handleSubmit = async () => {
        setLoading(true);
        setErrors({});

        const formData = new FormData();
        formData.append('employee_id', data.employee_id?.id || '');
        formData.append('employee_asset_id', data.employee_asset_id?.id || '');
        formData.append('attachment_date', data.attachment_date);
        formData.append('comments', data.comments || '');
        formData.append('status', data.status);
        formData.append('return_date', data.return_date || '');

        if (data.documents) {
            data.documents.forEach((file) => {
                formData.append('documents[]', file);
            });
        }

        try {
            const res = await axios.post(route('employees.asset-attachments.store'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.data.success) {
                onSuccess();
                onClose();
                // Reset form
                setData({
                    employee_id: null,
                    employee_asset_id: null,
                    attachment_date: new Date().toISOString().split('T')[0],
                    comments: '',
                    status: 'assigned',
                    return_date: '',
                    documents: [],
                });
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ backgroundColor: 'transparent', color: '#000' }}>Assign Asset</DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <Autocomplete options={options.employees} getOptionLabel={(option) => `${option.name} (${option.employee_id})`} value={data.employee_id} onChange={(e, newVal) => setData({ ...data, employee_id: newVal })} renderInput={(params) => <TextField {...params} label="Employee" error={!!errors.employee_id} helperText={errors.employee_id?.[0]} size="small" />} />
                    </Grid>
                    <Grid item xs={12}>
                        <Autocomplete options={options.assets} getOptionLabel={(option) => `${option.name} - ${option.type} (${option.classification})`} value={data.employee_asset_id} onChange={(e, newVal) => setData({ ...data, employee_asset_id: newVal })} renderInput={(params) => <TextField {...params} label="Asset to Assign" error={!!errors.employee_asset_id} helperText={errors.employee_asset_id?.[0]} size="small" />} />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField fullWidth label="Attachment Date" type="date" name="attachment_date" value={data.attachment_date} onChange={handleChange} error={!!errors.attachment_date} helperText={errors.attachment_date?.[0]} size="small" InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField select fullWidth label="Status" name="status" value={data.status} onChange={handleChange} error={!!errors.status} helperText={errors.status?.[0]} size="small">
                            <MenuItem value="assigned">Assigned</MenuItem>
                            <MenuItem value="returned">Returned</MenuItem>
                        </TextField>
                    </Grid>

                    {data.status === 'returned' && (
                        <Grid item xs={6}>
                            <TextField fullWidth label="Return Date" type="date" name="return_date" value={data.return_date} onChange={handleChange} error={!!errors.return_date} helperText={errors.return_date?.[0]} size="small" InputLabelProps={{ shrink: true }} />
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        <TextField fullWidth label="Comments" name="comments" value={data.comments} onChange={handleChange} multiline rows={3} error={!!errors.comments} helperText={errors.comments?.[0]} size="small" placeholder="Add comments about asset condition etc." />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Documents:
                        </Typography>
                        {data.documents.length > 0 && (
                            <List dense sx={{ bgcolor: 'background.paper', border: '1px solid #e0e0e0', borderRadius: 1, mb: 1 }}>
                                {data.documents.map((file, index) => (
                                    <ListItem key={index} divider>
                                        <AttachFileIcon sx={{ mr: 2, color: 'action.active' }} />
                                        <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(2)} KB`} />
                                        <ListItemSecondaryAction>
                                            <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveNewFile(index)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                        <Button variant="outlined" component="label" fullWidth startIcon={<AttachFileIcon />}>
                            Upload Documents
                            <input type="file" hidden multiple onChange={handleFileChange} />
                        </Button>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} variant="contained" style={{ backgroundColor: '#063455' }} disabled={loading}>
                    {loading ? 'Assigning...' : 'Assign Asset'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default Create;
