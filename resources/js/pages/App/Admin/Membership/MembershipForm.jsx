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
import Payment from './Payment';
import axios from 'axios';
import { objectToFormData } from '@/helpers/objectToFormData';

const drawerWidthOpen = 240;
const drawerWidthClosed = 110;

const MembershipDashboard = ({ memberTypesData, userNo }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        step1: {},
        step2: {},
        step3: {},
    });
    console.log('memberTypesData', memberTypesData);

    const handleNext = (stepKey, data) => {
        setFormData((prev) => ({ ...prev, [stepKey]: data }));
        console.log(stepKey);

        if (stepKey === 'step1') setStep(2);
        if (stepKey === 'step2') setStep(3);
    };

    const handleFinalSubmit = async (stepKey, data) => {
        setFormData((prev) => ({ ...prev, [stepKey]: data }));
        // Transform familyMembers to match backend validation keys
        const transformedFamilyMembers = (data.family_members || []).map((member) => ({
            full_name: member.full_name || '',
            relation: member.relation || '',
            cnic: member.cnic || '',
            phone_number: member.phone_number || '',
            email: member.email || '',
            membership_type: member.membership_type || '',
            membership_category: member.membership_category || '',
            start_date: member.start_date || '',
            end_date: member.end_date || '',
            picture: member.picture || '', // Base64 string
        }));

        const fullData = {
            application_number: userNo ?? 0,
            profile_photo: formData.step1.profile_photo,
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
        };

        console.log('Submitting fullData:', fullData);
        setLoading(true);

        console.log('fullData: ', fullData);

        const formData2 = await objectToFormData(fullData);

        await axios
            .post(route('membership.store'), formData2)
            .then((response) => {
                const memberId = response.data.member_id;

                enqueueSnackbar('Membership created successfully.', { variant: 'success' });

                // Redirect with query param
                router.visit(route('membership.allpayment') + `?member_id=${memberId}`);
            })
            .catch((error) => {
                console.error(error);
                enqueueSnackbar('Something went wrong.', { variant: 'error' });
            })
            .finally(() => {
                setLoading(false);
            });
        // router.post(route('membership.store'), fullData, {
        //     onSuccess: (page) => {
        //         setLoading(false);
        //         console.log('page', page);

        //         const memberId = page.props?.member_id;

        //         enqueueSnackbar('Membership created successfully.', { variant: 'success' });

        //         router.visit(route('membership.allpayment') + `?member_id=${memberId}`);
        //     },
        //     onError: (errors) => {
        //         setLoading(false);
        //         enqueueSnackbar('Something went wrong: ' + JSON.stringify(errors), { variant: 'error' });
        //         // alert('Submission failed: ' + JSON.stringify(errors));
        //     },
        // });
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
                {/* <pre>{JSON.stringify(memberTypesData, null, 2)}</pre> */}
                <div className="">
                    {step === 1 && <AddForm1 userNo={userNo} onNext={(data) => handleNext('step1', data)} />}
                    {step === 2 && <AddForm2 onNext={(data) => handleNext('step2', data)} onBack={() => setStep(1)} />}
                    {step === 3 && <AddForm3 userNo={userNo} memberTypesData={memberTypesData} onSubmit={(data) => handleFinalSubmit('step3', data)} onBack={() => setStep(2)} loading={loading} />}
                </div>
            </div>
        </>
    );
};

export default MembershipDashboard;
