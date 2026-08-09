# 🌐 IP Finder - High-Precision Network & VPN Inspector

A modern, privacy-first web application built with **Vanilla HTML, CSS, and JavaScript** that instantly detects your public **IPv4** and **IPv6** addresses, network geolocation, and performs a **4-Step Detective VPN & Proxy Inspection** without requiring any browser location permissions.

![IP Finder Screenshot](logo.png)

---

## ✨ Features

- ⚡ **Dual-Stack Protocol Detection**: Real-time resolution of public **IPv4** and **IPv6** addresses with individual 1-click copy buttons.
- 📍 **Permission-Free Geolocation**: Accurately inspects your City, Region, Country, ISP / Telecom provider, AS Organization, and Timezone using server-side network routing (no intrusive browser location popup required).
- 🗺️ **1-Click Google Maps Redirection**: Click on your location values to open exact location pinpointing on Google Maps in a new tab.
- 🔎 **4-Step Detective VPN Inspector**:
  1. **ASN & ISP Type Check**: Identifies whether your IP belongs to a Data Center / Hosting provider (e.g. AWS, DigitalOcean, Hetzner) or a Consumer ISP (e.g. Reliance Jio, Comcast, AT&T).
  2. **Reverse DNS (PTR Record) Audit**: Scans network hostnames for VPN/Proxy signatures.
  3. **WebRTC Leak Audit**: Inspects WebRTC ICE candidates to detect local network interface bypasses.
  4. **Timezone Alignment Audit**: Compares system hardware device timezone against IP network timezone.
- 📋 **Full Report Actions**:
  - 🔄 **Refresh Detection**: Instantly re-audits network signals.
  - 📋 **Copy Full Report**: One-click formatted report copy to clipboard.
  - 📄 **Download Full PDF Report**: Generates and downloads a clean, native vector **`.pdf`** document (`IP_Finder_Report.pdf`) featuring structured tables and detective conclusions.
- 🎨 **Modern Cyber Glassmorphism UI**: Premium dark mode design with HSL color tokens, ambient background glows, micro-interactions, and full mobile responsiveness.

---

## 🛠️ Technology Stack

- **Structure**: HTML5 Semantic Markup
- **Styling**: Vanilla CSS3 (Custom CSS Design System, Flexbox, Grid, Dynamic Glassmorphism)
- **Logic**: Vanilla JavaScript (ES6+ Async/Await, WebRTC APIs)
- **PDF Engine**: `jsPDF` Vector PDF Generator
- **Zero Framework Dependencies**: Pure lightweight native web technologies (No React, Node.js, or bundlers required).

---

## 🚀 Getting Started

### Prerequisites
All you need is a modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari, Brave, or Opera).

### Installation & Usage

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/NeelSavsani/IPFinder.git
   cd IPFinder
   ```

2. **Open in Browser**:
   Double-click `index.html` or open it directly in your web browser:
   ```bash
   # On Windows (PowerShell)
   Start-Process index.html

   # On macOS
   open index.html

   # On Linux
   xdg-open index.html
   ```

---

## 📂 Project Structure

```
IPFinder/
├── index.html       # Main HTML application structure
├── style.css        # Custom Glassmorphism design system & responsive layout
├── script.js        # Core detection algorithms, Detective audit & jsPDF export
├── logo.png         # IP Finder brand logo
├── favicon.png      # Application favicon icon
└── README.md        # Documentation
```

---

## 📄 License & Attribution

Developed with ❤️ by **[Neel Savsani](https://github.com/NeelSavsani)**.  
Open-source under the [MIT License](LICENSE).
