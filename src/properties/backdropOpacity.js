export function generateBackdropOpacityClasses() {
    const backdropOpacityClasses = {};

    const backdropOpacities = {
        'backdrop-opacity-0': 'opacity(0)',
        'backdrop-opacity-5': 'opacity(0.05)',
        'backdrop-opacity-10': 'opacity(0.1)',
        'backdrop-opacity-15': 'opacity(0.15)',
        'backdrop-opacity-20': 'opacity(0.2)',
        'backdrop-opacity-25': 'opacity(0.25)',
        'backdrop-opacity-30': 'opacity(0.3)',
        'backdrop-opacity-35': 'opacity(0.35)',
        'backdrop-opacity-40': 'opacity(0.4)',
        'backdrop-opacity-45': 'opacity(0.45)',
        'backdrop-opacity-50': 'opacity(0.5)',
        'backdrop-opacity-55': 'opacity(0.55)',
        'backdrop-opacity-60': 'opacity(0.6)',
        'backdrop-opacity-65': 'opacity(0.65)',
        'backdrop-opacity-70': 'opacity(0.7)',
        'backdrop-opacity-75': 'opacity(0.75)',
        'backdrop-opacity-80': 'opacity(0.8)',
        'backdrop-opacity-85': 'opacity(0.85)',
        'backdrop-opacity-90': 'opacity(0.9)',
        'backdrop-opacity-95': 'opacity(0.95)',
        'backdrop-opacity-100': 'opacity(1)',
    };

    Object.entries(backdropOpacities).forEach(([className, backdropOpacityValue]) => {
        backdropOpacityClasses[className] = `
            --kg-backdrop-opacity: ${backdropOpacityValue};
            backdrop-filter: var(--kg-backdrop-blur) var(--kg-backdrop-brightness) var(--kg-backdrop-contrast) var(--kg-backdrop-grayscale) var(--kg-backdrop-hue-rotate) var(--kg-backdrop-invert) var(--kg-backdrop-saturate) var(--kg-backdrop-sepia) var(--kg-backdrop-opacity);
        `;
    });

    return backdropOpacityClasses;
}