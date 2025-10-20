# AFOHS Club Database Structure Documentation

## Table Structures and Sample Data

---

## 1. **MEMBERSHIPS Table** (`old_memberships (17).sql`)

### **Table Structure:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | bigint UNSIGNED | Primary Key |
| `application_no` | bigint | Application Number |
| `application_date` | date | Application Date |
| `mem_no` | varchar(255) | Membership Number |
| `membership_date` | date | Membership Date |
| `applicant_name` | varchar(255) | Member Name |
| `mem_category_id` | varchar(255) | Category ID |
| `mem_classification_id` | bigint UNSIGNED | Classification ID |
| `status_remarks` | varchar(255) | Status Remarks |
| `mem_unique_code` | varchar(255) | Unique Code |
| `card_status` | enum | Card Status (In-Process, Printed, Received, Issued, Re-Printed, E-Card Issued) |
| `father_name` | varchar(255) | Father's Name |
| `father_mem_no` | varchar(255) | Father's Membership Number |
| `cnic` | varchar(255) | CNIC Number |
| `date_of_birth` | date | Date of Birth |
| `gender` | enum | Gender (Male, Female, Other) |
| `education` | varchar(255) | Education |
| `ntn` | varchar(191) | NTN Number |
| `reason` | varchar(255) | Reason for Membership |
| `details` | varchar(255) | Additional Details |
| `blood_group` | enum | Blood Group (A+, A-, B+, B-, O+, O-, AB+, AB-) |
| `tel_a` | varchar(255) | Telephone A |
| `tel_b` | varchar(255) | Telephone B |
| `mob_a` | varchar(255) | Mobile A |
| `mob_b` | varchar(255) | Mobile B |
| `personal_email` | varchar(255) | Personal Email |
| `official_email` | varchar(255) | Official Email |
| `card_issued` | tinyint(1) | Card Issued Status |
| `card_issue_date` | date | Card Issue Date |
| `mem_barcode` | varchar(255) | Member Barcode |
| `sup_card_issued` | tinyint(1) | Supplementary Card Issued |
| `sup_card_date` | date | Supplementary Card Date |
| `mem_picture` | text | Member Picture Path |
| `remarks` | varchar(255) | Remarks |
| `active` | tinyint(1) | Active Status |
| `per_address` | varchar(191) | Permanent Address |
| `per_city` | varchar(191) | Permanent City |
| `per_country` | varchar(191) | Permanent Country |
| `cur_address` | varchar(191) | Current Address |
| `cur_city` | varchar(191) | Current City |
| `cur_country` | varchar(191) | Current Country |
| `mem_fee` | varchar(191) | Membership Fee |
| `additional_mem` | varchar(191) | Additional Membership Fee |
| `additional_mem_remarks` | varchar(191) | Additional Fee Remarks |
| `mem_discount` | varchar(191) | Membership Discount |
| `mem_discount_remarks` | varchar(191) | Discount Remarks |
| `total` | int | Total Amount |
| `maintenance_amount` | int | Maintenance Amount |
| `additional_mt` | varchar(191) | Additional Maintenance |
| `additional_mt_remarks` | varchar(191) | Additional Maintenance Remarks |
| `mt_discount` | varchar(191) | Maintenance Discount |
| `mt_discount_remarks` | varchar(191) | Maintenance Discount Remarks |
| `total_maintenance` | int | Total Maintenance |
| `card_exp` | date | Card Expiry Date |
| `maintenance_per_day` | float(8,2) | Maintenance Per Day |
| `active_remarks` | varchar(191) | Active Remarks |
| `from` | date | Valid From |
| `to` | date | Valid To |
| `emergency_name` | varchar(191) | Emergency Contact Name |
| `emergency_relation` | varchar(191) | Emergency Contact Relation |
| `emergency_contact` | varchar(191) | Emergency Contact Number |
| `passport_no` | varchar(191) | Passport Number |
| `title` | varchar(191) | Title |
| `first_name` | varchar(191) | First Name |
| `middle_name` | varchar(191) | Middle Name |
| `name_comment` | varchar(191) | Name Comment |
| `credit_limit` | bigint | Credit Limit |
| `kinship` | bigint | Kinship |
| `transferred_from` | bigint | Transferred From |
| `done_by` | bigint | Done By |
| `coa_category_id` | varchar(191) | COA Category ID |
| `nationality` | bigint | Nationality |
| `created_at` | timestamp | Created At |
| `updated_at` | timestamp | Updated At |
| `deleted_at` | timestamp | Deleted At |
| `created_by` | bigint UNSIGNED | Created By |
| `updated_by` | bigint UNSIGNED | Updated By |
| `deleted_by` | bigint UNSIGNED | Deleted By |

### **Complete Sample Data (First 3 Records - ALL COLUMNS):**

| Column | Record 1 (ID: 101) | Record 2 (ID: 102) | Record 3 (ID: 103) | NULL Count |
|--------|-------------------|-------------------|-------------------|------------|
| **id** | 101 | 102 | 103 | 0/3 |
| **application_no** | 101 | 102 | 103 | 0/3 |
| **application_date** | NULL | NULL | NULL | 3/3 |
| **mem_no** | HY 101 | HY 102 | HY 103 | 0/3 |
| **membership_date** | 2020-03-18 | NULL | NULL | 2/3 |
| **applicant_name** | Butter | Maj. Genereal Shahid Mahmood (Serving) | Prof. Dr. Hassan Amir Shah | 0/3 |
| **mem_category_id** | 11 | 11 | 11 | 0/3 |
| **mem_classification_id** | 2 | 2 | 2 | 0/3 |
| **status_remarks** | NULL | NULL | NULL | 3/3 |
| **mem_unique_code** | NULL | NULL | NULL | 3/3 |
| **card_status** | Issued | Issued | Issued | 0/3 |
| **father_name** | Muhammad Ali Butter | NULL | NULL | 2/3 |
| **father_mem_no** | NULL | NULL | NULL | 3/3 |
| **cnic** | 34101-2550423-9 | NULL | NULL | 2/3 |
| **date_of_birth** | 1965-06-20 | NULL | NULL | 2/3 |
| **gender** | Male | Male | Male | 0/3 |
| **education** | LLB | NULL | NULL | 2/3 |
| **ntn** | NULL | NULL | NULL | 3/3 |
| **reason** | Recreation | NULL | NULL | 2/3 |
| **details** | NULL | NULL | NULL | 3/3 |
| **blood_group** | A+ | A+ | A+ | 0/3 |
| **tel_a** | NULL | NULL | NULL | 3/3 |
| **tel_b** | NULL | NULL | NULL | 3/3 |
| **mob_a** | 03007831111 | (empty) | 3214437750 | 0/3 |
| **mob_b** | 03004006575 | NULL | NULL | 2/3 |
| **personal_email** | maqsoodbutter4@gmail.com | NULL | NULL | 2/3 |
| **official_email** | NULL | NULL | NULL | 3/3 |
| **card_issued** | NULL | NULL | NULL | 3/3 |
| **card_issue_date** | 2020-08-21 | NULL | NULL | 2/3 |
| **mem_barcode** | 101 | 102 | 103 | 0/3 |
| **sup_card_issued** | NULL | NULL | NULL | 3/3 |
| **sup_card_date** | NULL | NULL | NULL | 3/3 |
| **mem_picture** | NULL | NULL | NULL | 3/3 |
| **remarks** | NULL | NULL | NULL | 3/3 |
| **active** | 2 | 1 | 1 | 0/3 |
| **per_address** | NULL | NULL | NULL | 3/3 |
| **per_city** | NULL | NULL | NULL | 3/3 |
| **per_country** | NULL | NULL | NULL | 3/3 |
| **cur_address** | n/a | (empty) | (empty) | 0/3 |
| **cur_city** | Lahore | Lahore | Lahore | 0/3 |
| **cur_country** | pakistan | pakistan | pakistan | 0/3 |
| **mem_fee** | 0 | 10000 | 10000 | 0/3 |
| **additional_mem** | 0 | 0 | 0 | 0/3 |
| **additional_mem_remarks** | NULL | NULL | NULL | 3/3 |
| **mem_discount** | 0 | 10000 | 10000 | 0/3 |
| **mem_discount_remarks** | NULL | NULL | NULL | 3/3 |
| **total** | 0 | 0 | 0 | 0/3 |
| **maintenance_amount** | 2500 | 500 | 500 | 0/3 |
| **additional_mt** | 0 | 0 | 0 | 0/3 |
| **additional_mt_remarks** | NULL | NULL | NULL | 3/3 |
| **mt_discount** | 0 | 0 | 0 | 0/3 |
| **mt_discount_remarks** | NULL | NULL | NULL | 3/3 |
| **total_maintenance** | 2500 | 500 | 500 | 0/3 |
| **card_exp** | 2023-01-01 | NULL | NULL | 2/3 |
| **maintenance_per_day** | 83.33 | 16.67 | 16.67 | 0/3 |
| **active_remarks** | card | NULL | NULL | 2/3 |
| **from** | 1970-01-01 | NULL | NULL | 2/3 |
| **to** | 1970-01-01 | NULL | NULL | 2/3 |
| **emergency_name** | NULL | NULL | NULL | 3/3 |
| **emergency_relation** | NULL | NULL | NULL | 3/3 |
| **emergency_contact** | NULL | NULL | NULL | 3/3 |
| **passport_no** | NULL | NULL | NULL | 3/3 |
| **title** | NULL | NULL | NULL | 3/3 |
| **first_name** | Muhammad | NULL | NULL | 2/3 |
| **middle_name** | Maqsood | NULL | NULL | 2/3 |
| **name_comment** | NULL | NULL | NULL | 3/3 |
| **credit_limit** | NULL | NULL | NULL | 3/3 |
| **kinship** | NULL | NULL | NULL | 3/3 |
| **transferred_from** | NULL | NULL | NULL | 3/3 |
| **done_by** | 496100 | 496100 | 496100 | 0/3 |
| **coa_category_id** | NULL | NULL | NULL | 3/3 |
| **nationality** | NULL | NULL | NULL | 3/3 |
| **created_by** | 5 | NULL | NULL | 2/3 |
| **updated_by** | NULL | NULL | NULL | 3/3 |
| **deleted_by** | NULL | NULL | NULL | 3/3 |
| **created_at** | NULL | NULL | NULL | 3/3 |
| **updated_at** | 2025-10-09 09:21:30 | NULL | NULL | 2/3 |
| **deleted_at** | NULL | NULL | NULL | 3/3 |

---

## 2. **MEM_FAMILIES Table** (`old_mem_families.sql`)

### **Table Structure:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | int | Primary Key |
| `member_id` | int | Member ID (Foreign Key) |
| `next_of_kin` | varchar(191) | Next of Kin |
| `relationship` | varchar(191) | Relationship |
| `name` | varchar(191) | Family Member Name |
| `date_of_birth` | date | Date of Birth |
| `fam_relationship` | varchar(191) | Family Relationship Code |
| `nationality` | varchar(191) | Nationality |
| `cnic` | varchar(191) | CNIC Number |
| `contact` | varchar(191) | Contact Number |
| `maritial_status` | varchar(191) | Marital Status |
| `fam_picture` | text | Family Member Picture |
| `sup_card_no` | varchar(191) | Supplementary Card Number |
| `card_status` | varchar(191) | Card Status |
| `sup_card_issue` | date | Supplementary Card Issue Date |
| `sup_card_exp` | date | Supplementary Card Expiry |
| `sup_barcode` | varchar(191) | Supplementary Barcode |
| `status` | int | Status |
| `member_name` | varchar(191) | Primary Member Name |
| `membership_number` | varchar(191) | Primary Membership Number |
| `remarks` | varchar(191) | Remarks |
| `passport_no` | varchar(191) | Passport Number |
| `title` | varchar(191) | Title |
| `first_name` | varchar(191) | First Name |
| `middle_name` | varchar(191) | Middle Name |
| `name_comment` | varchar(191) | Name Comment |
| `gender` | enum | Gender (Male, Female, Other) |
| `created_at` | timestamp | Created At |
| `updated_at` | timestamp | Updated At |
| `deleted_at` | timestamp | Deleted At |
| `created_by` | bigint UNSIGNED | Created By |
| `updated_by` | bigint UNSIGNED | Updated By |
| `deleted_by` | bigint UNSIGNED | Deleted By |

### **Complete Sample Data (First 3 Family Records - ALL COLUMNS):**

| Column | Record 1 (ID: 2) | Record 2 (ID: 3) | Record 3 (ID: 4) | NULL Count |
|--------|------------------|------------------|------------------|------------|
| **id** | 2 | 3 | 4 | 0/3 |
| **member_id** | 201 | 201 | 201 | 0/3 |
| **next_of_kin** | NULL | NULL | NULL | 3/3 |
| **relationship** | NULL | NULL | NULL | 3/3 |
| **name** | Akhtar | Sharif | Sharif | 0/3 |
| **date_of_birth** | 1968-04-04 | 1992-03-22 | 1993-09-24 | 0/3 |
| **fam_relationship** | 4 | 3 | 3 | 0/3 |
| **nationality** | Pakistani | Pakistani | Pakistani | 0/3 |
| **cnic** | 35202-2616203-8 | 35202-8899208-0 | 35202-8994303-0 | 0/3 |
| **contact** | 00 | 00 | 00 | 0/3 |
| **maritial_status** | Married | Single | Single | 0/3 |
| **fam_picture** | public/familymemberupload/s_img_05-02-2020_06-36-30_1580884590_.Capture.PNG | public/familymemberupload/s_img_05-02-2020_06-42-32_1580884952_.sahar.PNG | public/familymemberupload/s_img_05-02-2020_10-27-50_1580898470_.missing.png | 0/3 |
| **sup_card_no** | FR 201-A | FR 201-B | FR 201-C | 0/3 |
| **card_status** | Issued | Not Applicable | Not Applicable | 0/3 |
| **sup_card_issue** | 2024-09-28 | 2018-08-20 | 2018-08-20 | 0/3 |
| **sup_card_exp** | 2027-09-30 | 2022-12-31 | 2020-08-20 | 0/3 |
| **sup_barcode** | 0014310422 | 201-CC | 201-EE | 0/3 |
| **created_at** | 2020-02-05 01:36:30 | 2020-02-05 01:42:32 | 2020-02-05 03:07:55 | 0/3 |
| **updated_at** | 2024-09-28 13:40:58 | 2022-09-27 12:32:14 | 2022-09-27 12:32:14 | 0/3 |
| **deleted_at** | NULL | NULL | NULL | 3/3 |
| **status** | 1 | 10 | 10 | 0/3 |
| **member_name** | Muhammad Shareef | Muhammad Shareef | Muhammad Shareef | 0/3 |
| **membership_number** | FR 201 | FR 201 | FR 201 | 0/3 |
| **remarks** | NULL | NULL | NULL | 3/3 |
| **passport_no** | NULL | NULL | NULL | 3/3 |
| **created_by** | NULL | NULL | NULL | 3/3 |
| **updated_by** | 11 | 3 | 3 | 0/3 |
| **deleted_by** | NULL | NULL | NULL | 3/3 |
| **title** | NULL | NULL | NULL | 3/3 |
| **first_name** | Nasim | Fatima | Amber | 0/3 |
| **middle_name** | NULL | NULL | NULL | 3/3 |
| **name_comment** | NULL | NULL | NULL | 3/3 |
| **gender** | Female | Female | Female | 0/3 |

---

## **Relationship Codes:**
| Code | Relationship |
|------|-------------|
| 2 | Son |
| 3 | Daughter |
| 4 | Wife/Spouse |
| 9 | Other/Extended Family |

---

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
| id | id |
| application_no  | application_no  |
| mem_no | membership_no |
| membership_date | membership_date |
| applicant_name | full_name |
| mem_category_id (From Table "mem_categories") | member_category_id |
| mem_classification_id (From Table "mem_classifications") | member_classification_id |
| status_remarks | status_remarks (Optional) |
| card_status | card_status |
| father_name | guardian_name |
| father_mem_no | guardian_membership |
| cnic | cnic_no |
| date_of_birth | date_of_birth |
| gender | gender |
| education | education |
| ntn | ntn |
| reason | membership_reason (Need to Change column name to reason) |
| blood_group | blood_group (Optional) |
| mob_a | mobile_number_a |
| mob_b | mobile_number_b |
| tel_a | tel_number_a (Need to Create column) |
| tel_b | tel_number_b (Need to Create column) | 
| personal_email | personal_email |
| office_email | critical_email |
| card_issue_date | card_issue_date |
| mem_barcode | barcode_no |
| mem_picture | profile_photo | (public/upload/xxxxx.png to /tenants/default/membership/xxxxx.png)
| remarks | remarks |
| active (From Table "mem_statuses") | status |
| per_address | permanent_address |
| per_city | permanent_city |
| per_country | permanent_country 
| cur_address | current_address |
| cur_city | current_city |
| cur_country | current_country |
| card_exp | card_expiry_date |
| active_remarks | active_remarks (Need to Create column) |
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
| coa_category_id | coa_account (Need to Change column name to coa_category_id) |
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
| status (From Table "mem_statuses") | status |
| created_at | created_at |
| updated_at | updated_at |
| deleted_at | deleted_at |
| created_by | created_by |
| updated_by | updated_by |
| deleted_by | deleted_by |



## **Key Observations:**

### **Data Relationships:**
- **Primary Members** are stored in `memberships` table
- **Family Members** are stored in `mem_families` table with `member_id` linking to primary member
- **Card Numbers** follow pattern: `[Primary_Mem_No]-[A/B/C/D/E]` for family members

### **Data Quality Issues:**
1. **Missing Data**: Many fields have NULL or empty values
2. **Inconsistent Formats**: Phone numbers, dates, and addresses vary in format
3. **Mixed Data Types**: Some numeric fields stored as varchar
4. **Duplicate Names**: Multiple family members with same first names

### **Migration Considerations:**
1. **Data Cleaning** required before migration
2. **Relationship Mapping** needed for family structure
3. **Card Status Standardization** required
4. **Contact Information Validation** needed
5. **Date Format Standardization** required

---

## **Recommended New Structure:**

Based on the analysis, the new Laravel structure should:
1. **Normalize relationships** between members and families
2. **Standardize data types** and formats
3. **Implement proper validation** for all fields
4. **Create lookup tables** for categories, relationships, etc.
5. **Add proper indexing** for performance
6. **Implement soft deletes** for data integrity
