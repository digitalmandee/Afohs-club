# AFOHS Club Database Structure Documentation

## Table Structures and Sample Data

---

| Old Table | New Table |
|--------|-------------|
| memberships | members |
| mem_families | members (same) |
| mem_categories | member_categories (Already has) |
| mem_classifications | member_classifications (Already has) |

## **Card Status Types:**
| Status | Description |
|--------|-------------|
| Issued | Card has been issued and is active |
| Not Applicable | Card not issued (usually for expired/inactive members) |
| In-Process | Card is being processed |
| Printed | Card has been printed but not issued |
| Received | Card received but not distributed |
| Re-Printed | Card has been re-printed |
| E-Card Issued | Electronic card issued |

---

## **Membership Key Change With:**
| Old Key | New Key |
|--------|-------------|
| id | id (i want same) |
| application_no  | application_no  |
| mem_no | membership_no |
| membership_date | membership_date |
| applicant_name | full_name |
| mem_category_id (From Table "mem_categories") | member_category_id (here you t from old key table mem_categories (unique_code) with new table member_categories (name)  then its id add in new members table) |
| mem_classification_id | classification_id |
| status_remarks | status_remarks (Optional) |
| card_status | card_status |
| father_name | guardian_name |
| father_mem_no | guardian_membership |
| cnic | cnic_no |
| date_of_birth | date_of_birth |
| gender | gender |
| education | education |
| ntn | ntn |
| reason | reason |
| blood_group | blood_group |
| mob_a | mobile_number_a |
| mob_b | mobile_number_b |
| tel_a | tel_number_a |
| tel_b | tel_number_b | 
| personal_email | personal_email |
| office_email | critical_email |
| card_issue_date | card_issue_date |
| mem_barcode | barcode_no |
| mem_picture | profile_photo | (public/upload/xxxxx.png to /tenants/default/membership/xxxxx.png)
| remarks | remarks |
| active (From Table "mem_statuses") | status(Now has Enum) |
| per_address | permanent_address |
| per_city | permanent_city |
| per_country | permanent_country 
| cur_address | current_address |
| cur_city | current_city |
| cur_country | current_country |
| card_exp | card_expiry_date |
| active_remarks | active_remarks |
| from | from_date |
| to | to_date |
| emergency_name | emergency_name |
| emergency_relation | emergency_relation |
| emergency_contact | emergency_contact |
| passport_no | passport_no |
| title | title |
| first_name | first_name |
| middle_name | middle_name |
| name_comment | name_comments |
| kinship | kinship |
| coa_category_id | coa_category_id |
| nationality | nationality |
| created_at | created_at |
| updated_at | updated_at |
| deleted_at | deleted_at |
| created_by | created_by |
| updated_by | updated_by |
| deleted_by | deleted_by |

---

## **Family Member Key Change With:**
| Old Key | New Key |
|--------|-------------|
| member_id  | parent_id  |
| name | full_name |
| date_of_birth | date_of_birth |
| fam_relationship (From Table "mem_relations") | relation |
| nationality | nationality |
| cnic | cnic_no |
| contact | mobile_number_a |
| marital_status | martial_status |
| fam_picture | profile_photo | (public/familymemberupload/xxxxx.png to /tenants/default/familymembers/xxxxx.png)
| sup_card_no | membership_no |
| card_status | card_status |
| sup_card_issue | card_issue_date |
| sup_card_exp | card_expiry_date |
| sup_barcode | barcode_no |
| status (From Table "mem_statuses") | status(Now has Enum) |
| created_at | created_at |
| updated_at | updated_at |
| deleted_at | deleted_at |
| created_by | created_by |
| updated_by | updated_by |
| deleted_by | deleted_by |