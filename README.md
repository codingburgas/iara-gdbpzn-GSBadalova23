# Smart IARA - Digital Fishery Management & Inspection System

Smart IARA is a comprehensive web-based platform designed to modernize and digitize fishery management, catch reporting, and inspection workflows in compliance with national and European regulations (EAFA / ИАРА). The system features dual-role workflows tailored for fishermen (digital logbooks, permit checks, social fishing calendars) and inspectors (violation tracking, fleet registry, real-time analytics).

## 🚀 Key Features

### 👤 User Authentication & Role Management
* **Secure Auth:** Session-based user registration and login with encrypted passwords managed via `signup.html` and `login.html`.
* **RBAC (Role-Based Access Control):** Clear division between standard fishermen profiles (`user_dashboard.html`) and high-privilege administrative accounts (`admin_dashboard.html`).

### 🗺️ GIS Module & Location Verification
* **Interactive Map:** Built with **Leaflet.js** and **OpenStreetMap** inside `script.js` for effortless catch location pinpointing.
* **Water-Only Validation:** Integrated **Nominatim API** for reverse geocoding to automatically reject false entries pinned on land.
* **Navigation Logic:** Direct routing via Google Maps links for inspector patrol logistics.

### 📅 Social Fishing & Biological Restrictions
* **Smart Calendar:** Uses **Flatpickr** with custom logic to automatically restrict social fishing event scheduling exclusively to weekends.
* **Real-Time Species Validation:** Client-side JavaScript assistant that cross-references inputs against official biological restrictions (minimum size limits and active seasonal breeding bans), visually alerting users before submission.

### 🎣 Electronic Reporting System (ERS) & Traceability
* **Traceability Passports:** Automated generation of unique alphanumeric delivery codes (`uuid`) upon fish disembarkation.
* **Gear Tracking:** Detailed reporting logs for fishing gear parameters, including specific gear types (nets, longlines, trawls) and active operational time underwater.

### 🚢 National Fishing Vessel Registry
* **Fleet Monitoring:** Comprehensive vessel database tracking European **CFR codes**, external markings, gross tonnage, and engine power.
* **Permit Validity Engine:** Backend property decorators calculating permit expiry dates in real time, automatically flagging invalid or expired documents.

### 📊 Inspector Panel & Data Analytics
* **Fine Management:** Electronic violation logging with precise description fields and fine amount calculations.
* **Interactive Dashboard:** Dynamic data visualization utilizing **Chart.js** via `admin_charts.js` to display real-time catch statistics, species distribution, and high-activity regional hotspots.
* **Multimedia Evidence:** Secure file upload module allowing fishermen to attach photos of their catch as visual proof, managed with safe UUID filename mapping into the `uploads/` directory.

---

## 🛠️ Tech Stack

* **Backend:** Python 3.x, Flask (Microframework)
* **Database & ORM:** SQLite, SQLAlchemy
* **Frontend:** HTML5, CSS3 (Flexbox/Grid architecture), Vanilla JavaScript
* **GIS & Libraries:** Leaflet.js, OpenStreetMap, Flatpickr, Chart.js
* **APIs:** Nominatim OpenStreetMap API

---

## 📂 Architecture & File Structure

Based on the actual project layout shown in `image_fd5cd6.png`, `image_fd5d33.png`, and `image_fd5d73.png`, the system strictly follows a modular pattern separating assets, templates, and core data layers:

```text
iara-gdbpzn-GSBadalova23/
│
├── .venv/                  # Python Virtual Environment
│
├── instance/               # Database instances tracker
│   ├── iara_pro.db
│   ├── iara_pro_v2.db
│   ├── iara_pro_v3.db
│   └── iara_system.db      # Core operational database
│
├── static/                 # Static Assets
│   ├── css/
│   │   ├── admin.css       # Inspector panel styles
│   │   ├── base.css        # Global CSS resets and typography
│   │   ├── index.css       # Landing page styling
│   │   └── user.css        # Fisherman dashboard design
│   ├── uploads/            # Secure directory for catch photo storage
│   ├── admin_charts.js     # Chart.js analytical aggregations
│   ├── script.js           # Leaflet map logic and validation handlers
│   └── theme.js            # Dynamic UI theme customization script
│
├── templates/              # Jinja2 HTML Templates
│   ├── admin_dashboard.html# Inspector control center
│   ├── index.html          # Public landing portal
│   ├── login.html          # Authorization interface
│   ├── signup.html         # User registration interface
│   └── user_dashboard.html # Electronic logbook for fishermen
│
├── app.py                  # Core application logic, routing, and endpoints
├── migrate_db.py           # Database migration and seed management script
├── models.py               # SQLAlchemy database schemas (User, Vessel, Catch Logs)
└── README.md               # System documentation
