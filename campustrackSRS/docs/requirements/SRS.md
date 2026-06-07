# Software Requirements Specification (SRS)
## CampusTrack — Campus Lost & Found Management System

**Version:** 1.0 — Final  
**Course:** Fundamentals of Software Engineering  
**Instructor:** Yared.Y  
**Submission Date:** Final Exam Day  
**Institution:** Addis Ababa University — College of Technology and Built Environment, School of Information Technology and Engineering  

---

## Team Members

| Name | Student ID | Role |
| :--- | :--- | :--- |
| **Abdusalam Oumer** | UGR/3905/17 | Project Manager & Lead |
| **Aymen Abdurezak** | UGR/1169/17 | Lead Backend Developer |
| **Eftiom Aseffa** | UGR/1565/17 | Database Engineer |
| **Abel Dereje** | UGR/5169/17 | Frontend Developer |
| **Biruk Semaw** | UGR/9725/17 | System Architect & QA |
| **Dagim Bezabih** | UGR/3135/17 | Documentation Lead |

---

## Table of Contents
1. **Introduction**
   - 1.1 Purpose
   - 1.2 Document Conventions
   - 1.3 Intended Audience and Reading Suggestions
   - 1.4 Project Scope
   - 1.5 References
2. **Overall Description**
   - 2.1 Product Perspective
   - 2.2 Product Functions
   - 2.3 User Classes and Characteristics
   - 2.4 Operating Environment
   - 2.5 Design and Implementation Constraints
   - 2.6 Assumptions and Dependencies
3. **System Features**
   - 3.1 User Authentication (Register & Login)
   - 3.2 Post Lost Item
   - 3.3 Post Found Item
   - 3.4 Search & Filter
   - 3.5 Matching & Notifications
   - 3.6 Admin Panel & Moderation
4. **External Interface Requirements**
   - 4.1 User Interfaces
   - 4.2 Hardware Interfaces
   - 4.3 Software Interfaces
   - 4.4 Communications Interfaces
5. **Non-Functional Requirements**
   - 5.1 Performance Requirements
   - 5.2 Reliability Requirements
   - 5.3 Security Requirements
   - 5.4 Usability Requirements
   - 5.5 Maintainability & Scalability Requirements
   - 5.6 Database Requirements
6. **Use Case Descriptions**
   - 6.1 UC-01: User Registration
   - 6.2 UC-02: Report Lost Item
   - 6.3 UC-03: Report Found Item
   - 6.4 UC-04: Search and Filter Items
   - 6.5 UC-05: Update Post Status
   - 6.6 UC-06: Moderate Postings (Admin)
7. **System Models**
   - 7.1 Entity-Relationship (ER) Diagram Description
   - 7.2 System Architecture (Client-Server & MVC)
   - 7.3 Data Flow Description
8. **Appendix**
   - 8.1 Glossary of Terms
   - 8.2 Acronyms

---

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to present a complete, detailed Software Requirements Specification (SRS) for the **CampusTrack** (Campus Lost & Found Management System). It defines the functional, non-functional, interface, and behavioral requirements of the system. This document serves as the single source of truth for the student team (designers, backend and frontend developers, database engineers, and testers) and provides the basis for final assessment by the course instructor, Yared.Y, at Addis Ababa University.

### 1.2 Document Conventions
This document adheres to the **IEEE 830-1998 standard** structure. The following conventions are used:
* **Bold text** is used for key technical terms, database entities, and user roles.
* **Requirements** are designated with unique identifier codes:
  * **FR-XX** for Functional Requirements.
  * **NFR-XX** for Non-Functional Requirements.
  * **UC-XX** for Use Cases.
* Priority levels are explicitly designated as *High*, *Medium*, or *Low* to guide development phases.

### 1.3 Intended Audience and Reading Suggestions
This document is structured for multiple stakeholders:
* **Course Instructor (Yared.Y):** Focus on academic compliance, UML models, database schemas, and requirement traceability.
* **Development Team (Abel Dereje, Aymen Abdurezak):** Focus on Sections 3 (System Features), 4 (External Interfaces), and 7 (System Models) to guide implementation.
* **Database Engineer (Eftiom Aseffa):** Focus on Sections 2.5, 5.6, and 7.1 for schema mapping.
* **QA & Architect (Biruk Semaw):** Focus on Section 5 (Non-Functional Requirements) and Section 6 (Use Case Descriptions) for writing test specifications.
* **Project Manager (Abdusalam Oumer):** Focus on the entire document to ensure project bounds and milestones are respected.

### 1.4 Project Scope
CampusTrack is a web-based portal designed to digitize the manual lost-and-found notice boards at Addis Ababa University.
* **In-Scope Functions:**
  * User registration and authentication for AAU students/staff.
  * Lost and found item posting with details (title, category, description, location, date, photo upload).
  * Relational matching algorithm between lost and found items.
  * Comprehensive search and filter facilities.
  * In-app match notifications and post status lifecycle tracking (Active $\rightarrow$ Claimed $\rightarrow$ Closed).
  * Admin dashboard for user management and posting moderation.
* **Out-of-Scope Functions:**
  * Native mobile application wrappers (Android/iOS).
  * Real-time GPS/map tracking.
  * Monetary reward payments or shipping systems.
  * Integration with AAU's main student database portal (Portal/SIS).
  * Live in-app real-time chat (direct contact details will be shared instead).
  * Automated AI image content recognition.

### 1.5 References
1. IEEE Std 830-1998, *IEEE Recommended Practice for Software Requirements Specifications*.
2. Fundamentals of Software Engineering Course Syllabus, School of Information Technology and Engineering, Addis Ababa University.
3. CampusTrack Project Proposal & Statement of Work (SOW), Submitted May 24, 2026.

---

## 2. Overall Description

### 2.1 Product Perspective
CampusTrack is an independent web application. It operates under a classic client-server model, utilizing a web client frontend (HTML/CSS/JS) interacting with a Node.js API backend via HTTPS, backed by a relational database schema. The application does not interface directly with external AAU registry APIs but remains self-contained, using university emails as the validation identifier during registration.

```
+------------------+         HTTPS (JSON)         +--------------------+
|  Web Client      | <==========================> | Express API Server |
|  (HTML/CSS/JS)   |                              +----------+---------+
+------------------+                                         |
                                                             | SQLite / MySQL queries
                                                             v
                                                  +----------+---------+
                                                  | Relational DB      |
                                                  | (MySQL / SQLite)   |
                                                  +--------------------+
```

### 2.2 Product Functions
The high-level functions provided by CampusTrack include:
* **Account Management:** Secure registration, authentication (hashing, JWT credentials), and role division.
* **Reporting Facility:** Forms for reporting lost belongings or reporting found belongings with metadata (location, category, time, upload).
* **Search and Query System:** Multi-parameter search system allowing filtering by item fields.
* **Matching Engine:** Relational matcher that pairs new found-reports with existing lost-reports and alerts users.
* **Dashboard Overview:** Post lifecycle updates and user statistics.
* **Moderation Panel:** Admin utilities to view activity, ban/suspend users, and delete inappropriate content.

### 2.3 User Classes and Characteristics
The system supports three user roles:
1. **Guest (Unregistered User):** Represents any campus visitor. They have read-only access. They can browse listed items and execute searches, but cannot report items, view matches, or view user contact details.
2. **Registered User (Student/Staff):** Represents authenticated members of the AAU community. They have full access to report lost/found items, manage their posts, receive notifications, and claim items.
3. **Administrator:** Represents designated moderators. They have complete oversight of all database records, user flags, suspension statuses, and global metrics.

### 2.4 Operating Environment
* **Server Side:** Node.js runtime environment (version $\ge$ 18.x), Express.js framework, SQLite for local execution, or MySQL version 8.x for deployment.
* **Client Side:** Compatible with modern web browsers (Google Chrome $\ge$ 90, Mozilla Firefox $\ge$ 88, Safari $\ge$ 14, Microsoft Edge $\ge$ 90).
* **Network Host:** Hosted on cloud-based environments (Vercel, Render, Railway).

### 2.5 Design and Implementation Constraints
* **Languages:** Frontend must compile directly in the browser (standard HTML5, CSS3, ES6 JavaScript). Backend must be built using Javascript (Node.js).
* **Storage Limit:** Uploaded item images are constrained to a maximum size of **5 MB** and must be in JPEG or PNG format to preserve disk space.
* **Database Normalization:** Relational design must satisfy at least **Third Normal Form (3NF)** to avoid redundancy and anomalies.
* **Security Constraints:** Sensitive user credentials (passwords) must never be stored in plain text. They must be processed using **bcrypt** salt-hashing.

### 2.6 Assumptions and Dependencies
* **Network Connectivity:** The system assumes users have stable internet access on campus.
* **Browser Capabilities:** The application relies on modern browser capabilities, including LocalStorage for authentication state and `fetch` APIs for asynchronous network calls.
* **Operating Hours:** The backend server runs continuously (99% uptime goal during semesters).

---

## 3. System Features

### 3.1 User Authentication (Register & Login)
#### 3.1.1 Description
Ensures that only authorized students and staff can post items, edit post statuses, and view claim details. Registration requires name, email, and password.

#### 3.1.2 Stimulus/Response Sequences
* **Stimulus:** User inputs email and password, then submits the login form.
* **Response:** Backend validates credentials via bcrypt. If valid, it returns a secure JWT token, and the client redirects the user to their Dashboard.
* **Stimulus:** User attempts to post an item without being logged in.
* **Response:** Frontend interceptor detects the missing token and redirects the user to the login screen.

#### 3.1.3 Functional Requirements
| ID | Requirement Description | Priority |
| :--- | :--- | :--- |
| **FR-01** | The system shall register users with full name, email, and password, validating email format. | High |
| **FR-01.1**| The system shall securely authenticate users using JWT tokens during session login. | High |
| **FR-01.2**| The system shall hash user passwords using the **bcrypt** algorithm prior to database insertion. | High |

---

### 3.2 Post Lost Item
#### 3.2.1 Description
Allows registered users to report an item they have lost on campus, capturing title, description, category, date lost, location lost, and an optional photo.

#### 3.2.2 Stimulus/Response Sequences
* **Stimulus:** User fills out the lost item form, attaches a 2MB JPEG image, and clicks "Post Report".
* **Response:** Backend stores the image on the filesystem, registers the metadata in the items database table with `type = 'lost'`, triggers the match engine, and redirects the user to their dashboard with a success banner.
* **Stimulus:** User uploads a 7MB image.
* **Response:** The system rejects the file on the client side with a warning message: "File exceeds 5MB size limit."

#### 3.2.3 Functional Requirements
| ID | Requirement Description | Priority |
| :--- | :--- | :--- |
| **FR-02** | The system shall allow registered users to post lost item reports containing title, description, category, date lost, location, and optional photo. | High |
| **FR-10** | The system shall support image uploads per posting, limiting files to JPEG/PNG formats under 5 MB. | Medium |

---

### 3.3 Post Found Item
#### 3.3.1 Description
Allows registered users to report an item they found on campus. This form captures identical data points as the lost item form but flags the item type as `found`.

#### 3.3.2 Stimulus/Response Sequences
* **Stimulus:** User completes the found item form with title, location, category, date, and clicks "Submit".
* **Response:** Backend stores details, runs the matching algorithm, and saves notification alerts for matching lost-item owners.

#### 3.3.3 Functional Requirements
| ID | Requirement Description | Priority |
| :--- | :--- | :--- |
| **FR-03** | The system shall allow registered users to post found item reports containing title, description, category, date found, location, and optional photo. | High |
| **FR-06** | The system shall allow post owners to update the status of their postings (`Active` $\rightarrow$ `Claimed` $\rightarrow$ `Closed`). | Medium |

---

### 3.4 Search & Filter
#### 3.4.1 Description
Allows all users (including guests) to locate lost or found listings using keywords, specific categories, location zones, and date ranges.

#### 3.4.2 Stimulus/Response Sequences
* **Stimulus:** User enters "Calculus textbook" in the search box, selects category "Books", and clicks search.
* **Response:** Backend queries the database using SQL filters and returns matching records. The client renders cards of matching items.

#### 3.4.3 Functional Requirements
| ID | Requirement Description | Priority |
| :--- | :--- | :--- |
| **FR-04** | All users (registered and guest) shall search item listings using keyword matches on title/description. | High |
| **FR-04.1**| The system shall support filter parameters including Category, Location, and Date Range. | High |
| **FR-05** | The system shall allow users to click any item card to view its full details. | High |

---

### 3.5 Matching & Notifications
#### 3.5.1 Description
Automates comparison between newly posted items and existing reports, issuing system alerts for users when potential matches are identified.

#### 3.5.2 Stimulus/Response Sequences
* **Stimulus:** User posts a lost item "HP Laptop" in location "Library". Five minutes later, another user posts a found item "HP Laptop" in "Library".
* **Response:** Match Engine finds a high-score overlap (same category, matching terms). It creates a Match record and writes notifications for both users.
* **Stimulus:** User opens their dashboard.
* **Response:** The application polls/renders their unread notifications, presenting a banner: "Potential match found for your HP Laptop report!"

#### 3.5.3 Functional Requirements
| ID | Requirement Description | Priority |
| :--- | :--- | :--- |
| **FR-07** | The system shall automatically parse new postings to locate matches using category and keywords. | Medium |
| **FR-11** | The system shall deliver in-app notifications to users when their posts are matched or claimed. | Medium |

---

### 3.6 Admin Panel & Moderation
#### 3.6.1 Description
Provides administrators with analytics on system usage and controls to manage accounts and moderate listings.

#### 3.6.2 Stimulus/Response Sequences
* **Stimulus:** Administrator logs in, navigates to `/admin.html`.
* **Response:** Frontend renders system stats (total posts, pending, claimed) and displays moderation queues.
* **Stimulus:** Admin identifies a spam post and clicks "Delete Post".
* **Response:** The system removes the post from database listings and updates database statistics.

#### 3.6.3 Functional Requirements
| ID | Requirement Description | Priority |
| :--- | :--- | :--- |
| **FR-08** | The system shall allow administrators to view, edit, approve, and delete any posting. | High |
| **FR-09** | The system shall allow administrators to view activity logs, suspend, or ban user accounts. | High |
| **FR-12** | The system shall display an admin dashboard displaying system-wide summary metrics. | Low |

---

## 4. External Interface Requirements

### 4.1 User Interfaces
* **General Aesthetics:** Modern, responsive, clean, and highly structured layout utilizing a unified color palette (slate gray background, dark indigo headers, and crisp accent highlights).
* **Responsive Breakpoints:** 
  * Mobile viewports (min-width: 360px up to 767px) stack layout components vertically with full-width action buttons.
  * Tablets (768px to 1023px) use grid grids.
  * Desktop monitors (1024px up to 1920px) present horizontal alignments.
* **Aesthetic Details:** Form fields must exhibit active focus styles (colored borders), clear validation text, readable typography (sans-serif Inter/Roboto), and smooth transitions (0.2s linear hover scaling on action cards).

### 4.2 Hardware Interfaces
* **Application Server:** Minimum hardware recommendation: 1 vCPU, 512 MB RAM, and 10 GB SSD space (Standard cloud micro-instance).
* **Client Devices:** Any computing device (PC, tablet, smartphone) with standard screen viewports and an internet browser.

### 4.3 Software Interfaces
* **Database Driver:** Local SQLite database library (`sqlite3` npm dependency).
* **Storage Provider:** Node.js file system APIs to write files to disk.
* **Cryptographic Library:** `bcryptjs` library for credentials hashing.
* **Session Manager:** `jsonwebtoken` package for generation and decoding.

### 4.4 Communications Interfaces
* **Protocol:** All client-server messaging must run over HTTP/1.1 or HTTP/2, encrypted via HTTPS (TLS 1.3 protocol).
* **Format:** Restful endpoints must receive and respond with standard `application/json` data payloads, except for multipart form uploads which carry image binaries.

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements
* **NFR-01 (Load Speed):** The application pages shall render and load all static assets within **3 seconds** under average bandwidth conditions (10 Mbps).
* **NFR-06 (Concurrence):** The system shall handle up to **2,000 concurrent user sessions** without causing memory leaks or service interruption.

### 5.2 Reliability Requirements
* **NFR-02 (Uptime):** The system shall maintain a minimum of **99% operational uptime** during the university academic semester, excluding planned maintenance.

### 5.3 Security Requirements
* **NFR-03 (Password Hashing):** All passwords shall be hashed using **bcrypt** with a work factor (rounds) of 10.
* **NFR-04 (TLS Encryption):** All communication between client and server shall run over HTTPS.
* **JWT Expiration:** Tokens issued to clients shall expire after **24 hours**, forcing re-authentication.

### 5.4 Usability Requirements
* **NFR-05 (Responsiveness):** UI elements must scale smoothly between 360px and 1920px width viewports.
* **Intuitive Design:** The system shall require no user manual; basic features (posting, searching) must be accessible within three clicks from the landing page.

### 5.5 Maintainability & Scalability Requirements
* **NFR-07 (MVC Architecture):** The system codebase shall be organized into distinct, modular directories separating database schemas (**Models**), endpoint routers (**Views/Routes**), and business logic (**Controllers**).
* **Linting:** Code must adhere to standard JavaScript formatting rules (ESLint recommended) to ease collaboration.

### 5.6 Database Requirements
* **NFR-08 (3NF Schema):** Relational tables must conform to Third Normal Form (3NF).
* **Foreign Keys:** Database engine must enforce relational integrity constraints (e.g. `ON DELETE CASCADE` when users are deleted).

---

## 6. Use Case Descriptions

### 6.1 UC-01: User Registration
* **Use Case ID:** UC-01
* **Actor:** Guest (Unregistered)
* **Precondition:** Guest is on the registration screen and is not authenticated.
* **Main Flow:**
  1. User fills in Name, email address, password, and confirmation password.
  2. User clicks "Register".
  3. System validates input data formats and checks if the email is already in use.
  4. System hashes the password using bcrypt.
  5. System records the user details in the **users** table.
  6. System redirects the user to the login screen with a success alert.
* **Alternate Flow:**
  * **Step 3 (Email exists):** System alerts user: "Email already registered." User is prompted to login or recover password.
* **Postcondition:** A new inactive/active user profile is written to the database.

### 6.2 UC-02: Report Lost Item
* **Use Case ID:** UC-02
* **Actor:** Registered User
* **Precondition:** User is authenticated and logged in.
* **Main Flow:**
  1. User clicks "Report Lost Item" button.
  2. System presents the report form.
  3. User enters title, description, category, location, date, and uploads an image (optional).
  4. User clicks "Submit".
  5. System saves the image (if present), registers record under the items table with `type='lost'`.
  6. Match engine runs in background to seek potential matching found-postings.
  7. System redirects user to the dashboard.
* **Alternate Flow:**
  * **Step 5 (Invalid image / size > 5MB):** System flags validation warning, stops submit, and prompts user to select a smaller image.
* **Postcondition:** A new lost-item record is added to the database.

### 6.3 UC-03: Report Found Item
* **Use Case ID:** UC-03
* **Actor:** Registered User
* **Precondition:** User is authenticated and logged in.
* **Main Flow:**
  1. User clicks "Report Found Item".
  2. User populates forms (title, description, category, location found, date, photo).
  3. User submits report.
  4. System saves records with `type='found'` and triggers matching.
* **Alternate Flow:**
  * **Step 4 (Matches found):** Match engine generates overlapping listings. System immediately triggers match notifications for both the finder and the original owner.
* **Postcondition:** A new found-item record is written, and matching flags are updated.

### 6.4 UC-04: Search and Filter Items
* **Use Case ID:** UC-04
* **Actor:** Guest, Registered User
* **Precondition:** Access to the search page.
* **Main Flow:**
  1. User opens the search page.
  2. User enters keywords, selects category, selects location, or restricts date range.
  3. User clicks "Search".
  4. System executes SQL query using conditions and renders results.
* **Alternate Flow:**
  * **Step 4 (No records match):** System displays: "No postings found matching your parameters." Suggests broadening search criteria.
* **Postcondition:** User views matching list matching query constraints.

### 6.5 UC-05: Update Post Status
* **Use Case ID:** UC-05
* **Actor:** Registered User (Post Owner)
* **Precondition:** User is authenticated and owns the active post.
* **Main Flow:**
  1. User views their posts on the Dashboard.
  2. User clicks status action (e.g. "Mark as Claimed" or "Close").
  3. System updates the item status in the items database (`Active` $\rightarrow$ `Claimed` / `Closed`).
  4. System updates dashboard metrics.
* **Postcondition:** Item status is updated, removing the item from active search listings.

### 6.6 UC-06: Moderate Postings (Admin)
* **Use Case ID:** UC-06
* **Actor:** Administrator
* **Precondition:** Admin is logged in with role `admin`.
* **Main Flow:**
  1. Admin opens Admin Portal.
  2. System fetches and displays statistics and listings.
  3. Admin selects a post flagged for spam/inappropriate content and clicks "Delete".
  4. System executes removal from the items table.
* **Alternate Flow:**
  * **Step 3 (Malicious User):** Admin selects user account and clicks "Suspend" or "Ban". User's `is_active` status toggles to FALSE.
* **Postcondition:** Data removed or user deactivated.

---

## 7. System Models

### 7.1 Entity-Relationship (ER) Diagram Description
The database uses a relational structure designed in Third Normal Form (3NF). Relationships are established as follows:

1. **User (1) $\rightarrow$ Lost/Found Items (N):** A user can report multiple items. Relational field: `items.user_id` references `users.id` (one-to-many, `ON DELETE CASCADE`).
2. **Category (1) $\rightarrow$ Items (N):** Each item must belong to exactly one category. Relational field: `items.category_id` references `categories.id` (one-to-many).
3. **Items (1) $\rightarrow$ Match (N):** The **matches** join table pairs lost and found items. Relational fields: `matches.lost_item_id` references `items.id` and `matches.found_item_id` references `items.id`.
4. **User (1) $\rightarrow$ Notifications (N):** Notifications are tied to individual users. Relational field: `notifications.user_id` references `users.id` (one-to-many, `ON DELETE CASCADE`).
5. **Items (1) $\rightarrow$ Notifications (N):** Notifications reference the corresponding item. Relational field: `notifications.item_id` references `items.id` (one-to-many, `ON DELETE CASCADE`).

```
  +--------------+               +---------------+
  |    users     | 1 ------- N > |     items     | < N ------ 1 +------------+
  +--------------+               +-------+-------+              | categories |
  | id (PK)      |                       |                      +------------+
  | full_name    |                       | 1                    | id (PK)    |
  | email (UQ)   |                       |                      | name       |
  | password     |                       v N                    +------------+
  | role         |               +-------+-------+
  | is_active    |               | notifications |
  | created_at   |               +---------------+
  +--------------+               | id (PK)       |
         |                       | user_id (FK)  |
         | 1                     | item_id (FK)  |
         |                       | message       |
         v N                     | is_read       |
  +------+-------+               +---------------+
  |   matches    |
  +--------------+
  | id (PK)      |
  | lost_item_id |
  | found_item_id|
  | match_score  |
  | created_at   |
  +--------------+
```

### 7.2 System Architecture (Client-Server & MVC)
CampusTrack uses the **Model-View-Controller (MVC)** architectural pattern to partition concern layers:
* **Model (Database Layer):** SQL tables, constraints, and data operations handled by our DB connection script.
* **View (Frontend Layer):** Static pages (`/pages/*.html`), styles (`/css/*.css`), and client-side logic scripts (`/js/*.js`). Served to clients.
* **Controller (API Handler Layer):** Backend controllers containing core business logic (authenticating request details, saving assets, calculating matching queries).

```
                +---------------------------------------+
                |                CLIENT                 |
                |   User View (HTML / CSS / JS UI)      |
                +-------------------+-----------^-------+
                                    |           |
                        HTTP Post/  |           | HTTP Response
                        Get JSON    |           | (JSON / Data)
                                    v           |
                +-------------------+-----------+-------+
                |                CONTROLLER             |
                |      Express Routers & Handlers       |
                +-------------------+-----------^-------+
                                    |           |
                        SQL Query   |           | Data Rows
                        Executions  |           | Returned
                                    v           |
                +-------------------+-----------+-------+
                |                 MODEL                 |
                |       SQLite Database Instance        |
                +---------------------------------------+
```

### 7.3 Data Flow Description
* **Authentication Data Flow:** User inputs $\rightarrow$ AuthController checks credentials in DB $\rightarrow$ Generates JWT payload $\rightarrow$ Sends to Client $\rightarrow$ Client attaches Token header for future interactions.
* **Reporting & Matching Data Flow:** User submits Form data + Photo $\rightarrow$ File is written to server storage $\rightarrow$ Item row is written $\rightarrow$ Query searches items for keywords and category intersections $\rightarrow$ If matched, writes rows in notifications and matches $\rightarrow$ Dispatches details to users' dashboards.

---

## 8. Appendix

### 8.1 Glossary of Terms
* **Active Post:** An item posting that is currently open for search and has not been resolved.
* **Claimed:** A post status indicating the item has been reunited with its owner but remains in records for reporting.
* **Closed:** A post status indicating the report is resolved or cancelled, removing it from active listings.
* **Glassmorphism:** A UI design trend featuring translucent backgrounds, soft shadows, and border outlines to resemble frosted glass.
* **Relational Schema:** Structure representing relational tables, keys, and constraint relationships.

### 8.2 Acronyms
* **AAU:** Addis Ababa University
* **API:** Application Programming Interface
* **DFD:** Data Flow Diagram
* **ER:** Entity-Relationship
* **HTTP/HTTPS:** Hypertext Transfer Protocol (Secure)
* **IEEE:** Institute of Electrical and Electronics Engineers
* **JWT:** JSON Web Token
* **MVC:** Model-View-Controller
* **NFR:** Non-Functional Requirement
* **SRS:** Software Requirements Specification
* **TLS:** Transport Layer Security
* **UGR:** Undergraduate Registry (referencing Student ID prefix)
