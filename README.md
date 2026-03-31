# 🌊 IARA: Intelligent Fishery Management System ⚓

![Python](https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-2.0+-black?style=for-the-badge&logo=flask&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Map](https://img.shields.io/badge/GIS-Interactive_Map-orange?style=for-the-badge&logo=leaflet&logoColor=white)

> **2026 Internship Project** – A high-tech digital ecosystem for maritime and river fishing regulation in Bulgaria.

---

## 📖 Overview
This platform is a comprehensive solution developed for the **Executive Agency for Fisheries and Aquacultures (IARA)**. It eliminates paper bureaucracy by automating resource management, field inspections, and real-time monitoring.

### ✨ Core Features
* **🚢 Vessel Registry:** Advanced technical profiles for fishing fleets (CFR, engine power, tonnage).
* **🎫 Smart Ticketing:** Dynamic fee calculation engine with built-in logic for **social discounts** (Seniors, Minors, and Disability/TELK holders).
* **📝 Digital Logbook:** Real-time catch reporting system with precise timestamping and data persistence.
* **🛡️ Inspector Portal:** Mobile-optimized dashboard for instant validation of fishing permits and catch logs.

---

## 🗺️ Interactive GIS Mapping 📍
The system features an integrated **Interactive Fishery Map** that provides:
* **Live Vessel Tracking:** Visualizing active vessel locations in the Black Sea and Danube river.
* **Geofencing & Prohibited Zones:** Automated visual markers for protected maritime areas and breeding grounds.
* **Spatial Data Analysis:** Mapping catch distribution to prevent overfishing and ensure sustainability.

---

## 🛠 Tech Stack
* **Backend:** `Python 3.10` & `Flask Framework`
* **ORM:** `SQLAlchemy` (Precision database relationship management)
* **GIS Integration:** `Leaflet.js` / `Google Maps API` (Interactive Mapping)
* **Database:** `SQLite` (High-performance local data storage)

---

## 📂 Project Architecture
```bash
iara-system/
├── 📄 app.py              # Core server logic & GIS API routes
├── 📄 models.py           # Database Schema (Users, Vessels, Tickets, Logs)
├── 📁 templates/          # Responsive Jinja2 templates
│   ├── 🏠 index.html      # Landing Page
│   ├── 🔑 login.html      # Secure Authentication
│   ├── 📊 dashboard.html  # Main Management Panel
│   └── 🗺️ map.html        # Interactive GIS Interface
├── 📁 static/             # Assets (CSS3, JS, Mapping Scripts)
└── 📄 iara_system.db      # SQL Production Database
