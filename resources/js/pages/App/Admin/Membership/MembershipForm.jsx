import { useEffect, useState } from 'react';
import { Typography, Button, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';
import AddForm1 from '@/components/App/membershipForm/AddForm1';
import AddForm2 from '@/components/App/membershipForm/AddForm2';
import AddForm3 from '@/components/App/membershipForm/AddForm3';
import { enqueueSnackbar } from 'notistack';
import Payment from './Payment';
import axios from 'axios';
import { objectToFormData } from '@/helpers/objectToFormData';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const MembershipDashboard = ({ membershipNo, applicationNo, memberTypesData, membercategories, familyMembers, user }) => {
    const [open, setOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [sameAsCurrent, setSameAsCurrent] = useState(false);

    const getNormalizedUserData = (user) => {
        if (!user) return defaultFormData;

        return {
            member_id: user.id || '',
            profile_photo: user.profile_photo || '',
            application_no: user.application_no || '',
            first_name: user.first_name || '',
            middle_name: user.middle_name || '',
            last_name: user.last_name || '',
            membership_no: user.membership_no || '',
            kinship: user.kinship || '',
            member_type_id: user.member_type_id || '',
            membership_category: user.member_category_id || '',
            membership_date: user.membership_date || new Date().toISOString().split('T')[0],
            card_issue_date: user.card_issue_date || new Date().toISOString().split('T')[0],
            card_expiry_date: user.card_expiry_date || '',
            is_document_missing: user.is_document_missing || false,
            missing_documents: user.missing_documents || [],
            card_status: user.card_status || 'In-Process',
            status: user.status || 'active',
            coa_account: user.coa_account || '',
            title: user.title || '',
            state: user.state || '',
            application_number: user.application_number || '',
            name_comments: user.name_comments || '',
            guardian_name: user.guardian_name || '',
            guardian_membership: user.guardian_membership || '',
            nationality: user.nationality || '',
            cnic_no: user.cnic_no || '',
            passport_no: user.passport_no || '',
            gender: user.gender || '',
            ntn: user.ntn || '',
            date_of_birth: user.date_of_birth || '',
            education: user.education || '',
            membership_reason: user.membership_reason || '',
            mobile_number_a: user.mobile_number_a || '',
            mobile_number_b: user.mobile_number_b || '',
            mobile_number_c: user.mobile_number_c || '',
            telephone_number: user.telephone_number || '',
            personal_email: user.personal_email || '',
            critical_email: user.critical_email || '',
            emergency_name: user.emergency_name || '',
            emergency_relation: user.emergency_relation || '',
            emergency_contact: user.emergency_contact || '',
            current_address: user.current_address || '',
            current_city: user.current_city || '',
            current_country: user.current_country || '',
            permanent_address: user.permanent_address || '',
            permanent_city: user.permanent_city || '',
            permanent_country: user.permanent_country || '',
            country: user.country || '',
            documents: user.documents || [],
            previewFiles: user.documents || [],
            family_members: familyMembers || [],
        };
    };

    const defaultFormData = {
        profile_photo: '',
        application_no: applicationNo,
        member_type_id: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        kinship: '',
        membership_no: membershipNo,
        membership_category: '',
        is_document_missing: false,
        missing_documents: '',
        membership_date: new Date().toISOString().split('T')[0],
        card_issue_date: new Date().toISOString().split('T')[0],
        card_expiry_date: '',
        card_status: 'In-Process',
        status: 'active',
        coa_account: '',
        title: '',
        state: '',
        name_comments: '',
        guardian_name: '',
        guardian_membership: '',
        nationality: '',
        cnic_no: '',
        passport_no: '',
        gender: '',
        ntn: '',
        date_of_birth: '',
        education: '',
        membership_reason: '',
        mobile_number_a: '',
        mobile_number_b: '',
        mobile_number_c: '',
        telephone_number: '',
        personal_email: '',
        critical_email: '',
        emergency_name: '',
        emergency_relation: '',
        emergency_contact: '',
        current_address: '',
        current_city: '',
        current_country: '',
        permanent_address: '',
        permanent_city: '',
        permanent_country: '',
        country: '',
        documents: [],
        previewFiles: [],
        family_members: [],
    };

    const [formsData, setFormsData] = useState(getNormalizedUserData(user));

    const handleChangeData = (name, value) => {
        addDataInState(name, value);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        addDataInState(name, value);
    };

    useEffect(() => {
        if (!sameAsCurrent) return;

        setFormsData((prev) => ({
            ...prev,
            permanent_address: prev.current_address || '',
            permanent_city: prev.current_city || '',
            permanent_country: prev.current_country || '',
        }));
    }, [formsData.current_address, formsData.current_city, formsData.current_country, sameAsCurrent]);

    const addDataInState = (name, value) => {
        if (['member_type_id', 'membership_category'].includes(name)) {
            const updatedFamily = formsData.family_members.map((member) => ({
                ...member,
                [name]: value,
            }));
            setCurrentFamilyMember((prev) => ({ ...prev, [name]: value }));
            setFormsData((prev) => ({
                ...prev,
                [name]: value,
                family_members: updatedFamily,
            }));
        } else if (name.startsWith('family_members.')) {
            const index = parseInt(name.split('.')[1], 10);
            const field = name.split('.')[2];
            setFormsData((prev) => ({
                ...prev,
                family_members: prev.family_members.map((member, i) => (i === index ? { ...member, [field]: value } : member)),
            }));
        } else {
            setFormsData((prev) => ({ ...prev, [name]: value }));
        }
    };

    useEffect(() => {
        const { card_issue_date, card_expiry_date } = formsData;

        if (!card_issue_date || !card_expiry_date) return;

        const issueDate = new Date(card_issue_date);
        const expiryDate = new Date(card_expiry_date);

        formsData.family_members.forEach((fm, idx) => {
            const start = new Date(fm.start_date);
            const end = new Date(fm.end_date);

            if (isNaN(start) || isNaN(end)) return;

            const isFuture = start > expiryDate && end > expiryDate;
            const isInRange = start >= issueDate && end <= expiryDate;

            if (isFuture) {
                console.error(`❌ Family member at index ${idx} has dates in the future`);
            } else if (!isInRange && end > expiryDate) {
                console.warn(`⚠️ Family member at index ${idx} is partly outside the range`);
            } else {
                console.log(`✅ Family member ${idx} is valid`);
            }
        });
    }, [formsData.card_issue_date, formsData.card_expiry_date, formsData.family_members]);

    const [currentFamilyMember, setCurrentFamilyMember] = useState({
        id: 'new',
        application_no: '',
        family_suffix: '',
        full_name: '',
        relation: '',
        cnic: '',
        phone_number: '',
        email: '',
        member_type_id: '',
        membership_category: '',
        date_of_birth: '',
        start_date: '',
        end_date: '',
        card_issue_date: '',
        card_expiry_date: '',
        status: 'active',
        picture: null,
        picture_preview: null,
    });

    const handleFinalSubmit = async () => {
        setLoading(true);
        const formData2 = objectToFormData(formsData);

        const isEditMode = !!user?.id;
        const url = isEditMode ? route('membership.update', user.id) : route('membership.store');

        await axios
            .post(url, formData2)
            .then((response) => {
                enqueueSnackbar(`Membership ${isEditMode ? 'updated' : 'created'} successfully.`, { variant: 'success' });

                const invoiceNo = response.data?.invoice_no || user.invoice_id;
                if (!isEditMode) {
                    router.visit(route('membership.allpayment') + `?invoice_no=${invoiceNo}`);
                } else {
                    router.visit(route('membership.dashboard'));
                }
            })
            .catch((error) => {
                if (error.response?.status === 422 && error.response.data.errors) {
                    Object.entries(error.response.data.errors).forEach(([field, messages]) => {
                        const label = field.replace(/\./g, ' → ');
                        messages.forEach((msg) => enqueueSnackbar(`${label}: ${msg}`, { variant: 'error' }));
                    });
                } else {
                    enqueueSnackbar(error.response?.data?.error || 'Something went wrong.', { variant: 'error' });
                }
            })
            .finally(() => setLoading(false));
    };

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
                <div>
                    {step === 1 && <AddForm1 data={formsData} handleChange={handleChange} onNext={() => setStep(2)} />}
                    {step === 2 && <AddForm2 data={formsData} handleChange={handleChange} onNext={() => setStep(3)} onBack={() => setStep(1)} sameAsCurrent={sameAsCurrent} setSameAsCurrent={setSameAsCurrent} />}
                    {step === 3 && <AddForm3 data={formsData} handleChange={handleChange} handleChangeData={handleChangeData} setCurrentFamilyMember={setCurrentFamilyMember} currentFamilyMember={currentFamilyMember} memberTypesData={memberTypesData} onSubmit={handleFinalSubmit} onBack={() => setStep(2)} loading={loading} membercategories={membercategories} />}
                </div>
            </div>
        </>
    );
};

export default MembershipDashboard;
