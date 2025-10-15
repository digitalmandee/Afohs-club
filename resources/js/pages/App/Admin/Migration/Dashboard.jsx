import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Box,
    Alert,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    LinearProgress
} from '@mui/material';
import {
    Assessment as AssessmentIcon,
    PlayArrow as PlayArrowIcon,
    Visibility as VisibilityIcon,
    CloudUpload as CloudUploadIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon
} from '@mui/icons-material';

const MigrationDashboard = ({ stats }) => {
    const [analysisData, setAnalysisData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [testResults, setTestResults] = useState(null);
    const [sampleData, setSampleData] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState('');
    const [batchSize, setBatchSize] = useState(10);

    // Check if old tables exist
    if (stats.error) {
        return (
            <>
                <Head title="Data Migration" />
                <Box sx={{ p: 3 }}>
                    <Alert severity="error" sx={{ mb: 3 }}>
                        <Typography variant="h6">Migration Error</Typography>
                        {stats.message}
                    </Alert>
                </Box>
            </>
        );
    }

    if (!stats.old_tables_exist) {
        return (
            <>
                <Head title="Data Migration" />
                <Box sx={{ p: 3 }}>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        <Typography variant="h6">Old Database Tables Not Found</Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Please import the SQL files (old_memberships.sql and old_mem_families.sql) into your database first.
                        </Typography>
                    </Alert>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Import Instructions
                            </Typography>
                            <Typography variant="body2" paragraph>
                                1. Open your database management tool (phpMyAdmin, MySQL Workbench, etc.)
                            </Typography>
                            <Typography variant="body2" paragraph>
                                2. Import the following SQL files:
                                <br />- old_memberships (17).sql
                                <br />- old_mem_families.sql
                            </Typography>
                            <Typography variant="body2" paragraph>
                                3. Refresh this page to continue with the migration process
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </>
        );
    }

    const handleAnalyzeData = async () => {
        setLoading(true);
        try {
            const response = await fetch(route('membership.migration.analyze'));
            const data = await response.json();
            setAnalysisData(data);
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTestMigration = async () => {
        setLoading(true);
        try {
            const response = await fetch(route('membership.migration.test'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({ batch_size: batchSize })
            });
            const data = await response.json();
            setTestResults(data);
        } catch (error) {
            console.error('Test migration failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewSampleData = async (type) => {
        setLoading(true);
        try {
            const response = await fetch(`${route('membership.migration.sample-data')}?type=${type}&limit=10`);
            const data = await response.json();
            setSampleData({ type, data: data.data });
            setDialogType('sample');
            setDialogOpen(true);
        } catch (error) {
            console.error('Failed to fetch sample data:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, color = 'primary', icon }) => (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                        {title}
                    </Typography>
                </Box>
                <Typography variant="h4" color={color}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );

    return (
        <>
            <Head title="Data Migration Dashboard" />
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Data Migration Dashboard
                </Typography>

                {/* Migration Status Alert */}
                {stats.migration_needed ? (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="h6">Migration Required</Typography>
                        <Typography variant="body2">
                            Old system data detected. You have {stats.total_old_records} records that need to be migrated.
                        </Typography>
                    </Alert>
                ) : (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        <Typography variant="h6">Migration Complete</Typography>
                        <Typography variant="body2">
                            All data appears to be migrated. Current system has {stats.current_members} members.
                        </Typography>
                    </Alert>
                )}

                {/* Statistics Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Old Memberships"
                            value={stats.old_memberships}
                            color="primary"
                            icon={<AssessmentIcon color="primary" />}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Old Family Members"
                            value={stats.old_families}
                            color="secondary"
                            icon={<AssessmentIcon color="secondary" />}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Current Members"
                            value={stats.current_members}
                            color="success"
                            icon={<CheckCircleIcon color="success" />}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Old Records"
                            value={stats.total_old_records}
                            color="warning"
                            icon={<WarningIcon color="warning" />}
                        />
                    </Grid>
                </Grid>

                {/* Action Buttons */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item>
                        <Button
                            variant="contained"
                            startIcon={<AssessmentIcon />}
                            onClick={handleAnalyzeData}
                            disabled={loading}
                        >
                            Analyze Old Data
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewSampleData('memberships')}
                            disabled={loading}
                        >
                            View Sample Memberships
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewSampleData('families')}
                            disabled={loading}
                        >
                            View Sample Families
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<PlayArrowIcon />}
                            onClick={handleTestMigration}
                            disabled={loading}
                        >
                            Test Migration
                        </Button>
                    </Grid>
                </Grid>

                {loading && <LinearProgress sx={{ mb: 2 }} />}

                {/* Analysis Results */}
                {analysisData && (
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Data Analysis Results
                            </Typography>
                            
                            {/* Memberships Analysis */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Memberships Table Analysis
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6} sm={3}>
                                        <Chip label={`Total: ${analysisData.memberships.total_count}`} />
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Chip label={`With Mem No: ${analysisData.memberships.with_mem_no}`} />
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Chip label={`With CNIC: ${analysisData.memberships.with_cnic}`} />
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Chip label={`With Email: ${analysisData.memberships.with_email}`} />
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Families Analysis */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Family Members Analysis
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6} sm={3}>
                                        <Chip label={`Total: ${analysisData.families.total_count}`} />
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Chip label={`With Parent: ${analysisData.families.with_member_id}`} />
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Chip label={`With CNIC: ${analysisData.families.with_cnic}`} />
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Relationships */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Relationship Distribution
                                </Typography>
                                <Grid container spacing={1}>
                                    {analysisData.relationships.map((rel, index) => (
                                        <Grid item key={index}>
                                            <Chip 
                                                label={`${rel.name}: ${rel.count}`}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>

                            {/* Data Quality Issues */}
                            {analysisData.data_quality.length > 0 && (
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom color="error">
                                        Data Quality Issues
                                    </Typography>
                                    {analysisData.data_quality.map((issue, index) => (
                                        <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                                            {issue}
                                        </Alert>
                                    ))}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Test Results */}
                {testResults && (
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Test Migration Results
                            </Typography>
                            
                            {testResults.success ? (
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    Test migration completed successfully!
                                </Alert>
                            ) : (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    Test migration failed: {testResults.error}
                                </Alert>
                            )}

                            {testResults.results && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2">Primary Members</Typography>
                                        <Typography>Processed: {testResults.results.primary_members.total_processed}</Typography>
                                        <Typography>Migrated: {testResults.results.primary_members.successfully_migrated}</Typography>
                                        <Typography>Errors: {testResults.results.primary_members.errors.length}</Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2">Family Members</Typography>
                                        <Typography>Processed: {testResults.results.family_members.total_processed}</Typography>
                                        <Typography>Migrated: {testResults.results.family_members.successfully_migrated}</Typography>
                                        <Typography>Errors: {testResults.results.family_members.errors.length}</Typography>
                                    </Grid>
                                </Grid>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Sample Data Dialog */}
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
                    <DialogTitle>
                        Sample Data - {sampleData?.type === 'memberships' ? 'Memberships' : 'Family Members'}
                    </DialogTitle>
                    <DialogContent>
                        {sampleData && (
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            {sampleData.type === 'memberships' ? (
                                                <>
                                                    <TableCell>ID</TableCell>
                                                    <TableCell>Membership No</TableCell>
                                                    <TableCell>Name</TableCell>
                                                    <TableCell>CNIC</TableCell>
                                                    <TableCell>Category</TableCell>
                                                    <TableCell>Date</TableCell>
                                                </>
                                            ) : (
                                                <>
                                                    <TableCell>ID</TableCell>
                                                    <TableCell>Parent ID</TableCell>
                                                    <TableCell>Name</TableCell>
                                                    <TableCell>Relationship</TableCell>
                                                    <TableCell>CNIC</TableCell>
                                                    <TableCell>Card No</TableCell>
                                                </>
                                            )}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sampleData.data.map((row, index) => (
                                            <TableRow key={index}>
                                                {sampleData.type === 'memberships' ? (
                                                    <>
                                                        <TableCell>{row.id}</TableCell>
                                                        <TableCell>{row.mem_no}</TableCell>
                                                        <TableCell>{row.name}</TableCell>
                                                        <TableCell>{row.cnic}</TableCell>
                                                        <TableCell>{row.category}</TableCell>
                                                        <TableCell>{row.membership_date}</TableCell>
                                                    </>
                                                ) : (
                                                    <>
                                                        <TableCell>{row.id}</TableCell>
                                                        <TableCell>{row.member_id}</TableCell>
                                                        <TableCell>{row.name}</TableCell>
                                                        <TableCell>{row.fam_relationship}</TableCell>
                                                        <TableCell>{row.cnic}</TableCell>
                                                        <TableCell>{row.sup_card_no}</TableCell>
                                                    </>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Close</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </>
    );
};

export default MigrationDashboard;
