import React, { useEffect, useState } from 'react';
import { Box, Grid, TextField, Typography, Button, MenuItem, FormControl, InputLabel, Select, FormControlLabel, Radio, RadioGroup, FormLabel, IconButton } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const AddForm4 = ({ onNext, onBack, memberId, initialData }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nominee_name: '',
        nominee_relation: '',
        nominee_contact: '',
        occupation: '',
        designation: '',
        organization: '',
        experience: '',
        applied_before: '0',
        applied_date: '',
        application_status: '',
        rejection_reason: '',
        referral_member_name: '',
        referral_membership_no: '',
        referral_relation: '',
        referral_contact: '',
        foreign_affiliation: '0',
        foreign_org_name: '',
        foreign_affiliation_period: '',
        other_club_membership: [],
        club_termination_details: '',
        political_affiliation: '',
        relatives_armed_forces: '',
        relatives_civil_services: '',
        stayed_abroad: '0',
        stayed_abroad_details: '',
        criminal_conviction: '0',
        criminal_details: '',
    });

    useEffect(() => {
        const fetchProfessionInfo = async () => {
            if (!memberId) return;

            try {
                const response = await axios.get(route('membership.profession-info.get', memberId));
                const info = response.data.profession_info;
                if (info) {
                    setFormData({
                        ...formData,
                        ...info,
                        applied_before: info.applied_before ? '1' : '0',
                        foreign_affiliation: info.foreign_affiliation ? '1' : '0',
                        stayed_abroad: info.stayed_abroad ? '1' : '0',
                        criminal_conviction: info.criminal_conviction ? '1' : '0',
                        other_club_membership: Array.isArray(info.other_club_membership) ? info.other_club_membership : [],
                    });
                }
            } catch (error) {
                console.error('Failed to fetch profession info:', error);
            }
        };

        fetchProfessionInfo();
    }, [memberId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleOtherClubChange = (index, field, value) => {
        const updatedClubs = [...formData.other_club_membership];
        updatedClubs[index][field] = value;
        setFormData({ ...formData, other_club_membership: updatedClubs });
    };

    const addOtherClub = () => {
        setFormData({
            ...formData,
            other_club_membership: [...formData.other_club_membership, { name: '', membership_no: '' }],
        });
    };

    const removeOtherClub = (index) => {
        const updatedClubs = formData.other_club_membership.filter((_, i) => i !== index);
        setFormData({ ...formData, other_club_membership: updatedClubs });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                member_id: memberId,
                profession_info: {
                    ...formData,
                    applied_before: formData.applied_before === '1',
                    foreign_affiliation: formData.foreign_affiliation === '1',
                    stayed_abroad: formData.stayed_abroad === '1',
                    criminal_conviction: formData.criminal_conviction === '1',
                },
            };

            await axios.post(route('membership.profession-info'), payload);
            enqueueSnackbar('Profession info saved successfully', { variant: 'success' });
            onNext();
        } catch (error) {
            console.error(error);
            enqueueSnackbar('Failed to save profession info', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
                {/* Nomination */}
                <Grid item xs={12}>
                    <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, boxShadow: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600, color: '#063455' }}>
                            Nomination
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <TextField size="small" fullWidth label="Nominate your Next of Kin" name="nominee_name" value={formData.nominee_name} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField size="small" fullWidth label="Relationship" name="nominee_relation" value={formData.nominee_relation} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField size="small" fullWidth label="Contact" name="nominee_contact" value={formData.nominee_contact} onChange={handleChange} />
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>

                {/* Profession */}
                <Grid item xs={12}>
                    <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, boxShadow: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600, color: '#063455' }}>
                            Profession
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField size="small" fullWidth label="Nature of Occupation" name="occupation" value={formData.occupation} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField size="small" fullWidth label="Designation / Position / Rank / Grade" name="designation" value={formData.designation} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField size="small" fullWidth label="Organization Name" name="organization" value={formData.organization} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField size="small" fullWidth label="Experience" name="experience" value={formData.experience} onChange={handleChange} />
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>

                {/* Application History */}
                <Grid item xs={12}>
                    <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, boxShadow: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600, color: '#063455' }}>
                            Application History
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControl size="small" component="fieldset">
                                    <FormLabel component="legend" sx={{ fontSize: '0.9rem' }}>
                                        Did you ever Apply for membership in AFOHS Club / PAF Officers Mess?
                                    </FormLabel>
                                    <RadioGroup row name="applied_before" value={formData.applied_before} onChange={handleChange}>
                                        <FormControlLabel value="1" control={<Radio size="small" />} label={<Typography variant="body2">Yes</Typography>} />
                                        <FormControlLabel value="0" control={<Radio size="small" />} label={<Typography variant="body2">No</Typography>} />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
                            {formData.applied_before === '1' && (
                                <>
                                    <Grid item xs={12} md={4}>
                                        <TextField size="small" fullWidth label="When (Month & Year)" name="applied_date" value={formData.applied_date} onChange={handleChange} />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <FormControl size="small" component="fieldset">
                                            <FormLabel component="legend" sx={{ fontSize: '0.9rem' }}>
                                                Status
                                            </FormLabel>
                                            <RadioGroup row name="application_status" value={formData.application_status} onChange={handleChange}>
                                                <FormControlLabel value="Approved" control={<Radio size="small" />} label={<Typography variant="body2">Approved</Typography>} />
                                                <FormControlLabel value="Rejected" control={<Radio size="small" />} label={<Typography variant="body2">Rejected</Typography>} />
                                            </RadioGroup>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <TextField size="small" fullWidth label="Reason for Rejection / Withdrawal" name="rejection_reason" value={formData.rejection_reason} onChange={handleChange} multiline rows={1} />
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </Box>
                </Grid>

                {/* Referral */}
                <Grid item xs={12}>
                    <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, boxShadow: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600, color: '#063455' }}>
                            Referral
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField size="small" fullWidth label="Member Name" name="referral_member_name" value={formData.referral_member_name} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField size="small" fullWidth label="Membership No." name="referral_membership_no" value={formData.referral_membership_no} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField size="small" fullWidth label="Relation with Member" name="referral_relation" value={formData.referral_relation} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField size="small" fullWidth label="Contact" name="referral_contact" value={formData.referral_contact} onChange={handleChange} />
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>

                {/* Affiliations */}
                <Grid item xs={12}>
                    <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, boxShadow: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600, color: '#063455' }}>
                            Affiliations
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControl size="small" component="fieldset">
                                    <FormLabel component="legend" sx={{ fontSize: '0.9rem' }}>
                                        Affiliation with Any Foreign Organization?
                                    </FormLabel>
                                    <RadioGroup row name="foreign_affiliation" value={formData.foreign_affiliation} onChange={handleChange}>
                                        <FormControlLabel value="1" control={<Radio size="small" />} label={<Typography variant="body2">Yes</Typography>} />
                                        <FormControlLabel value="0" control={<Radio size="small" />} label={<Typography variant="body2">No</Typography>} />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
                            {formData.foreign_affiliation === '1' && (
                                <>
                                    <Grid item xs={12} md={6}>
                                        <TextField size="small" fullWidth label="Organization Name" name="foreign_org_name" value={formData.foreign_org_name} onChange={handleChange} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField size="small" fullWidth label="Affiliation Period" name="foreign_affiliation_period" value={formData.foreign_affiliation_period} onChange={handleChange} />
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </Box>
                </Grid>

                {/* Other Clubs */}
                <Grid item xs={12}>
                    <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, boxShadow: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600, color: '#063455' }}>
                            Other Clubs / Messes
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                {formData.other_club_membership.map((club, index) => (
                                    <Box key={index} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                        <TextField size="small" label="Name" value={club.name} onChange={(e) => handleOtherClubChange(index, 'name', e.target.value)} fullWidth />
                                        <TextField size="small" label="Membership No." value={club.membership_no} onChange={(e) => handleOtherClubChange(index, 'membership_no', e.target.value)} fullWidth />
                                        <IconButton onClick={() => removeOtherClub(index)} color="error" size="small">
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                                <Button startIcon={<Add />} onClick={addOtherClub} variant="outlined" size="small" sx={{ mt: 1 }}>
                                    Add Club
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField size="small" fullWidth label="In case of Membership of Club terminated / suspended. Please provide details:" name="club_termination_details" value={formData.club_termination_details} onChange={handleChange} multiline rows={1} />
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>

                {/* Other Details */}
                <Grid item xs={12}>
                    <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, boxShadow: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600, color: '#063455' }}>
                            Other Details
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField size="small" fullWidth label="Political Affiliations (If Any)" name="political_affiliation" value={formData.political_affiliation} onChange={handleChange} multiline rows={1} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField size="small" fullWidth label="Relatives in Armed Forces / Civil Services (A)" name="relatives_armed_forces" value={formData.relatives_armed_forces} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField size="small" fullWidth label="Relatives in Armed Forces / Civil Services (B)" name="relatives_civil_services" value={formData.relatives_civil_services} onChange={handleChange} />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl size="small" component="fieldset">
                                    <FormLabel component="legend" sx={{ fontSize: '0.9rem' }}>
                                        Has the Applicant ever stayed Abroad for more than 10 years or has any other Country's Citizenship / Residence Permit?
                                    </FormLabel>
                                    <RadioGroup row name="stayed_abroad" value={formData.stayed_abroad} onChange={handleChange}>
                                        <FormControlLabel value="1" control={<Radio size="small" />} label={<Typography variant="body2">Yes</Typography>} />
                                        <FormControlLabel value="0" control={<Radio size="small" />} label={<Typography variant="body2">No</Typography>} />
                                    </RadioGroup>
                                </FormControl>
                                {formData.stayed_abroad === '1' && <TextField size="small" fullWidth label="If yes, give Details" name="stayed_abroad_details" value={formData.stayed_abroad_details} onChange={handleChange} multiline rows={1} sx={{ mt: 1 }} />}
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl size="small" component="fieldset">
                                    <FormLabel component="legend" sx={{ fontSize: '0.9rem' }}>
                                        Has the Applicant ever got convicted in any Criminal Case?
                                    </FormLabel>
                                    <RadioGroup row name="criminal_conviction" value={formData.criminal_conviction} onChange={handleChange}>
                                        <FormControlLabel value="1" control={<Radio size="small" />} label={<Typography variant="body2">Yes</Typography>} />
                                        <FormControlLabel value="0" control={<Radio size="small" />} label={<Typography variant="body2">No</Typography>} />
                                    </RadioGroup>
                                </FormControl>
                                {formData.criminal_conviction === '1' && <TextField size="small" fullWidth label="If yes, give Details" name="criminal_details" value={formData.criminal_details} onChange={handleChange} multiline rows={1} sx={{ mt: 1 }} />}
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>

                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Button onClick={onBack} variant="outlined" sx={{ color: '#063455', borderColor: '#063455' }}>
                        Back
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={loading} sx={{ bgcolor: '#063455', '&:hover': { bgcolor: '#0a4d80' } }}>
                        {loading ? 'Saving...' : 'Next'}
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AddForm4;
