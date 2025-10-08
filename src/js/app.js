// Luminous Reader - Elite Reading Lamp
class LuminousReader {
    constructor() {
        this.currentColor = '#ffffff';
        this.currentBrightness = 100;
        this.currentMode = 'focus';
        this.isOn = true;
        this.settings = {
            autoFullscreen: false,
            eyeStrain: true,
            motionDetect: false,
            keyboardShortcuts: true
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSettings();
        this.applyInitialSettings();
        this.initPWA();
        this.showNotification('Luminous Reader started', 'success');
    }

    bindEvents() {
        // Color picker
        const colorPicker = document.getElementById('colorPicker');
        colorPicker.addEventListener('input', (e) => this.setColor(e.target.value));

        // Preset colors
        document.querySelectorAll('.preset').forEach(preset => {
            preset.addEventListener('click', () => {
                const color = preset.dataset.color;
                this.setColor(color);
                document.getElementById('colorPicker').value = color;
            });
        });

        // Brightness slider
        const brightnessSlider = document.getElementById('brightnessSlider');
        brightnessSlider.addEventListener('input', (e) => this.setBrightness(e.target.value));


        // Reading mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.setReadingMode(mode);
                this.updateModeButtons(btn);
            });
        });


        // Quick access buttons
        document.getElementById('togglePanel').addEventListener('click', () => this.togglePanel());
        document.getElementById('powerBtn').addEventListener('click', () => this.togglePower());
        document.getElementById('randomColor').addEventListener('click', () => this.setRandomColor());
        document.getElementById('savePreset').addEventListener('click', () => this.savePreset());

        // Header controls
        document.getElementById('fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('settings-btn').addEventListener('click', () => this.openSettings());

        // Modal controls
        document.getElementById('closeSettings').addEventListener('click', () => this.closeSettings());

        // Settings checkboxes
        document.querySelectorAll('.modal input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.updateSetting(e.target.id, e.target.checked));
        });


        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Motion detection (if enabled)
        if (this.settings.motionDetect) {
            this.initMotionDetection();
        }
    }

    setColor(color) {
        this.currentColor = color;
        this.updateLightDisplay();
        this.updateColorInfo();
        this.showNotification(`Color changed: ${color}`, 'info');
    }

    setBrightness(brightness) {
        this.currentBrightness = parseInt(brightness);
        this.updateLightDisplay();
        this.updateBrightnessInfo();
    }


    setReadingMode(mode) {
        this.currentMode = mode;
        const presets = {
            focus: { color: '#ffffff', brightness: 100 },
            relax: { color: '#fff8dc', brightness: 60 },
            night: { color: '#ffe4b5', brightness: 30 },
            study: { color: '#f0f8ff', brightness: 85 }
        };
        
        const preset = presets[mode];
        this.setColor(preset.color);
        this.setBrightness(preset.brightness);
        document.getElementById('colorPicker').value = preset.color;
        document.getElementById('brightnessSlider').value = preset.brightness;
        
        this.showNotification(`Reading mode: ${this.getModeName(mode)}`, 'info');
    }


    togglePanel() {
        const panel = document.getElementById('controlPanel');
        const btn = document.getElementById('togglePanel');
        
        panel.classList.toggle('open');
        btn.classList.toggle('active');
    }

    togglePower() {
        this.isOn = !this.isOn;
        const btn = document.getElementById('powerBtn');
        const lightDisplay = document.getElementById('lightDisplay');
        
        if (this.isOn) {
            lightDisplay.style.opacity = '1';
            btn.classList.remove('active');
            this.showNotification('Light turned on', 'success');
        } else {
            lightDisplay.style.opacity = '0.1';
            btn.classList.add('active');
            this.showNotification('Light turned off', 'info');
        }
    }

    setRandomColor() {
        const colors = [
            '#ffffff', '#fff8dc', '#ffe4b5', '#f0f8ff', 
            '#e6e6fa', '#f5f5dc', '#ffe4e1', '#f0fff0',
            '#fff0f5', '#f0f8ff', '#f5fffa', '#faf0e6'
        ];
        
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        this.setColor(randomColor);
        document.getElementById('colorPicker').value = randomColor;
        
        this.showNotification('Random color selected', 'info');
    }

    savePreset() {
        const preset = {
            color: this.currentColor,
            brightness: this.currentBrightness,
            effect: this.currentEffect,
            mode: this.currentMode
        };
        
        localStorage.setItem('luminousPreset', JSON.stringify(preset));
        this.showNotification('Settings saved', 'success');
    }

    loadPreset() {
        const saved = localStorage.getItem('luminousPreset');
        if (saved) {
            const preset = JSON.parse(saved);
            this.setColor(preset.color);
            this.setBrightness(preset.brightness);
            if (preset.effect) this.setEffect(preset.effect);
            this.setReadingMode(preset.mode);
            
            document.getElementById('colorPicker').value = preset.color;
            document.getElementById('brightnessSlider').value = preset.brightness;
            
            this.showNotification('Saved settings loaded', 'info');
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                this.showNotification('Fullscreen mode enabled', 'info');
            });
        } else {
            document.exitFullscreen().then(() => {
                this.showNotification('Fullscreen mode disabled', 'info');
            });
        }
    }

    openSettings() {
        const modal = document.getElementById('settingsModal');
        modal.classList.add('open');
    }

    closeSettings() {
        const modal = document.getElementById('settingsModal');
        modal.classList.remove('open');
    }

    updateSetting(setting, value) {
        this.settings[setting] = value;
        this.saveSettings();
        
        if (setting === 'motionDetect' && value) {
            this.initMotionDetection();
        }
        
        this.showNotification('Setting updated', 'info');
    }

    handleKeyboard(e) {
        if (!this.settings.keyboardShortcuts) return;
        
        switch(e.key) {
            case ' ':
                e.preventDefault();
                this.togglePower();
                break;
            case 'f':
            case 'F':
                e.preventDefault();
                this.toggleFullscreen();
                break;
            case 'p':
            case 'P':
                e.preventDefault();
                this.togglePanel();
                break;
            case 'r':
            case 'R':
                e.preventDefault();
                this.setRandomColor();
                break;
            case 'Escape':
                this.closeSettings();
                break;
        }
    }

    initMotionDetection() {
        if (!('DeviceMotionEvent' in window)) return;
        
        let lastMove = Date.now();
        
        window.addEventListener('devicemotion', (e) => {
            const now = Date.now();
            if (now - lastMove < 1000) return; // Throttle
            
            const acceleration = e.acceleration;
            const movement = Math.sqrt(
                acceleration.x * acceleration.x + 
                acceleration.y * acceleration.y + 
                acceleration.z * acceleration.z
            );
            
            if (movement > 2) { // Movement detected
                lastMove = now;
                this.handleMotion();
            }
        });
    }

    handleMotion() {
        // Gentle wake-up effect when motion is detected
        this.setEffect('breathing');
        setTimeout(() => this.setEffect(null), 3000);
    }

    updateLightDisplay() {
        const lightDisplay = document.getElementById('lightDisplay');
        const opacity = this.isOn ? this.currentBrightness / 100 : 0.1;
        
        lightDisplay.style.backgroundColor = this.currentColor;
        lightDisplay.style.opacity = opacity;
        
        // Apply eye strain reduction
        if (this.settings.eyeStrain) {
            this.applyEyeStrainReduction();
        }
    }

    applyEyeStrainReduction() {
        const lightDisplay = document.getElementById('lightDisplay');
        
        // Reduce blue light for warmer colors
        if (this.currentBrightness > 50) {
            const rgb = this.hexToRgb(this.currentColor);
            if (rgb) {
                const adjustedBlue = Math.max(0, rgb.b - 20);
                const adjustedColor = `rgb(${rgb.r}, ${rgb.g}, ${adjustedBlue})`;
                lightDisplay.style.backgroundColor = adjustedColor;
            }
        }
    }

    updateColorInfo() {
        document.getElementById('colorHex').textContent = this.currentColor.toUpperCase();
    }

    updateBrightnessInfo() {
        document.getElementById('brightnessLevel').textContent = `${this.currentBrightness}%`;
        document.getElementById('brightnessValue').textContent = `${this.currentBrightness}%`;
    }



    updateModeButtons(activeBtn) {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const text = document.getElementById('notificationText');
        
        text.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    getModeName(mode) {
        const names = {
            focus: 'Focus',
            relax: 'Relax',
            night: 'Night',
            study: 'Study'
        };
        return names[mode] || mode;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    applyInitialSettings() {
        // Apply saved settings to UI
        Object.keys(this.settings).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.checked = this.settings[key];
            }
        });
        
        // Load saved preset
        this.loadPreset();
        
        // Auto fullscreen if enabled
        if (this.settings.autoFullscreen) {
            setTimeout(() => this.toggleFullscreen(), 1000);
        }
    }

    saveSettings() {
        localStorage.setItem('luminousSettings', JSON.stringify(this.settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('luminousSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }


    // PWA Support
    initPWA() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallPrompt();
        });

        window.addEventListener('appinstalled', () => {
            this.showNotification('App installed!', 'success');
        });
    }

    showInstallPrompt() {
        // Create install prompt if not exists
        if (!document.getElementById('installPrompt')) {
            const prompt = document.createElement('div');
            prompt.id = 'installPrompt';
            prompt.className = 'install-prompt';
            prompt.innerHTML = `
                <i class="fas fa-download"></i>
                <span>Add Luminous Reader to home screen</span>
                <button id="installBtn">Install</button>
                <button id="dismissBtn">Later</button>
            `;
            document.body.appendChild(prompt);

            document.getElementById('installBtn').addEventListener('click', () => {
                this.installApp();
                prompt.remove();
            });

            document.getElementById('dismissBtn').addEventListener('click', () => {
                prompt.remove();
            });

            setTimeout(() => prompt.classList.add('show'), 1000);
        }
    }

    installApp() {
        // This would trigger the install prompt
        // Implementation depends on the specific PWA setup
        this.showNotification('Installation started', 'info');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new LuminousReader();
});

// Service Worker for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
            navigator.serviceWorker.register('/src/js/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}
