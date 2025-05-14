import { useState } from 'react';
import { Typography, Button, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideNav from '@/components/App/AdminSideBar/SideNav';
import { router } from '@inertiajs/react';
import AddForm1 from '@/components/App/membershipForm/AddForm1';
import AddForm2 from '@/components/App/membershipForm/AddForm2';
import AddForm3 from '@/components/App/membershipForm/AddForm3';

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
        const fullData = {
            application_number: '7171', // Hardcoded as shown in AddForm1
            name_comments: formData.step1.nameComments || '',
            guardian_name: formData.step1.fatherHusbandName || '',
            guardian_membership: formData.step1.fatherMembershipNo || '',
            nationality: formData.step1.nationality || '',
            cnic_no: formData.step1.cnicNo || '',
            passport_no: formData.step1.passportNo || '',
            gender: formData.step1.gender || '',
            ntn: formData.step1.ntn || '',
            date_of_birth: formData.step1.dateOfBirth || '',
            education: formData.step1.education ? [formData.step1.education] : [], // Convert string to array
            membership_reason: formData.step1.membershipReason || '',
            // AddForm2 fields
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
            // AddForm3 fields
            member_type: data.memberType || '', // Uncommented to include memberType
            membership_category: data.membershipCategory || '',
            membership_number: data.membershipNumber || '',
            membership_date: data.membershipDate || '',
            card_status: data.cardStatus || '',
            card_issue_date: data.cardIssueDate || '',
            card_expiry_date: data.cardExpiryDate || '',
            from_date: data.fromDate || '',
            to_date: data.toDate || '',
            family_members: data.familyMembers || [],
            // Images (base64 strings)
            member_image: formData.step1.memberImage || null,
        };

        router.post('/membership/store', fullData, {
            onSuccess: () => {
                alert('Membership details submitted successfully.');
            },
            onError: (errors) => {
                alert('Submission failed: ' + JSON.stringify(errors));
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
