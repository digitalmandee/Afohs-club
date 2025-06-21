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

const MembershipDashboard = ({ memberTypesData, userNo, membercategories }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formsData1, setFormsData1] = useState({
        email: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        phone_number: '',
        member_type_id: '',
        profile_photo: '',
        user_details: {
            coa_account: '',
            title: '',
            state: '',
            application_number: '',
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
        },
        member: {
            member_type_id: '',
            membership_category: '',
            membership_date: new Date().toISOString().split('T')[0],
            card_issue_date: new Date().toISOString().split('T')[0],
            card_expiry_date: '',
            from_date: new Date().toISOString().split('T')[0],
            to_date: '',
            card_status: 'active',
        },
        family_members: [],
    });

    const handleChangeData = (name, value) => {
        addDataInState(name, value);
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        addDataInState(name, value);
    };

    const addDataInState = (name, value) => {
        if (name.startsWith('user_details.')) {
            const field = name.split('.')[1];
            setFormsData1((prev) => ({
                ...prev,
                user_details: {
                    ...prev.user_details,
                    [field]: value,
                },
            }));
        } else if (name.startsWith('member.')) {
            const field = name.split('.')[1];
            setFormsData1((prev) => ({
                ...prev,
                member: {
                    ...prev.member,
                    [field]: value,
                },
            }));
            if (field === 'member_type_id') {
                let family_members = formsData1.family_members.map((member) => ({
                    ...member,
                    [field]: value,
                }));
                setCurrentFamilyMember((prev) => ({
                    ...prev,
                    [field]: value,
                }));
                setFormsData1((prev) => ({
                    ...prev,
                    family_members: family_members,
                }));
            }
        } else if (name.startsWith('family_members.')) {
            const index = parseInt(name.split('.')[1], 10);
            setFormsData1((prev) => ({
                ...prev,
                family_members: prev.family_members.map((member, i) => (i === index ? { ...member, [name.split('.')[2]]: value } : member)),
            }));
        } else {
            setFormsData1((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    useEffect(() => {
        const { card_issue_date, card_expiry_date } = formsData1.member;

        if (!card_issue_date || !card_expiry_date) return;

        const issueDate = new Date(card_issue_date);
        const expiryDate = new Date(card_expiry_date);

        formsData1.family_members.forEach((fm, idx) => {
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
    }, [formsData1.member.card_issue_date, formsData1.member.card_expiry_date, formsData1.family_members]);

    const [currentFamilyMember, setCurrentFamilyMember] = useState({
        user_id: '',
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
        const formData2 = objectToFormData(formsData1);

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
                    {step === 1 && <AddForm1 setData={setFormsData1} data={formsData1} handleChange={handleChange} userNo={userNo} onNext={() => setStep(2)} />}
                    {step === 2 && <AddForm2 setData={setFormsData1} data={formsData1} handleChange={handleChange} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
                    {step === 3 && <AddForm3 setData={setFormsData1} data={formsData1} handleChange={handleChange} handleChangeData={handleChangeData} setCurrentFamilyMember={setCurrentFamilyMember} currentFamilyMember={currentFamilyMember} userNo={userNo} memberTypesData={memberTypesData} onSubmit={handleFinalSubmit} onBack={() => setStep(2)} loading={loading} membercategories={membercategories} />}
                </div>
            </div>
        </>
    );
};

export default MembershipDashboard;
