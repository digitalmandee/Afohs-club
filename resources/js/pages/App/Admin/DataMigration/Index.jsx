import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, Typography, Button, LinearProgress, Box, Grid, Alert, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Chip, Divider, CircularProgress } from '@mui/material';
import { PlayArrow, Stop, Refresh, CheckCircle, Error, Warning, Assessment, Storage, People, FamilyRestroom } from '@mui/icons-material';
import AdminLayout from '@/Layouts/AdminLayout';
import axios from 'axios';

const DataMigrationIndex = ({ stats: initialStats }) => {
    const [stats, setStats] = useState(initialStats);
    const [migrationStatus, setMigrationStatus] = useState({
        members: { running: false, progress: 0, total: 0, migrated: 0, errors: [] },
        families: { running: false, progress: 0, total: 0, migrated: 0, errors: [] },
    });
    const [validationDialog, setValidationDialog] = useState(false);
    const [validationResults, setValidationResults] = useState(null);
    const [resetDialog, setResetDialog] = useState(false);
    const migrationRunning = useRef({ members: false, families: false });

    useEffect(() => {
        refreshStats();
    }, []);

    const refreshStats = async () => {
        try {
            const response = await axios.get('/admin/data-migration/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error refreshing stats:', error);
        }
    };

    const startMembersMigration = async () => {
        if (!stats.old_tables_exist) {
            alert('Old tables not found in database');
            return;
        }

        migrationRunning.current.members = true;
        setMigrationStatus((prev) => ({
            ...prev,
            members: { ...prev.members, running: true, progress: 0, migrated: 0, errors: [] },
        }));

        await processMigrationBatch('members', 0);
    };

    const startFamiliesMigration = async () => {
        if (!stats.old_tables_exist) {
            alert('Old tables not found in database');
            return;
        }

        migrationRunning.current.families = true;
        setMigrationStatus((prev) => ({
            ...prev,
            families: { ...prev.families, running: true, progress: 0, migrated: 0, errors: [] },
        }));

        await processMigrationBatch('families', 0);
    };

    const processMigrationBatch = async (type, offset) => {
        try {
            const endpoint = type === 'members' ? '/admin/data-migration/migrate-members' : '/admin/data-migration/migrate-families';
            const response = await axios.post(endpoint, {
                batch_size: 100,
                offset: offset,
            });

            const { migrated, errors, has_more } = response.data;

            setMigrationStatus((prev) => ({
                ...prev,
                [type]: {
                    ...prev[type],
                    migrated: prev[type].migrated + migrated,
                    errors: [...prev[type].errors, ...errors],
                    progress: ((offset + migrated) / (type === 'members' ? stats.old_members_count : stats.old_families_count)) * 100,
                },
            }));

            if (has_more && migrationRunning.current[type]) {
                // Process next batch
                setTimeout(() => {
                    processMigrationBatch(type, offset + 100);
                }, 500); // Small delay to prevent overwhelming the server
            } else {
                // Migration complete
                migrationRunning.current[type] = false;
                setMigrationStatus((prev) => ({
                    ...prev,
                    [type]: { ...prev[type], running: false },
                }));
                refreshStats();
            }
        } catch (error) {
            console.error(`Error in ${type} migration:`, error);
            migrationRunning.current[type] = false;
            setMigrationStatus((prev) => ({
                ...prev,
                [type]: {
                    ...prev[type],
                    running: false,
                    errors: [...prev[type].errors, { error: error.response?.data?.error || error.message }],
                },
            }));
        }
    };

    const stopMigration = (type) => {
        migrationRunning.current[type] = false;
        setMigrationStatus((prev) => ({
            ...prev,
            [type]: { ...prev[type], running: false },
        }));
    };

    const validateMigration = async () => {
        try {
            const response = await axios.get('/admin/data-migration/validate');
            setValidationResults(response.data);
            setValidationDialog(true);
        } catch (error) {
            console.error('Validation error:', error);
            alert('Error during validation: ' + (error.response?.data?.error || error.message));
        }
    };

    const resetMigration = async () => {
        try {
            await axios.post('/admin/data-migration/reset');
            setResetDialog(false);
            refreshStats();
            setMigrationStatus({
                members: { running: false, progress: 0, total: 0, migrated: 0, errors: [] },
                families: { running: false, progress: 0, total: 0, migrated: 0, errors: [] },
            });
            alert('Migration data reset successfully');
        } catch (error) {
            console.error('Reset error:', error);
            alert('Error resetting migration: ' + (error.response?.data?.error || error.message));
        }
    };

    if (!stats.old_tables_exist) {
        return (
            <AdminLayout>
                <Head title="Data Migration" />
                <Box sx={{ p: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        Data Migration
                    </Typography>
                    <Alert severity="error">{stats.error || 'Old tables (memberships, mem_families) not found in database'}</Alert>
                </Box>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Head title="Data Migration" />
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4">Data Migration Dashboard</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="outlined" startIcon={<Refresh />} onClick={refreshStats}>
                            Refresh Stats
                        </Button>
                        <Button variant="outlined" startIcon={<Assessment />} onClick={validateMigration}>
                            Validate Migration
                        </Button>
                        <Button variant="outlined" color="error" startIcon={<Warning />} onClick={() => setResetDialog(true)}>
                            Reset Migration
                        </Button>
                    </Box>
                </Box>

                {/* Statistics Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Storage sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="h6">Old Members</Typography>
                                </Box>
                                <Typography variant="h4" color="primary">
                                    {stats.old_members_count?.toLocaleString() || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    From memberships table
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <FamilyRestroom sx={{ mr: 1, color: 'secondary.main' }} />
                                    <Typography variant="h6">Old Families</Typography>
                                </Box>
                                <Typography variant="h4" color="secondary">
                                    {stats.old_families_count?.toLocaleString() || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    From mem_families table
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <People sx={{ mr: 1, color: 'success.main' }} />
                                    <Typography variant="h6">New Members</Typography>
                                </Box>
                                <Typography variant="h4" color="success.main">
                                    {stats.new_members_count?.toLocaleString() || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Migrated to members table
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <FamilyRestroom sx={{ mr: 1, color: 'info.main' }} />
                                    <Typography variant="h6">New Families</Typography>
                                </Box>
                                <Typography variant="h4" color="info.main">
                                    {stats.new_families_count?.toLocaleString() || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Migrated family members
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Migration Controls */}
                <Grid container spacing={3}>
                    {/* Members Migration */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Members Migration
                                </Typography>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Progress: {stats.members_migration_percentage || 0}%
                                    </Typography>
                                    <LinearProgress variant="determinate" value={migrationStatus.members.running ? migrationStatus.members.progress : stats.members_migration_percentage || 0} sx={{ mt: 1 }} />
                                </Box>

                                <Typography variant="body2" sx={{ mb: 2 }}>
                                    Migrated: {migrationStatus.members.migrated || stats.migrated_members_count || 0} / {stats.old_members_count || 0}
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <Button variant="contained" startIcon={migrationStatus.members.running ? <CircularProgress size={20} /> : <PlayArrow />} onClick={startMembersMigration} disabled={migrationStatus.members.running}>
                                        {migrationStatus.members.running ? 'Migrating...' : 'Start Migration'}
                                    </Button>

                                    {migrationStatus.members.running && (
                                        <Button variant="outlined" startIcon={<Stop />} onClick={() => stopMigration('members')}>
                                            Stop
                                        </Button>
                                    )}
                                </Box>

                                {migrationStatus.members.errors.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                        <Alert severity="error" sx={{ mb: 2 }}>
                                            {migrationStatus.members.errors.length} errors occurred during migration
                                        </Alert>
                                        <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                                            {migrationStatus.members.errors.slice(0, 10).map((error, index) => (
                                                <Alert key={index} severity="warning" sx={{ mb: 1, fontSize: '0.8rem' }}>
                                                    <Typography variant="caption" component="div">
                                                        <strong>Member ID:</strong> {error.member_id} | <strong>App No:</strong> {error.application_no}
                                                        <br />
                                                        <strong>Name:</strong> {error.name}
                                                        <br />
                                                        <strong>Error:</strong> {error.error}
                                                        {error.file && (
                                                            <>
                                                                <br />
                                                                <strong>File:</strong> {error.file}:{error.line}
                                                            </>
                                                        )}
                                                    </Typography>
                                                </Alert>
                                            ))}
                                            {migrationStatus.members.errors.length > 10 && (
                                                <Typography variant="caption" color="text.secondary">
                                                    ... and {migrationStatus.members.errors.length - 10} more errors
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Families Migration */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Family Members Migration
                                </Typography>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Progress: {stats.families_migration_percentage || 0}%
                                    </Typography>
                                    <LinearProgress variant="determinate" value={migrationStatus.families.running ? migrationStatus.families.progress : stats.families_migration_percentage || 0} sx={{ mt: 1 }} />
                                </Box>

                                <Typography variant="body2" sx={{ mb: 2 }}>
                                    Migrated: {migrationStatus.families.migrated || stats.migrated_families_count || 0} / {stats.old_families_count || 0}
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <Button variant="contained" startIcon={migrationStatus.families.running ? <CircularProgress size={20} /> : <PlayArrow />} onClick={startFamiliesMigration} disabled={migrationStatus.families.running}>
                                        {migrationStatus.families.running ? 'Migrating...' : 'Start Migration'}
                                    </Button>

                                    {migrationStatus.families.running && (
                                        <Button variant="outlined" startIcon={<Stop />} onClick={() => stopMigration('families')}>
                                            Stop
                                        </Button>
                                    )}
                                </Box>

                                {migrationStatus.families.errors.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                        <Alert severity="error" sx={{ mb: 2 }}>
                                            {migrationStatus.families.errors.length} errors occurred during migration
                                        </Alert>
                                        <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                                            {migrationStatus.families.errors.slice(0, 10).map((error, index) => (
                                                <Alert key={index} severity="warning" sx={{ mb: 1, fontSize: '0.8rem' }}>
                                                    <Typography variant="caption" component="div">
                                                        <strong>Family ID:</strong> {error.family_id} | <strong>Member ID:</strong> {error.member_id}
                                                        <br />
                                                        <strong>Name:</strong> {error.name}
                                                        <br />
                                                        <strong>Error:</strong> {error.error}
                                                        {error.file && (
                                                            <>
                                                                <br />
                                                                <strong>File:</strong> {error.file}:{error.line}
                                                            </>
                                                        )}
                                                    </Typography>
                                                </Alert>
                                            ))}
                                            {migrationStatus.families.errors.length > 10 && (
                                                <Typography variant="caption" color="text.secondary">
                                                    ... and {migrationStatus.families.errors.length - 10} more errors
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Validation Dialog */}
                <Dialog open={validationDialog} onClose={() => setValidationDialog(false)} maxWidth="md" fullWidth>
                    <DialogTitle>Migration Validation Results</DialogTitle>
                    <DialogContent>
                        {validationResults && (
                            <Box>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Count Validation
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                        <Chip icon={validationResults.members_count_match ? <CheckCircle /> : <Error />} label={`Members: ${validationResults.members_count_match ? 'Match' : 'Mismatch'}`} color={validationResults.members_count_match ? 'success' : 'error'} />
                                        <Chip icon={validationResults.families_count_match ? <CheckCircle /> : <Error />} label={`Families: ${validationResults.families_count_match ? 'Match' : 'Mismatch'}`} color={validationResults.families_count_match ? 'success' : 'error'} />
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Typography variant="h6" gutterBottom>
                                    Sample Data Integrity
                                </Typography>
                                <List>
                                    {validationResults.sample_data_integrity.map((sample, index) => (
                                        <ListItem key={index}>
                                            <ListItemText
                                                primary={`Old ID: ${sample.old_id} → New ID: ${sample.new_id}`}
                                                secondary={
                                                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                                        <Chip size="small" label="Name" color={sample.name_match ? 'success' : 'error'} />
                                                        <Chip size="small" label="Membership No" color={sample.membership_no_match ? 'success' : 'error'} />
                                                        <Chip size="small" label="CNIC" color={sample.cnic_match ? 'success' : 'error'} />
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>

                                {validationResults.errors.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="h6" color="error" gutterBottom>
                                            Errors
                                        </Typography>
                                        <List>
                                            {validationResults.errors.map((error, index) => (
                                                <ListItem key={index}>
                                                    <ListItemText primary={error} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setValidationDialog(false)}>Close</Button>
                    </DialogActions>
                </Dialog>

                {/* Reset Dialog */}
                <Dialog open={resetDialog} onClose={() => setResetDialog(false)}>
                    <DialogTitle>Reset Migration Data</DialogTitle>
                    <DialogContent>
                        <Typography>Are you sure you want to reset all migration data? This will delete all records from the members table.</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setResetDialog(false)}>Cancel</Button>
                        <Button onClick={resetMigration} color="error" variant="contained">
                            Reset
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </AdminLayout>
    );
};

export default DataMigrationIndex;
