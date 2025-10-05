# Contributing to Super Dribble Audio Amplifier 🚀

Thank you for your interest in contributing! Your help makes this project better for everyone. This guide will walk you through ways to contribute, report issues, and submit code changes.

---

## Ways to Contribute

There are many ways to help:

- **Report Bugs**: Found a bug? Let us know so we can fix it.
- **Feature Requests**: Have an idea to improve the extension? Suggest it!
- **Documentation**: Improve this README or add guides.
- **Code Contributions**: Fix bugs, improve the UI, add new features, or optimize audio processing.

---

## Reporting Issues

When creating an issue, include:

1. **Title**: Clear and concise description of the problem  
2. **Description**: Detailed explanation of the issue  
3. **Steps to Reproduce**: How to encounter the bug  
4. **Expected vs. Actual Behavior**  
5. **Screenshots** (if applicable)  

Create a new issue here: [https://github.com/BennyPerumalla/Super-dribble/issues](https://github.com/BennyPerumalla/Super-dribble/issues)

---

## Submitting Code Changes

1. **Fork the repository**  
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/Super-dribble.git
   cd Super-dribble
   ```
3. **Create a new branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes**  
   - For UI changes, modify files in `UI/src/`  
   - For audio processing, modify WASM or JS modules under `wasm/` or `utils/`  
   - For presets, modify `lua/` or `wasm/*/presets.lua`
5. **Test thoroughly**:  
   - Load the extension in Chrome using Developer Mode (`chrome://extensions/`)  
   - Open a tab with audio content (YouTube, Spotify, etc.)  
   - Verify that audio processing works as expected  
   - Ensure no console errors occur
6. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add short description of your change"
   ```
7. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Open a Pull Request**  
   - Describe what you changed and why  
   - Reference any related issues  

---

## Code Guidelines

- Follow existing code style and patterns  
- Use meaningful names for variables and functions  
- Comment code for clarity, especially in audio processing logic  
- Keep commits focused and clear  

---

## Development Setup

1. **Install dependencies**:
   ```bash
   cd UI
   npm install
   ```
2. **Build UI**:
   ```bash
   npm run build
   ```
3. **Build WASM modules** (if modifying C++ DSP code):
   ```bash
   node build-wasm.js
   ```
4. **Load unpacked extension in Chrome** (`chrome://extensions/`)  
5. **Test all features** before committing  

---

## Community Guidelines

- Be respectful and inclusive  
- Provide constructive feedback  
- Keep discussions professional and focused on the project  

---

## Thank You

Thank you for helping make **Super Dribble Audio Amplifier** better! Your contributions, big or small, are greatly appreciated. 🎵

---

## Authors

- Benny Perumalla <benny01r@gmail.com>  
- Irshad Siddi <mohammadirshadsiddi@gmail.com>