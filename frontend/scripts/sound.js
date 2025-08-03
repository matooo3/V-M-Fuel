function getSoundVolume() {
	const volume = localStorage.getItem("soundVolume");
	return volume ? parseFloat(volume) : 0.5;
}

export function isSoundEnabled() {
	const soundEnabled = localStorage.getItem("soundEnabled");
	if (soundEnabled === null) return true; // default: Sound is enabled
	return soundEnabled === "true";
}

export function createSound(volume, file) {
	if (!isSoundEnabled()) {
		return;
	}
    const sound = new Audio(`./assets/sounds/${file}`);
    sound.volume = volume;
    sound.play();
}

export function playCheckSound() {
    const checkboxSound = "checkbox.mp3";
    let volCheck = 0.2;
    createSound(volCheck, checkboxSound);
}
