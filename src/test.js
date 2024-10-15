import fs from 'fs';
import cssesc from 'css.escape';
import tinycolor from 'tinycolor2';

const breakpoints = {
    'sm': '640px',
    'md': '768px',
    'lg': '1024px',
    'xl': '1280px',
    '2xl': '1536px',
};

const propertyMap = {
    'aspect': function (value) { return { 'aspect-ratio': value }; },
    'columns': function (value) { return { 'columns': value }; },
    'object': function (value) { return { 'object-position': value }; },
    'top': function (value) { return { 'top': value }; },
    'right': function (value) { return { 'right': value }; },
    'bottom': function (value) { return { 'bottom': value }; },
    'left': function (value) { return { 'left': value }; },
    'inset': function (value) { return { 'inset': value }; },
    'z': function (value) { return { 'z-index': value }; },

    'basis': function (value) { return { 'flex-basis': value }; },
    'flex': function (value) { return { 'flex': value }; },
    'grow': function (value) { return { 'flex-grow': value }; },
    'flex-shrink': function (value) { return { 'flex-shrink': value }; },
    'shrink': function (value) { return { 'flex-shrink': value }; },
    'order': function (value) { return { 'order': value }; },
    'grid-cols': function (value) { return { 'grid-template-columns': value }; },
    'col': function (value) { return { 'grid-column': value }; },
    'grid-rows': function (value) { return { 'grid-template-rows': value }; },
    'row': function (value) { return { 'grid-row': value }; },
    'auto-cols': function (value) { return { 'grid-auto-columns': value }; },
    'auto-rows': function (value) { return { 'grid-auto-rows': value }; },
    'gap': function (value) { return { 'gap': value }; },

    'p': function (value) { return { 'padding': value }; },
    'pt': function (value) { return { 'padding-top': value }; },
    'pr': function (value) { return { 'padding-right': value }; },
    'pb': function (value) { return { 'padding-bottom': value }; },
    'pl': function (value) { return { 'padding-left': value }; },
    'px': function (value) {
        return { 'padding-left': value, 'padding-right': value };
    },
    'py': function (value) {
        return { 'padding-top': value, 'padding-bottom': value };
    },

    'm': function (value) { return { 'margin': value }; },
    'mt': function (value) { return { 'margin-top': value }; },
    'mr': function (value) { return { 'margin-right': value }; },
    'mb': function (value) { return { 'margin-bottom': value }; },
    'ml': function (value) { return { 'margin-left': value }; },
    'mx': function (value) {
        return { 'margin-left': value, 'margin-right': value };
    },
    'my': function (value) {
        return { 'margin-top': value, 'margin-bottom': value };
    },

    'space-y > :not([hidden]) ~ :not([hidden])': function (value) {
        return {
            '--kg-space-y-reverse': '0',
            'margin-top': `calc(${value} * calc(1 - var(--kg-space-y-reverse)))`,
            'margin-bottom': `calc(${value} * var(--kg-space-y-reverse))`
        };
    },
    'space-x > :not([hidden]) ~ :not([hidden])': function (value) {
        return {
            '--kg-space-x-reverse': '0',
            'margin-right': `calc(${value} * var(--kg-space-x-reverse))`,
            'margin-left': `calc(${value} * calc(1 - var(--kg-space-x-reverse)))`
        };
    },

    'w': function (value) { return { 'width': value }; },
    'min-w': function (value) { return { 'min-width': value }; },
    'max-w': function (value) { return { 'max-width': value }; },
    'h': function (value) { return { 'height': value }; },
    'min-h': function (value) { return { 'min-height': value }; },
    'max-h': function (value) { return { 'max-height': value }; },
    'size': function (value) {
        return { 'width': value, 'height': value };
    },

    'font': function (value) {
        if (value.startsWith("'") || value.startsWith('"')) {
            return { 'font-family': value.replace(/_/g, ' ') };
        } else {
            return { 'font-weight': value };
        }
    },
    'text': function (value) {
        if (/^#|rgba?\(|hsla?\(|hsl\(|var\(--/.test(value)) {
            return {
                '--kg-text-opacity': '1',
                'color': `${processColor(value, '--kg-text-opacity')}`
            };
        } else {
            return { 'font-size': value };
        }
    },
    'tracking': function (value) { return { 'letter-spacing': value }; },
    'line-clamp': function (value) {
        return {
            'overflow': 'hidden',
            'display': '-webkit-box',
            '-webkit-box-orient': 'vertical',
            '-webkit-line-clamp': value
        };
    },
    'leading': function (value) { return { 'line-height': value }; },
    'list-image': function (value) { return { 'list-style-image': value }; },
    'list': function (value) { return { 'list-style-type': value }; },
    'decoration': function (value) {
        if (/^#/.test(value) || /^rgba?\(/.test(value)) {
            return { 'text-decoration-color': value };
        } else {
            return { 'text-decoration-thickness': value };
        }
    },
    'underline-offset': function (value) { return { 'text-underline-offset': value }; },
    'indent': function (value) { return { 'text-indent': value }; },
    'align': function (value) { return { 'vertical-align': value }; },

    'before:content': function (value) {
        return { '--kg-content': value.replace(/_/g, ' '), 'content': 'var(--kg-content)' };
    },
    'after:content': function (value) {
        return { '--kg-content': value.replace(/_/g, ' '), 'content': 'var(--kg-content)' };
    },

    'bg': function (value) {
        if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl')) {
            return {
                '--kg-bg-opacity': '1',
                'background-color': `${processColor(value, '--kg-bg-opacity')}`
            };
        } else if (value.startsWith('url(')) {
            return { 'background-image': value };
        } else if (value.startsWith('length:')) {
            return { 'background-size': value.replace('length:', '') };
        } else {
            return { 'background-position': value.replace(/_/g, ' ') };
        }
    },
    'from': function (value) {
        return {
            '--kg-gradient-from': `${value} var(--kg-gradient-from-position)`,
            '--kg-gradient-to': `${processColorWithOpacity(value, 0)} var(--kg-gradient-to-position)`,
            '--kg-gradient-stops': 'var(--kg-gradient-from), var(--kg-gradient-to)'
        };
    },
    'via': function (value) {
        return {
            '--kg-gradient-to': `${processColorWithOpacity(value, 0)} var(--kg-gradient-to-position)`,
            '--kg-gradient-stops': `var(--kg-gradient-from), ${value} var(--kg-gradient-via-position), var(--kg-gradient-to)`
        };
    },
    'to': function (value) {
        return {
            '--kg-gradient-to': `${value} var(--kg-gradient-to-position)`
        };
    },

    'rounded': function (value) { return { 'border-radius': value }; },
    'rounded-t': function (value) {
        return {
            'border-top-left-radius': value,
            'border-top-right-radius': value
        };
    },
    'rounded-r': function (value) {
        return {
            'border-top-right-radius': value,
            'border-bottom-right-radius': value
        };
    },
    'rounded-b': function (value) {
        return {
            'border-bottom-right-radius': value,
            'border-bottom-left-radius': value
        };
    },
    'rounded-l': function (value) {
        return {
            'border-top-left-radius': value,
            'border-bottom-left-radius': value
        };
    },
    'rounded-tl': function (value) { return { 'border-top-left-radius': value }; },
    'rounded-tr': function (value) { return { 'border-top-right-radius': value }; },
    'rounded-br': function (value) { return { 'border-bottom-right-radius': value }; },
    'rounded-bl': function (value) { return { 'border-bottom-left-radius': value }; },
    'rounded-ss': function (value) { return { 'border-start-start-radius': value }; },
    'rounded-se': function (value) { return { 'border-start-end-radius': value }; },
    'rounded-ee': function (value) { return { 'border-end-end-radius': value }; },
    'rounded-es': function (value) { return { 'border-end-start-radius': value }; },

    'border-t': function (value) { return { 'border-top-width': value }; },
    'border-r': function (value) { return { 'border-right-width': value }; },
    'border-b': function (value) { return { 'border-bottom-width': value }; },
    'border-l': function (value) { return { 'border-left-width': value }; },
    'border-x': function (value) {
        return {
            'border-left-width': value,
            'border-right-width': value
        };
    },
    'border-y': function (value) {
        return {
            'border-top-width': value,
            'border-bottom-width': value
        };
    },
    'border-s': function (value) { return { 'border-inline-start-width': value }; },
    'border-e': function (value) { return { 'border-inline-end-width': value }; },

    'border': function (value) {
        if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl')) {
            return {
                '--kg-border-opacity': '1',
                'border-color': `${processColor(value, '--kg-border-opacity')}`
            };
        } else {
            return { 'border-width': value };
        }
    },
    'divide-x > :not([hidden]) ~ :not([hidden])': function (value) {
        return {
            '--kg-divide-x-reverse': '0',
            'border-right-width': `calc(${value} * var(--kg-divide-x-reverse))`,
            'border-left-width': `calc(${value} * calc(1 - var(--kg-divide-x-reverse)))`
        };
    },
    'divide-y > :not([hidden]) ~ :not([hidden])': function (value) {
        return {
            '--kg-divide-y-reverse': '0',
            'border-top-width': `calc(${value} * calc(1 - var(--kg-divide-y-reverse)))`,
            'border-bottom-width': `calc(${value} * var(--kg-divide-y-reverse))`
        };
    },
    'divide': function (value) {
        if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl')) {
            return {
                '--kg-divide-opacity': '1',
                'border-color': `${processColor(value, '--kg-divide-opacity')}`
            };
        } else {
            return { 'border-width': value };
        }
    },

    'outline': function (value) {
        if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl')) {
            return { 'outline-color': value };
        } else {
            return { 'outline-width': value };
        }
    },
    'outline-offset': function (value) { return { 'outline-offset': value }; },

    'ring': function (value) {
        if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl')) {
            return {
                '--kg-ring-opacity': '1',
                '--kg-ring-color': `${processColor(value, '--kg-ring-opacity')}`
            };
        } else {
            return {
                '--kg-ring-offset-shadow': 'var(--kg-ring-inset) 0 0 0 var(--kg-ring-offset-width) var(--kg-ring-offset-color)',
                '--kg-ring-shadow': `var(--kg-ring-inset) 0 0 0 calc(${value} + var(--kg-ring-offset-width)) var(--kg-ring-color)`,
                'box-shadow': 'var(--kg-ring-offset-shadow), var(--kg-ring-shadow), var(--kg-shadow, 0 0 #0000)'
            };
        }
    },
    'ring-offset': function (value) {
        if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl')) {
            return { '--kg-ring-offset-color': value };
        } else {
            return { '--kg-ring-offset-width': value };
        }
    },

    'shadow': function (value) {
        if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl')) {
            return {
                '--kg-shadow-color': value,
                '--kg-shadow': 'var(--kg-shadow-colored)',
                'box-shadow': 'var(--kg-shadow)'
            };
        } else {
            return {
                '--kg-shadow': value,
                '--kg-shadow-colored': value.replace(/rgba?\([^\)]*\)/g, 'var(--kg-shadow-color)'),
                'box-shadow': 'var(--kg-shadow)'
            };
        }
    },
    'opacity': function (value) { return { 'opacity': value }; },

    // Filter utilities
    'blur': function (value) {
        return {
            '--kg-blur': `blur(${value})`,
            'filter': 'var(--kg-blur) var(--kg-brightness) var(--kg-contrast) var(--kg-grayscale) var(--kg-hue-rotate) var(--kg-invert) var(--kg-saturate) var(--kg-sepia) var(--kg-drop-shadow)'
        };
    },
    'brightness': function (value) {
        return {
            '--kg-brightness': `brightness(${value})`,
            'filter': 'var(--kg-blur) var(--kg-brightness) var(--kg-contrast) var(--kg-grayscale) var(--kg-hue-rotate) var(--kg-invert) var(--kg-saturate) var(--kg-sepia) var(--kg-drop-shadow)'
        };
    },
    'contrast': function (value) {
        return {
            '--kg-contrast': `contrast(${value})`,
            'filter': 'var(--kg-blur) var(--kg-brightness) var(--kg-contrast) var(--kg-grayscale) var(--kg-hue-rotate) var(--kg-invert) var(--kg-saturate) var(--kg-sepia) var(--kg-drop-shadow)'
        };
    },
    'drop-shadow': function (value) {
        return {
            '--kg-drop-shadow': `drop-shadow(${value})`,
            'filter': 'var(--kg-blur) var(--kg-brightness) var(--kg-contrast) var(--kg-grayscale) var(--kg-hue-rotate) var(--kg-invert) var(--kg-saturate) var(--kg-sepia) var(--kg-drop-shadow)'
        };
    },
    'grayscale': function (value) {
        return {
            '--kg-grayscale': `grayscale(${value})`,
            'filter': 'var(--kg-blur) var(--kg-brightness) var(--kg-contrast) var(--kg-grayscale) var(--kg-hue-rotate) var(--kg-invert) var(--kg-saturate) var(--kg-sepia) var(--kg-drop-shadow)'
        };
    },
    'hue-rotate': function (value) {
        return {
            '--kg-hue-rotate': `hue-rotate(${value})`,
            'filter': 'var(--kg-blur) var(--kg-brightness) var(--kg-contrast) var(--kg-grayscale) var(--kg-hue-rotate) var(--kg-invert) var(--kg-saturate) var(--kg-sepia) var(--kg-drop-shadow)'
        };
    },
    'invert': function (value) {
        return {
            '--kg-invert': `invert(${value})`,
            'filter': 'var(--kg-blur) var(--kg-brightness) var(--kg-contrast) var(--kg-grayscale) var(--kg-hue-rotate) var(--kg-invert) var(--kg-saturate) var(--kg-sepia) var(--kg-drop-shadow)'
        };
    },
    'saturate': function (value) {
        return {
            '--kg-saturate': `saturate(${value})`,
            'filter': 'var(--kg-blur) var(--kg-brightness) var(--kg-contrast) var(--kg-grayscale) var(--kg-hue-rotate) var(--kg-invert) var(--kg-saturate) var(--kg-sepia) var(--kg-drop-shadow)'
        };
    },
    'sepia': function (value) {
        return {
            '--kg-sepia': `sepia(${value})`,
            'filter': 'var(--kg-blur) var(--kg-brightness) var(--kg-contrast) var(--kg-grayscale) var(--kg-hue-rotate) var(--kg-invert) var(--kg-saturate) var(--kg-sepia) var(--kg-drop-shadow)'
        };
    },

    // Backdrop filter utilities
    'backdrop-blur': function (value) {
        return {
            '--kg-backdrop-blur': `blur(${value})`,
            '-webkit-backdrop-filter': 'var(--kg-backdrop-blur) var(--kg-backdrop-brightness) var(--kg-backdrop-contrast) var(--kg-backdrop-grayscale) var(--kg-backdrop-hue-rotate) var(--kg-backdrop-invert) var(--kg-backdrop-opacity) var(--kg-backdrop-saturate) var(--kg-backdrop-sepia)',
            'backdrop-filter': 'var(--kg-backdrop-blur) var(--kg-backdrop-brightness) var(--kg-backdrop-contrast) var(--kg-backdrop-grayscale) var(--kg-backdrop-hue-rotate) var(--kg-backdrop-invert) var(--kg-backdrop-opacity) var(--kg-backdrop-saturate) var(--kg-backdrop-sepia)'
        };
    },
    'backdrop-brightness': function (value) {
        return {
            '--kg-backdrop-brightness': `brightness(${value})`,
            '-webkit-backdrop-filter': 'var(--kg-backdrop-blur) var(--kg-backdrop-brightness) var(--kg-backdrop-contrast) var(--kg-backdrop-grayscale) var(--kg-backdrop-hue-rotate) var(--kg-backdrop-invert) var(--kg-backdrop-opacity) var(--kg-backdrop-saturate) var(--kg-backdrop-sepia)',
            'backdrop-filter': 'var(--kg-backdrop-blur) var(--kg-backdrop-brightness) var(--kg-backdrop-contrast) var(--kg-backdrop-grayscale) var(--kg-backdrop-hue-rotate) var(--kg-backdrop-invert) var(--kg-backdrop-opacity) var(--kg-backdrop-saturate) var(--kg-backdrop-sepia)'
        };
    },
    'backdrop-contrast': function (value) {
        return {
            '--kg-backdrop-contrast': `contrast(${value})`,
            '-webkit-backdrop-filter': 'var(--kg-backdrop-blur) var(--kg-backdrop-brightness) var(--kg-backdrop-contrast) var(--kg-backdrop-grayscale) var(--kg-backdrop-hue-rotate) var(--kg-backdrop-invert) var(--kg-backdrop-opacity) var(--kg-backdrop-saturate) var(--kg-backdrop-sepia)',
            'backdrop-filter': 'var(--kg-backdrop-blur) var(--kg-backdrop-brightness) var(--kg-backdrop-contrast) var(--kg-backdrop-grayscale) var(--kg-backdrop-hue-rotate) var(--kg-backdrop-invert) var(--kg-backdrop-opacity) var(--kg-backdrop-saturate) var(--kg-backdrop-sepia)'
        };
    },
    'backdrop-grayscale': function (value) {
        return {
            '--kg-backdrop-grayscale': `grayscale(${value})`,
            '-webkit-backdrop-filter': 'var(--kg-backdrop-blur) var(--kg-backdrop-brightness) var(--kg-backdrop-contrast) var(--kg-backdrop-grayscale) var(--kg-backdrop-hue-rotate) var(--kg-backdrop-invert) var(--kg-backdrop-opacity) var(--kg-backdrop-saturate) var(--kg-backdrop-sepia)',
            'backdrop-filter': 'var(--kg-backdrop-blur) var(--kg-backdrop-brightness) var(--kg-backdrop-contrast) var(--kg-backdrop-grayscale) var(--kg-backdrop-hue-rotate) var(--kg-backdrop-invert) var(--kg-backdrop-opacity) var(--kg-backdrop-saturate) var(--kg-backdrop-sepia)'
        };
    },
    'backdrop-hue-rotate': function (value) {
        return {
            '--kg-backdrop-hue-rotate': `hue-rotate(${value})`,
            '-webkit-backdrop-filter': 'var(--kg-backdrop-blur) var(--kg-backdrop-brightness) var(--kg-backdrop-contrast) var(--kg-backdrop-grayscale) var(--kg-backdrop-hue-rotate) var(--kg-backdrop-invert) var(--kg-backdrop-opacity) var(--kg-backdrop-saturate) var(--kg-backdrop-sepia)',
            'backdrop-filter': 'var(--kg-backdrop-blur) var(--kg-backdrop-brightness) var(--kg-backdrop-contrast) var(--kg-backdrop-grayscale) var(--kg-backdrop-hue-rotate) var(--kg-backdrop-invert) var(--kg-backdrop-opacity) var(--kg-backdrop-saturate) var(--kg-backdrop-sepia)'
        };
    },
    'backdrop-invert': function (value) {
        return {
            '--kg-backdrop-invert': `invert(${value})`,
            '-webkit-backdrop-filter': 'var(--kg-backdrop-blur) var(--kg-backdrop-brightness) var(--kg-backdrop-contrast) var(--kg-backdrop-grayscale) var(--kg-backdrop-hue-rotate) var(--kg-backdrop-invert) var(--kg-backdrop-opacity) var(--kg-backdrop-saturate) var(--kg-backdrop-sepia)',
            'backdrop-filter': 'var(--kg-backdrop-blur) var(--kg-backdrop-brightness) var(--kg-backdrop-contrast) var(--kg-backdrop-grayscale) var(--kg-backdrop-hue-rotate) var(--kg-backdrop-invert) var(--kg-backdrop-opacity) var(--kg-backdrop-saturate) var(--kg-backdrop-sepia)'
        };
    },
    'backdrop-opacity': function (value) {
        return {
            '--kg-backdrop-opacity': `opacity(${value})`,
            '-webkit-backdrop-filter': 'var(--kg-backdrop-blur) var(--kg-backdrop-brightness) var(--kg-backdrop-contrast) var(--kg-backdrop-grayscale) var(--kg-backdrop-hue-rotate) var(--kg-backdrop-invert) var(--kg-backdrop-opacity) var(--kg-backdrop-saturate) var(--kg-backdrop-sepia)',
            'backdrop-filter': 'var(--kg-backdrop-blur) var(--kg-backdrop-brightness) var(--kg-backdrop-contrast) var(--kg-backdrop-grayscale) var(--kg-backdrop-hue-rotate) var(--kg-backdrop-invert) var(--kg-backdrop-opacity) var(--kg-backdrop-saturate) var(--kg-backdrop-sepia)'
        };
    },
    'backdrop-saturate': function (value) {
        return {
            '--kg-backdrop-saturate': `saturate(${value})`,
            '-webkit-backdrop-filter': 'var(--kg-backdrop-blur) var(--kg-backdrop-brightness) var(--kg-backdrop-contrast) var(--kg-backdrop-grayscale) var(--kg-backdrop-hue-rotate) var(--kg-backdrop-invert) var(--kg-backdrop-opacity) var(--kg-backdrop-saturate) var(--kg-backdrop-sepia)',
            'backdrop-filter': 'var(--kg-backdrop-blur) var(--kg-backdrop-brightness) var(--kg-backdrop-contrast) var(--kg-backdrop-grayscale) var(--kg-backdrop-hue-rotate) var(--kg-backdrop-invert) var(--kg-backdrop-opacity) var(--kg-backdrop-saturate) var(--kg-backdrop-sepia)'
        };
    },
    'backdrop-sepia': function (value) {
        return {
            '--kg-backdrop-sepia': `sepia(${value})`,
            '-webkit-backdrop-filter': 'var(--kg-backdrop-blur) var(--kg-backdrop-brightness) var(--kg-backdrop-contrast) var(--kg-backdrop-grayscale) var(--kg-backdrop-hue-rotate) var(--kg-backdrop-invert) var(--kg-backdrop-opacity) var(--kg-backdrop-saturate) var(--kg-backdrop-sepia)',
            'backdrop-filter': 'var(--kg-backdrop-blur) var(--kg-backdrop-brightness) var(--kg-backdrop-contrast) var(--kg-backdrop-grayscale) var(--kg-backdrop-hue-rotate) var(--kg-backdrop-invert) var(--kg-backdrop-opacity) var(--kg-backdrop-saturate) var(--kg-backdrop-sepia)'
        };
    },

    'border-spacing': function (value) {
        return {
            '--kg-border-spacing-x': value,
            '--kg-border-spacing-y': value,
            'border-spacing': 'var(--kg-border-spacing-x) var(--kg-border-spacing-y)'
        };
    },

    'transition': function (value) {
        return {
            'transition-property': value,
            'transition-duration': '150ms',
            'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)'
        };
    },
    'duration': function (value) { return { 'transition-duration': value }; },
    'ease': function (value) { return { 'transition-timing-function': value }; },
    'delay': function (value) { return { 'transition-delay': value }; },
    'animate': function (value) { return { 'animation': value }; },

    // Transform utilities
    'scale': function (value) {
        return {
            '--kg-scale-x': value,
            '--kg-scale-y': value,
            'transform': 'translate(var(--kg-translate-x), var(--kg-translate-y)) rotate(var(--kg-rotate)) skewX(var(--kg-skew-x)) skewY(var(--kg-skew-y)) scaleX(var(--kg-scale-x)) scaleY(var(--kg-scale-y))'
        };
    },
    'scale-x': function (value) {
        return {
            '--kg-scale-x': value,
            'transform': 'translate(var(--kg-translate-x), var(--kg-translate-y)) rotate(var(--kg-rotate)) skewX(var(--kg-skew-x)) skewY(var(--kg-skew-y)) scaleX(var(--kg-scale-x)) scaleY(var(--kg-scale-y))'
        };
    },
    'scale-y': function (value) {
        return {
            '--kg-scale-y': value,
            'transform': 'translate(var(--kg-translate-x), var(--kg-translate-y)) rotate(var(--kg-rotate)) skewX(var(--kg-skew-x)) skewY(var(--kg-skew-y)) scaleX(var(--kg-scale-x)) scaleY(var(--kg-scale-y))'
        };
    },
    'rotate': function (value) {
        return {
            '--kg-rotate': value,
            'transform': 'translate(var(--kg-translate-x), var(--kg-translate-y)) rotate(var(--kg-rotate)) skewX(var(--kg-skew-x)) skewY(var(--kg-skew-y)) scaleX(var(--kg-scale-x)) scaleY(var(--kg-scale-y))'
        };
    },
    'translate-x': function (value) {
        return {
            '--kg-translate-x': value,
            'transform': 'translate(var(--kg-translate-x), var(--kg-translate-y)) rotate(var(--kg-rotate)) skewX(var(--kg-skew-x)) skewY(var(--kg-skew-y)) scaleX(var(--kg-scale-x)) scaleY(var(--kg-scale-y))'
        };
    },
    'translate-y': function (value) {
        return {
            '--kg-translate-y': value,
            'transform': 'translate(var(--kg-translate-x), var(--kg-translate-y)) rotate(var(--kg-rotate)) skewX(var(--kg-skew-x)) skewY(var(--kg-skew-y)) scaleX(var(--kg-scale-x)) scaleY(var(--kg-scale-y))'
        };
    },
    'skew-x': function (value) {
        return {
            '--kg-skew-x': value,
            'transform': 'translate(var(--kg-translate-x), var(--kg-translate-y)) rotate(var(--kg-rotate)) skewX(var(--kg-skew-x)) skewY(var(--kg-skew-y)) scaleX(var(--kg-scale-x)) scaleY(var(--kg-scale-y))'
        };
    },
    'skew-y': function (value) {
        return {
            '--kg-skew-y': value,
            'transform': 'translate(var(--kg-translate-x), var(--kg-translate-y)) rotate(var(--kg-rotate)) skewX(var(--kg-skew-x)) skewY(var(--kg-skew-y)) scaleX(var(--kg-scale-x)) scaleY(var(--kg-scale-y))'
        };
    },
    'origin': function (value) { return { 'transform-origin': value }; },

    'accent': function (value) { return { 'accent-color': value }; },
    'cursor': function (value) { return { 'cursor': value }; },
    'caret': function (value) { return { 'caret-color': value }; },
    'scroll-m': function (value) { return { 'scroll-margin': value }; },
    'scroll-p': function (value) { return { 'scroll-padding': value }; },
    'will-change': function (value) { return { 'will-change': value }; },
    'fill': function (value) { return { 'fill': value }; },
    'stroke': function (value) {
        if (/^\d/.test(value)) {
            return { 'stroke-width': value };
        } else {
            return { 'stroke': value };
        }
    }
};

function processColor(value, opacityVar) {
    const color = tinycolor(value);
    if (color.isValid()) {
        const rgb = color.toRgb();
        return `rgb(${rgb.r} ${rgb.g} ${rgb.b} / var(${opacityVar}))`;
    }
    return value;
}

function processColorWithOpacity(value, opacity) {
    const color = tinycolor(value).setAlpha(opacity);
    if (color.isValid()) {
        const rgb = color.toRgb();
        return `rgb(${rgb.r} ${rgb.g} ${rgb.b} / ${opacity})`;
    }
    return value;
}

function addSpacesAroundOperators(value) {
    return value.replace(/calc\(([^)]+)\)/g, (match, inner) => {
        const spacedInner = inner.replace(/([+\-*/])/g, ' $1 ');
        return `calc(${spacedInner})`;
    });
}

function sanitizeValue(value) {
    return value
        .replace(/\\\//g, '/') // Slash'leri escape etme
        .replace(/\\:/g, ':') // İki noktaları escape etme
        .replace(/\\;/g, ';') // Noktalı virgülleri escape etme
        .replace(/\\,/g, ',') // Virgülleri escape etme
        .replace(/\\\./g, '.') // Noktaları escape etme
        .replace(/_/g, ' ') // Alt çizgileri boşlukla değiştir
        .replace(/\(\s+/g, '(').replace(/\s+\)/g, ')') // Boşlukları parantezlerin içinden kaldır
        .replace(/\s+/g, ' ').trim(); // Birden fazla boşluğu tek boşlukla değiştir ve baştaki ve sondaki boşlukları kaldır
}

function escapeClassName(className) {
    return cssesc(className).replace(/\\,/g, '\\2c ');
}

// Pseudo-class ve Pseudo-element'leri ayırmak için yardımcı fonksiyon
function extractPseudo(property) {
    const pseudoClasses = {
        'hover': () => [':hover'],
        'focus-visible': () => [':focus-visible'],
        'focus-within': () => [':focus-within'],
        'focus': () => [':focus'],
        'active': () => [':active'],
        'visited': () => [':visited'],
        'link': () => [':link'],
        'checked': () => [':checked'],
        'disabled': () => [':disabled'],
        'enabled': () => [':enabled'],
        'required': () => [':required'],
        'optional': () => [':optional'],
        'read-only': () => [':read-only'],
        'read-write': () => [':read-write'],
        'placeholder-shown': () => [':placeholder-shown'],
        'target': () => [':target'],
        'nth-child': () => [':nth-child'],
        'nth-last-child': () => [':nth-last-child'],
        'first-of-type': () => [':first-of-type'],
        'last-of-type': () => [':last-of-type'],
        'nth-of-type': () => [':nth-of-type'],
        'nth-last-of-type': () => [':nth-last-of-type'],
        'only-child': () => [':only-child'],
        'only-of-type': () => [':only-of-type'],
        'empty': () => [':empty'],
        'odd': () => [':nth-child(odd)'],
        'even': () => [':nth-child(even)'],
        'autofill': () => [':autofill'],
        'invalid': () => [':invalid'],
        'valid': () => [':valid'],
        'indeterminate': () => [':indeterminate'],
        'out-of-range': () => [':out-of-range'],
        'in-range': () => [':in-range'],
        'first': () => [':first-child'],
        'last': () => [':last-child'],
    };

    const pseudoElements = {
        'before': () => ['::before'],
        'after': () => ['::after'],
        'first-letter': () => ['::first-letter'],
        'first-line': () => ['::first-line'],
        'selection': () => ['::selection'],
        'placeholder': () => ['::placeholder'],
        'backdrop': () => ['::backdrop'],
        'marker': () => ['::marker', ' *::marker'],
        'file-selector-button': () => ['::file-selector-button'],
    };

    // Pseudo-element kontrolü
    for (const [pseudoElementKey, pseudoElementFunc] of Object.entries(pseudoElements)) {
        if (property.startsWith(`${pseudoElementKey}`)) {
            const pseudoValue = pseudoElementFunc();
            return {
                pseudoType: 'element',
                pseudoValue,
                property: property.slice(pseudoElementKey.length), // Pseudo-element'i kaldır
            };
        }
    }

    // Pseudo-class kontrolü
    for (const [pseudoClassKey, pseudoClassFunc] of Object.entries(pseudoClasses)) {
        if (property.startsWith(`${pseudoClassKey}`)) {
            const pseudoValue = pseudoClassFunc();
            return {
                pseudoType: 'class',
                pseudoValue,
                property: property.slice(pseudoClassKey.length), // Pseudo-class'ı kaldır
            };
        }
    }

    // Ne pseudo-class ne pseudo-element ise
    return {
        pseudoType: null,
        pseudoValue: null,
        property,
    };
}

// Pseudo-class ve Pseudo-element'leri ayırmak için recursive fonksiyon
function extractMultiplePseudos(property) {
    let pseudoSelectors = [''];
    let remainingProperty = property;
    let pseudoType, pseudoValue;

    while (true) {
        ({ pseudoType, pseudoValue, property: remainingProperty } = extractPseudo(remainingProperty));
        if (!pseudoType) break;

        pseudoSelectors = pseudoSelectors.map(sel => sel + pseudoValue.join(''));
    }

    return {
        pseudoSelectors,
        property: remainingProperty,
    };
}

// !important kontrolü için yardımcı fonksiyon
function checkImportant(property) {
    if (property.startsWith('!')) {
        return {
            property: property.slice(1),
            isImportant: ' !important',
        };
    }
    return {
        property: property,
        isImportant: '',
    };
}

// CSS çıktılarını oluşturmak için yardımcı fonksiyon
function generateCSSOutput(selector, declarations, isImportant, addContent = false) {
    let cssOutput = `${selector} {\n`;

    // Eğer pseudo-element varsa, content ekleyelim
    if (addContent) {
        cssOutput += `  content: var(--kg-content);\n`;
    }

    // Diğer CSS özelliklerini ekleyelim
    for (const [prop, val] of Object.entries(declarations)) {
        cssOutput += `  ${prop}: ${val}${isImportant};\n`;
    }

    cssOutput += '}';
    return cssOutput;
}

// space- ve divide- işlemleri için fonksiyon
function handleSpaceOrDivide(property, className, value) {
    const spacePropertyKey = `${property} > :not([hidden]) ~ :not([hidden])`;
    const cssProperties = propertyMap[spacePropertyKey];

    if (cssProperties) {
        const declarations = cssProperties(value);
        return generateCSSOutput(`.${escapeClassName(className)} > :not([hidden]) ~ :not([hidden])`, declarations, '');
    }

    return null;
}

// before:content ve after:content işlemleri için fonksiyon
function handlePseudoContent(property, className, value, pseudoSelector) {
    const cssProperties = propertyMap[property];

    // Eğer content tanımlanmışsa, özel content işlemi yapılmalı
    if (property === 'content') {

        return `
            .${escapeClassName(className)}${pseudoSelector} {
            --kg-content: ${value};
            content: var(--kg-content);
            }
        `;
    }

    // Diğer özellikler için normal CSS işlemi
    if (cssProperties) {
        const declarations = cssProperties(value);
        return generateCSSOutput(
            `.${escapeClassName(className)}${pseudoSelector}`,
            declarations,
            '',
            true // content eklemek için flag
        );
    }

    return null;
}

// İşlenen class'ları saklamak için bir Set oluşturun
const processedClasses = new Set();

// CSS çıktıları breakpoint'lere göre gruplamak için nesneler ekledim
const breakpointCssMap = {};
const defaultCssOutputs = [];

// Ana parse fonksiyonu
function parseKgClass(className) {

    // Eğer daha önce işlenmişse, tekrar işleme gerek yok
    if (processedClasses.has(className)) {
        return;
    }

    // İşlenen class'ları ekleyin
    processedClasses.add(className);

    let isStarClass = false;
    let adjustedClassName = className;

    // Eğer className '*:' ile başlıyorsa, bunu işaretleyelim
    if (className.startsWith('*:')) {
        isStarClass = true;
        adjustedClassName = className.slice(2); // '*:' kısmını çıkar
    }

    // Class ismini ':' karakterine göre bölüyoruz
    const classParts = adjustedClassName.split(':');
    let breakpoint = null;
    let pseudoPrefixes = [];
    let propertyAndValue = classParts.pop(); // Son kısım property ve value

    // Breakpoint ve pseudo-class'ları ayırıyoruz
    classParts.forEach(part => {
        if (breakpoints[part]) {
            breakpoint = part;
        } else {
            pseudoPrefixes.push(part);
        }
    });

    // Pseudo-class ve pseudo-element'leri property'den ayırıyoruz
    let { pseudoSelectors, property } = extractMultiplePseudos(propertyAndValue);

    // Önceki pseudo-selectors ile birleştiriyoruz
    pseudoPrefixes.forEach(prefix => {
        const { pseudoValue } = extractPseudo(prefix);
        if (pseudoValue) {
            pseudoSelectors = pseudoSelectors.map(sel => pseudoValue.join('') + sel);
        }
    });

    let { property: cleanProperty, isImportant } = checkImportant(property);
    const regex = /^([^\s]+)-\[(.+)\]$/;
    const match = cleanProperty.match(regex);

    if (!match) {
        return;
    }

    cleanProperty = match[1];
    let value = match[2];

    value = sanitizeValue(value);
    value = addSpacesAroundOperators(value);

    // space- ve divide- işlemleri için kontrol ekleyin
    if (cleanProperty.startsWith('space-') || cleanProperty.startsWith('divide-')) {
        const cssOutput = handleSpaceOrDivide(cleanProperty, className, value);
        if (cssOutput) {
            if (breakpoint) {
                if (!breakpointCssMap[breakpoint]) breakpointCssMap[breakpoint] = [];
                breakpointCssMap[breakpoint].push(cssOutput);
            } else {
                defaultCssOutputs.push(cssOutput);
            }
        }
        return;
    }

    // Pseudo-element için content özelliğini kontrol et ve ekle
    if (cleanProperty.startsWith('content')) {
        const cssOutput = handlePseudoContent(cleanProperty, className, value, pseudoSelectors.join(''));
        if (cssOutput) {
            if (breakpoint) {
                if (!breakpointCssMap[breakpoint]) breakpointCssMap[breakpoint] = [];
                breakpointCssMap[breakpoint].push(cssOutput);
            } else {
                defaultCssOutputs.push(cssOutput);
            }
        }
        return;
    }

    // Genel CSS property işlemi
    const cssProperties = propertyMap[cleanProperty];
    if (!cssProperties) {
        return;
    }

    let selector = `.${escapeClassName(className)}`;
    if (isStarClass) {
        selector += ' > *';
    }
    if (pseudoSelectors.length > 0) {
        selector += pseudoSelectors.join('');
    }

    const declarations = cssProperties(value);

    let cssOutput = generateCSSOutput(
        selector,
        declarations,
        isImportant,
        pseudoSelectors.some(ps => ps.includes('::before') || ps.includes('::after'))
    );

    // CSS çıktısını oluşturduktan sonra breakpoint kontrolü yapıyoruz
    if (cssOutput) {
        if (breakpoint) {
            if (!breakpointCssMap[breakpoint]) breakpointCssMap[breakpoint] = [];
            breakpointCssMap[breakpoint].push(cssOutput);
        } else {
            defaultCssOutputs.push(cssOutput);
        }
    }
}

const customHtml = fs.readFileSync('./dist/custom.html', 'utf-8');

const classRegex = /class=(["'])(.*?)\1|class=([^\s>]+)/g;
const classes = new Set();
let match;
while ((match = classRegex.exec(customHtml)) !== null) {
    const classAttribute = match[2] || match[3];
    const classList = classAttribute.split(/\s+/);
    classList.forEach((className) => {
        classes.add(className);
    });
}

// custom.css dosyasını temizleyin
fs.writeFileSync('./dist/custom.css', '');

classes.forEach(element => {
    parseKgClass(element);
});

// Tüm class'ları işledikten sonra CSS çıktıları oluşturuyoruz
let cssOutputs = '';

// Önce default CSS çıktıları ekleyin
if (defaultCssOutputs.length > 0) {
    cssOutputs += defaultCssOutputs.join('\n\n') + '\n\n';
}

// Breakpoint'lere göre CSS çıktıları ekleyin
for (const [breakpoint, cssArray] of Object.entries(breakpointCssMap)) {
    const minWidth = breakpoints[breakpoint];
    cssOutputs += `@media (min-width: ${minWidth}) {\n`;
    cssOutputs += cssArray.map(css => css.split('\n').map(line => '  ' + line).join('\n')).join('\n\n') + '\n';
    cssOutputs += '}\n\n';
}

fs.writeFileSync('./dist/custom.css', cssOutputs);
