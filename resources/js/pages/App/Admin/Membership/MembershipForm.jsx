import { useState } from 'react';
import { Typography, Button, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';
import AddForm1 from '@/components/App/membershipForm/AddForm1';
import AddForm2 from '@/components/App/membershipForm/AddForm2';
import AddForm3 from '@/components/App/membershipForm/AddForm3';
import { enqueueSnackbar } from 'notistack';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const MembershipDashboard = () => {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        step1: {},
        step2: {},
        step3: {},
    });

    const handleNext = (stepKey, data) => {
        setFormData((prev) => ({ ...prev, [stepKey]: data }));
        console.log(stepKey);

        if (stepKey === 'step1') setStep(2);
        if (stepKey === 'step2') setStep(3);
    };

    const handleFinalSubmit = (stepKey, data) => {
        setFormData((prev) => ({ ...prev, [stepKey]: data }));
        // Transform familyMembers to match backend validation keys
        const transformedFamilyMembers = (data.family_members || []).map((member) => ({
            full_name: member.fullName || '',
            relation: member.relation || '',
            cnic: member.cnic || '',
            phone_number: member.phoneNumber || '',
            membership_type: member.member_type || '',
            membership_category: member.membership_category || '',
            start_date: member.startDate || '',
            end_date: member.endDate || '',
            picture: member.picturePreview || '', // Base64 string
        }));

        const fullData = {
            application_number: '7171',
            first_name: formData.step1.firstName || '',
            middle_name: formData.step1.middleName || '',
            last_name: formData.step1.lastName || '',
            name_comments: formData.step1.nameComments || '',
            guardian_name: formData.step1.fatherHusbandName || '',
            guardian_membership: formData.step1.fatherMembershipNo || '',
            nationality: formData.step1.nationality || '',
            cnic_no: formData.step1.cnicNo || '',
            passport_no: formData.step1.passportNo || '',
            gender: formData.step1.gender || '',
            ntn: formData.step1.ntn || '',
            date_of_birth: formData.step1.dateOfBirth || '',
            education: formData.step1.education ? [formData.step1.education] : [],
            membership_reason: formData.step1.membershipReason || '',
            coa_account: formData.step1.coaAccount || '',
            title: formData.step1.title || '',
            mobile_number_a: formData.step2.mobileNumberA || '',
            mobile_number_b: formData.step2.mobileNumberB || '',
            mobile_number_c: formData.step2.mobileNumberC || '',
            telephone_number: formData.step2.telephoneNumber || '',
            personal_email: formData.step2.personalEmail || '',
            critical_email: formData.step2.criticalEmail || '',
            emergency_name: formData.step2.emergencyName || '',
            emergency_relation: formData.step2.emergencyRelation || '',
            emergency_contact: formData.step2.emergencyContact || '',
            current_address: formData.step2.currentAddress || '',
            current_city: formData.step2.currentCity || '',
            current_country: formData.step2.currentCountry || '',
            permanent_address: formData.step2.permanentAddress || '',
            permanent_city: formData.step2.permanentCity || '',
            permanent_country: formData.step2.permanentCountry || '',
            member_type: data.member_type || '',
            membership_category: data.membership_category || '',
            membership_number: data.membership_number || '',
            membership_date: data.membership_date || '',
            card_status: data.card_status || '',
            card_issue_date: data.card_issue_date || '',
            card_expiry_date: data.card_expiry_date || '',
            from_date: data.from_date || '',
            to_date: data.to_date || '',
            family_members: transformedFamilyMembers,
            member_image: formData.step1.memberImage || null,
        };

        console.log('Submitting fullData:', fullData);

        router.post(route('membership.store'), fullData, {
            onSuccess: () => {
                enqueueSnackbar('Membership created successfully.', { variant: 'success' });
            },
            onError: (errors) => {
                enqueueSnackbar('Something went wrong: ' + JSON.stringify(errors), { variant: 'error' });
                // alert('Submission failed: ' + JSON.stringify(errors));
            },
        });
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
                    {step === 1 && <AddForm1 onNext={(data) => handleNext('step1', data)} />}
                    {step === 2 && <AddForm2 onNext={(data) => handleNext('step2', data)} onBack={() => setStep(1)} />}
                    {step === 3 && <AddForm3 onSubmit={(data) => handleFinalSubmit('step3', data)} onBack={() => setStep(2)} />}
                </div>
            </div>
        </>
    );
};

export default MembershipDashboard;
