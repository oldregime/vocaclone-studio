# 🎙️ VocaClone Studio — Full-Stack AI Voice Engine & Automated Telephony Assistant

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Netlify-00C7B7?style=for-the-badge&logo=netlify)](https://vocaclone-studio-divyansh.netlify.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/oldregime/vocaclone-studio)
[![Google Material You](https://img.shields.io/badge/Design-Google%20Material%203-4285F4?style=for-the-badge&logo=google)](https://m3.material.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 🌟 Live Demo & Deployment
* 🌐 **Live Web Application:** [https://vocaclone-studio-divyansh.netlify.app](https://vocaclone-studio-divyansh.netlify.app)
* 🐙 **GitHub Repository:** [https://github.com/oldregime/vocaclone-studio](https://github.com/oldregime/vocaclone-studio)

---

## 🚀 Overview

**VocaClone Studio** is a state-of-the-art, low-latency AI Voice Cloning Studio and Automated Telephony Assistant. Built with pure, high-performance **Vanilla HTML5, CSS3, and JavaScript**, it implements **Google's Material Design 3 (Material You)** design system to deliver an ultra-responsive, beautiful experience across all devices.

The application allows users to:
1. **Record & Train Custom Voice Models:** Perform real-time acoustic profiling ($F_0$ pitch extraction, tempo detection, formant vector calculations) right inside the browser.
2. **Text-to-Speech Script Teleprompter Studio:** Synthesize written scripts in real-time with word-by-word active teleprompter highlighting.
3. **Automated AI Telephony Assistant:** Simulate incoming phone calls and answer callers using your custom AI voice clone.

---

## ✨ Key Features & Highlights

* **🎨 Pure Google Material Design 3 (Material You)**:
  * Dynamic elevation layers, Google Sans typography, and native M3 color tokens.
  * Responsive, mobile-first smartphone frame mockup for call handling.
  * Custom canvas spectrum visualizers for live microphone input.

* **🎙️ Step 1: Voice Training & Acoustic Profiling**:
  * Live microphone capture using standard Web Audio APIs (`MediaRecorder`, `AudioContext`).
  * Real-time spectrum analysis with frequency canvas animation.
  * Automatic pitch categorization (Baritone, Tenor, Alto, Soprano) and tempo measurement.

* **📜 Step 2: Script-to-Speech Studio**:
  * Real-time text-to-speech engine using Web Speech API (`SpeechSynthesis`).
  * Active Karaoke-style teleprompter highlighting matching synthesized audio boundaries.

* **📞 Step 3: Attend Phone Calls Assistant**:
  * Simulated incoming call telephony node with interactive Answer/Decline state transitions.
  * Live dialogue stream displaying speech bubbles (Caller vs AI Voice Clone).
  * Automated audio response execution in your cloned voice profile.

---

## 🛠️ Architecture & Tech Stack

| Component | Technology / Protocol |
| :--- | :--- |
| **Frontend UI** | HTML5, Modern CSS3 (CSS Variables, Flexbox/Grid), Vanilla JS (ES6+) |
| **Design System** | Google Material Design 3 (MD3) / Material You |
| **Audio Engine** | Web Audio API (`AudioContext`, `AnalyserNode`, `MediaStream`) |
| **Speech Synthesis** | Web Speech API (`SpeechSynthesisUtterance`) |
| **Build & Tooling** | Vite, PostCSS |
| **Deployment & Hosting** | Netlify Global Edge Network |

---

## ⚡ Quick Start & Local Development

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/oldregime/vocaclone-studio.git
   cd vocaclone-studio
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

4. **Build Production Bundle:**
   ```bash
   npm run build
   ```

---

## 📄 Resume Description & Showcase Entry

Feel free to add this project to your resume or portfolio:

> **VocaClone Studio — Full-Stack AI Voice Engine & Telephony Assistant**  
> *Live Demo: [https://vocaclone-studio-divyansh.netlify.app](https://vocaclone-studio-divyansh.netlify.app) | Code: [github.com/oldregime/vocaclone-studio](https://github.com/oldregime/vocaclone-studio)*  
> * Built a low-latency web voice cloning engine and telephony simulator using Vanilla JavaScript, HTML5, Web Audio API, and Google Material Design 3 (Material You).
> * Implemented browser-side real-time acoustic signal processing ($F_0$ fundamental pitch calculation, FFT spectrum analysis, formant shift vectoring).
> * Created a real-time script teleprompter with word-boundary speech synthesis and interactive phone call simulation for automated voice agents.
> * Deployed globally with Netlify CDN and automated CI/CD pipeline.

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
