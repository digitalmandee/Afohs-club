import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router, usePage } from '@inertiajs/react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { toWords } from 'number-to-words';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const MaintenanceFeeRevenue = () => {
    const props = usePage().props;

    // Modal state
    const [open, setOpen] = useState(true);

    const { categories, filters, all_statuses, all_categories } = usePage().props;

    const [selectedStatuses, setSelectedStatuses] = useState(filters?.status || []);
    const [selectedCategories, setSelectedCategories] = useState(filters.categories || []);

    const applyFilters = () => {
        router.get(
            route('membership.maintanance-fee-revenue'),
            {
                status: selectedStatuses,
                categories: selectedCategories,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const totalMembers = categories.reduce((sum, c) => sum + c.total_members, 0);
    const totalMaintenance = categories.reduce((sum, c) => sum + Number(c.total_maintenance_fee), 0);

    return (
        <>
            <SideNav open={open} setOpen={setOpen} />
            <div
                style={{
                    marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
                    transition: 'margin-left 0.3s ease-in-out',
                    marginTop: '5rem',
                    backgroundColor: '#F6F6F6',
                }}
            >
                <div className="container-fluid px-4 pt-4" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                    <div className="mb-4 d-flex gap-4 align-items-end">
                        <div>
                            <label className="form-label">Status</label>
                            <select
                                multiple
                                className="form-select"
                                value={selectedStatuses}
                                onChange={(e) => {
                                    setSelectedStatuses(Array.from(e.target.selectedOptions, (o) => o.value));
                                }}
                            >
                                {all_statuses.map((status, idx) => (
                                    <option key={idx} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Member Category</label>
                            <select
                                multiple
                                className="form-select"
                                value={selectedCategories}
                                onChange={(e) => {
                                    setSelectedCategories(Array.from(e.target.selectedOptions, (o) => o.value));
                                }}
                            >
                                {all_categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <button className="btn btn-primary" onClick={applyFilters}>
                                Apply Filters
                            </button>
                        </div>
                    </div>

                    {/* Members Table */}
                    <TableContainer component={Paper} style={{ boxShadow: 'none' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow style={{ backgroundColor: '#E5E5EA', height: '60px' }}>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>SR #</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Members</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Category</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Code</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Maintenance Fee</TableCell>
                                    <TableCell sx={{ color: '#000000', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Amount In Words</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {categories.map((categoryFee, index) => (
                                    <TableRow key={categoryFee.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{index + 1}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{categoryFee.total_members}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{categoryFee.name}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{categoryFee.code}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{categoryFee.total_maintenance_fee}</TableCell>
                                        <TableCell sx={{ color: '#7F7F7F', fontWeight: 400, fontSize: '14px' }}>{toWords(categoryFee.total_maintenance_fee)}</TableCell>
                                    </TableRow>
                                ))}

                                {/* Footer Row */}
                                <TableRow style={{ backgroundColor: '#333', borderTop: '2px solid #ccc' }}>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }} colSpan={1}>
                                        Total
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>{totalMembers}</TableCell>
                                    <TableCell colSpan={2}></TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white' }}>{totalMaintenance}</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'white', textTransform: 'capitalize' }}>{toWords(totalMaintenance)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>
        </>
    );
};

export default MaintenanceFeeRevenue;
