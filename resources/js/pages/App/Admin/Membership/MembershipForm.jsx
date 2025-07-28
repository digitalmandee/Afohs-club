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
    const [step, setStep] = useState(3);
    const [sameAsCurrent, setSameAsCurrent] = useState(false);

    const getNormalizedUserData = (user) => {
        if (!user) return defaultFormData;

        return {
            user_id: user.id || '',
            email: user.email || '',
            first_name: user.first_name || '',
            middle_name: user.middle_name || '',
            last_name: user.last_name || '',
            phone_number: user.phone_number || '',
            profile_photo: user.profile_photo || '',
            member: {
                application_no: user.member?.application_no || '',
                membership_no: user.member?.membership_no || '',
                kinship: user.member?.kinship || '',
                member_type_id: user.member?.member_type_id || '',
                membership_category: user.member?.member_category_id || '',
                membership_date: user.member?.membership_date || new Date().toISOString().split('T')[0],
                card_issue_date: user.member?.card_issue_date || new Date().toISOString().split('T')[0],
                card_expiry_date: user.member?.card_expiry_date || '',
                is_document_missing: user.member?.is_document_missing || false,
                missing_documents: user.member?.missing_documents || [],
                card_status: user.member?.card_status || 'In-Process',
                status: user.member?.status || 'active',
                coa_account: user.user_detail?.coa_account || '',
                title: user.user_detail?.title || '',
                state: user.user_detail?.state || '',
                application_number: user.user_detail?.application_number || '',
                name_comments: user.user_detail?.name_comments || '',
                guardian_name: user.user_detail?.guardian_name || '',
                guardian_membership: user.user_detail?.guardian_membership || '',
                nationality: user.user_detail?.nationality || '',
                cnic_no: user.user_detail?.cnic_no || '',
                passport_no: user.user_detail?.passport_no || '',
                gender: user.user_detail?.gender || '',
                ntn: user.user_detail?.ntn || '',
                date_of_birth: user.user_detail?.date_of_birth || '',
                education: user.user_detail?.education || '',
                membership_reason: user.user_detail?.membership_reason || '',
                mobile_number_a: user.user_detail?.mobile_number_a || '',
                mobile_number_b: user.user_detail?.mobile_number_b || '',
                mobile_number_c: user.user_detail?.mobile_number_c || '',
                telephone_number: user.user_detail?.telephone_number || '',
                critical_email: user.user_detail?.critical_email || '',
                emergency_name: user.user_detail?.emergency_name || '',
                emergency_relation: user.user_detail?.emergency_relation || '',
                emergency_contact: user.user_detail?.emergency_contact || '',
                current_address: user.user_detail?.current_address || '',
                current_city: user.user_detail?.current_city || '',
                current_country: user.user_detail?.current_country || '',
                permanent_address: user.user_detail?.permanent_address || '',
                permanent_city: user.user_detail?.permanent_city || '',
                permanent_country: user.user_detail?.permanent_country || '',
                country: user.user_detail?.country || '',
                documents: user.member?.documents || [],
                previewFiles: user.member?.documents || [],
            },
            family_members: familyMembers || [],
        };
    };

    const defaultFormData = {
        email: '',
        phone_number: '',
        profile_photo: '',
        member: {
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
        },
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

    const addDataInState = (name, value) => {
        const updatedUserDetails = { ...formsData.member };

        if (name.startsWith('member.')) {
            const field = name.split('.')[1];
            updatedUserDetails[field] = value;
            // Sync permanent address if checkbox is checked
            if (sameAsCurrent) {
                if (field === 'current_address') updatedUserDetails.permanent_address = value;
                if (field === 'current_city') updatedUserDetails.permanent_city = value;
                if (field === 'current_country') updatedUserDetails.permanent_country = value;
            }

            setFormsData((prev) => ({
                ...prev,
                member: updatedUserDetails,
            }));
            if (field === 'member_type_id' || field === 'membership_category') {
                let family_members = formsData.family_members.map((member) => ({
                    ...member,
                    [field]: value,
                }));
                setCurrentFamilyMember((prev) => ({
                    ...prev,
                    [field]: value,
                }));
                setFormsData((prev) => ({
                    ...prev,
                    family_members: family_members,
                }));
            }
        } else if (name.startsWith('family_members.')) {
            const index = parseInt(name.split('.')[1], 10);
            setFormsData((prev) => ({
                ...prev,
                family_members: prev.family_members.map((member, i) => (i === index ? { ...member, [name.split('.')[2]]: value } : member)),
            }));
        } else {
            setFormsData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    useEffect(() => {
        const { card_issue_date, card_expiry_date } = formsData.member;

        if (!card_issue_date || !card_expiry_date) return;

        const issueDate = new Date(card_issue_date);
        const expiryDate = new Date(card_expiry_date);

        formsData.family_members.forEach((fm, idx) => {
            const start = new Date(fm.start_date);
            const end = new Date(fm.end_date);
            console.log(issueDate, expiryDate);
            console.log('yes');

            if (isNaN(start) || isNaN(end)) return; // Skip invalid

            const isFuture = start > expiryDate && end > expiryDate;
            const isInRange = start >= issueDate && end <= expiryDate;

            if (isFuture) {
                console.error(`❌ Family member at index ${idx} has dates in the future beyond new card expiry`);
            } else if (!isInRange && end > expiryDate) {
                console.warn(`⚠️ Family member at index ${idx} has range partly outside the card date range`);
            } else {
                console.log(`✅ Family member at index ${idx} is within date range`);
            }
        });
    }, [formsData.member.card_issue_date, formsData.member.card_expiry_date, formsData.family_members]);

    const [currentFamilyMember, setCurrentFamilyMember] = useState({
        application_no: '',
        family_suffix: '',
        full_name: '',
        relation: '',
        cnic: '',
        phone_number: '',
        email: '',
        member_type_id: '',
        membership_category: '',
        start_date: '',
        end_date: '',
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
                if (error.response && error.response.status === 422 && error.response.data.errors) {
                    const errors = error.response.data.errors;
                    Object.keys(errors).forEach((field) => {
                        const label = field.replace(/\./g, ' → ');
                        errors[field].forEach((message) => {
                            enqueueSnackbar(`${label}: ${message}`, { variant: 'error' });
                        });
                    });
                } else {
                    console.error(error);
                    if (error.response && error.response.data.error) {
                        enqueueSnackbar(error.response.data.error, { variant: 'error' });
                    } else {
                        enqueueSnackbar('Something went wrong.', { variant: 'error' });
                    }
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
                <div className="">
                    {step === 1 && <AddForm1 data={formsData} handleChange={handleChange} onNext={() => setStep(2)} />}
                    {step === 2 && <AddForm2 data={formsData} handleChange={handleChange} onNext={() => setStep(3)} onBack={() => setStep(1)} sameAsCurrent={sameAsCurrent} setSameAsCurrent={setSameAsCurrent} />}
                    {step === 3 && <AddForm3 data={formsData} handleChange={handleChange} handleChangeData={handleChangeData} setCurrentFamilyMember={setCurrentFamilyMember} currentFamilyMember={currentFamilyMember} memberTypesData={memberTypesData} onSubmit={handleFinalSubmit} onBack={() => setStep(2)} loading={loading} membercategories={membercategories} />}
                </div>
            </div>
        </>
    );
};

export default MembershipDashboard;
