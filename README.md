Smart IARA Management System

This document describes the OTJ project for the digital fishery and inspection tracking platform.
1. Assignment Goals

The Smart IARA system is a platform that allows authorized fishermen to manage their digital logbooks, check permits, and register catches, while providing inspectors with tools to track violations and monitor the fishing fleet. The system stores detailed information on all national water bodies, available fish species (with their biological restrictions), and registered commercial vessels. Inspectors can query data, perform on-site checks, evaluate real-time analytics dashboards, and issue fines electronically.

## 2. Expectations from the interviewee

Numerous components are present in a typical fishery reporting system, each with specific constraints and requirements placed on them. The following provides an overview of some of the main expectations that the interviewer will want to hear you discuss in more detail during the interview.

### 2.1. Coordinate and Location Verification
Selecting a location on the map is an essential part of the catch reporting module. The system has to make sure that people register entries validly:
* How will the system make sure that coordinates do not fall on land?
* Will there be an external API integration (e.g., Nominatim Reverse Geocoding) to validate water bodies?
* How does the system handle map pinpointing responsiveness on mobile devices?

### 2.2. Validation and Assistant Logic
One of the most significant attributes of the application is preventing illegal fishing records automatically:
* How are seasonal breeding bans and minimum size limits cross-referenced in real time?
* Does the client-side UI guide the user dynamically with visual alerts (e.g., turning fields red) before data submission?

### 2.3. Administrative Privileges and Security
The access structure needs to be strictly secured based on roles:
* How will the system differentiate standard fishermen from high-privilege inspectors?
* Are there custom backend decorators implemented to secure sensitive data routes (like fine registries)?

### 2.4. Data Analytics and Concurrency
There will be massive amounts of logs and statistics handled by the database layer:
* How are the catch data streams aggregated into structural formats (JSON) to feed interactive charts?
* How does the system ensure transaction safety and robust error handling (`try-except` blocks) to prevent database damage or crashes during data synchronization?

---

## 3. Requirements for the Smart IARA System

The following are the requirements that have been successfully implemented across the development stages:

### Stage One
* **R1:** There exist multiple database instances tracking user profiles (`User`), separating administrative accounts from standard fishing roles.
* **R2:** Modern codebase structure following a clean **MVC-like modular separation** where schemas reside in `models.py` and application routing is handled within `app.py`.
* **R3:** Interactive **MapViewer** module built using **Leaflet.js** and **OpenStreetMap** inside `script.js` to extract precise `lat` and `lng` coordinates automatically.
* **R4:** Detailed system technical documentation provided directly within the `README.md` markdown file.

### Stage Two
* **R5:** Dynamic scheduling component utilizing **Flatpickr** with custom JavaScript filters to automatically restrict social fishing events exclusively to weekends.
* **R6:** Fully responsive interface styled through clean, modular external style sheets (`base.css`, `index.css`, `user.css`, and `admin.css`) to ensure compatibility with mobile deployment on the field.
* **R7:** Smart client-side input validation assistant acting as a real-time regulatory filter against illegal fishing entries.

### Stage Three
* **R8:** **Electronic Reporting System (ERS)** infrastructure managing unique alphanumeric traceability delivery codes generated via `uuid`.
* **R9:** Specialized **Inspection Module** enabling authorized personnel to log violations, add descriptive operational notes, and manage fine allocations (`fine_amount`).
* **R10:** Dynamic analytical dashboard running on **Chart.js** (`admin_charts.js`) that renders visual catch distributions and statistical activity maps based on live JSON endpoints.
* **R11:** Advanced biological knowledge registry tracking legal size constraints and breeding season calendars for key fish species.

### Stage Four
* **R12:** National **Fishing Vessel Registry** implementing the `FishingVessel` data model to record technical vessel attributes: European **CFR codes**, external marking tags, tonnage, and engine power parameters.
* **R13:** Automated automated permit validity tracking logic utilizing backend property decorators to monitor expiration timelines (`valid_until`) in real time.
* **R14:** Deployment of dedicated utility tools such as `migrate_db.py` to seamlessly seed database configurations and manage active system schema adjustments.

### Stage Five
* **R15:** Advanced **GIS Verification Engine** integrating the **Nominatim Reverse Geocoding API** to cross-reference location pins and block entries recorded outside legal water bodies.
* **R16:** Multimedia evidence module supporting file uploads into the secure `uploads/` path, mapping catch photos securely with randomized UUID keys.
* **R17:** Automated route-mapping generation providing instant Google Maps redirection links for active inspector patrol logistics.
* **R18:** Comprehensive **Error Handling layer** enforcing secure `try-except` wrappers across critical controllers to ensure deep system resilience, custom theme scripts (`theme.js`), and fault-tolerant operation under heavy load.

---

## 4. Project Structure

The operational layout of the system directory is configured as follows:

```text
iara-gdbpzn-GSBadalova23/
│
├── .venv/                  # Virtual Environment
│
├── instance/               # Database Storage Area
│   ├── iara_pro.db
│   ├── iara_pro_v2.db
│   ├── iara_pro_v3.db
│   └── iara_system.db      # Main operational database
│
├── static/                 # Static Assets
│   ├── css/
│   │   ├── admin.css       # Administrative layout styles
│   │   ├── base.css        # Global CSS layout and resets
│   │   ├── index.css       # Public landing portal design
│   │   └── user.css        # Fishermen workspace styling
│   ├── uploads/            # Secure directory for photo evidence storage
│   ├── admin_charts.js     # Analytics charting engine
│   ├── script.js           # Leaflet Map tracking & validation handlers
│   └── theme.js            # Dynamic interface theme control
│
├── templates/              # Jinja2 Templates
│   ├── admin_dashboard.html# Control center for inspectors
│   ├── index.html          # Public landing interface
│   ├── login.html          # Secure login form
│   ├── signup.html         # Secure registration form
│   └── user_dashboard.html # Electronic logbook workspace
│
├── app.py                  # Server configuration, controller paths, and endpoints
├── migrate_db.py           # Database environment migration script
├── models.py               # Database schemas and data layers
└── README.md               # System Documentation
