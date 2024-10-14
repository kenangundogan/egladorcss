import fs from 'fs';
import cssesc from 'css.escape';
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

    'space-y > :not([hidden]) ~ :not([hidden]) ': function (value) {
        return {
            '--kg-space-y-reverse': '0',
            'margin-top': `calc(${value} * calc(1 - var(--kg-space-y-reverse)))`,
            'margin-bottom': `calc(${value} * var(--kg-space-y-reverse))`
        };
    },
    'space-x > :not([hidden]) ~ :not([hidden]) ': function (value) {
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
        if (value.startsWith('#') || value.startsWith('rgb')) {
            return {
                '--kg-border-opacity': '1',
                'border-color': `${processColor(value, '--kg-border-opacity')}`
            };
        } else {
            return { 'border-width': value };
        }
    },
    'divide-x > :not([hidden]) ~ :not([hidden]) ': function (value) {
        return {
            '--kg-divide-x-reverse': '0',
            'border-right-width': `calc(${value} * var(--kg-divide-x-reverse))`,
            'border-left-width': `calc(${value} * calc(1 - var(--kg-divide-x-reverse)))`
        };
    },
    'divide-y > :not([hidden]) ~ :not([hidden]) ': function (value) {
        return {
            '--kg-divide-y-reverse': '0',
            'border-top-width': `calc(${value} * calc(1 - var(--kg-divide-y-reverse)))`,
            'border-bottom-width': `calc(${value} * var(--kg-divide-y-reverse))`
        };
    },
    'divide': function (value) {
        if (value.startsWith('#') || value.startsWith('rgb')) {
            return {
                '--kg-divide-opacity': '1',
                'border-color': `${processColor(value, '--kg-divide-opacity')}`
            };
        } else {
            return { 'border-width': value };
        }
    },

    'outline': function (value) {
        if (value.startsWith('#') || value.startsWith('rgb')) {
            return { 'outline-color': value };
        } else {
            return { 'outline-width': value };
        }
    },
    'outline-offset': function (value) { return { 'outline-offset': value }; },

    'ring': function (value) {
        if (value.startsWith('#') || value.startsWith('rgb')) {
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
        if (value.startsWith('#') || value.startsWith('rgb')) {
            return { '--kg-ring-offset-color': value };
        } else {
            return { '--kg-ring-offset-width': value };
        }
    },

    'shadow': function (value) {
        if (value.startsWith('#') || value.startsWith('rgb')) {
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

function processColor(value, opacity) {
    if (value.startsWith('#') && value.length === 7) {
        const r = parseInt(value.slice(1, 3), 16);
        const g = parseInt(value.slice(3, 5), 16);
        const b = parseInt(value.slice(5, 7), 16);
        return `rgb(${r} ${g} ${b} / var(${opacity}))`;
    }
    return value;
}

function processColorWithOpacity(value, opacity) {
    if (value.startsWith('#') && value.length === 7) {
        const r = parseInt(value.slice(1, 3), 16);
        const g = parseInt(value.slice(3, 5), 16);
        const b = parseInt(value.slice(5, 7), 16);
        return `rgb(${r} ${g} ${b} / ${opacity})`;
    }
    return value;
}

function addSpacesAroundOperators(value) {
    return value.replace(/calc\(([^)]+)\)/g, (match, inner) => {
        const spacedInner = inner.replace(/([+\-*/])/g, ' $1 ');
        return `calc(${spacedInner})`;
    });
}

function specialCharToOriginal(value) {
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
    let result = cssesc(className).replace(/\\,/g, '\\2c ');
    return result;
}

// Pseudo-class ve Pseudo-element'leri ayırmak için yardımcı fonksiyon
function extractPseudo(property) {
    const pseudoClasses = {
        'hover': ':hover', // Fare imleci eleman üzerinde durduğunda uygulanır
        'focus-visible': ':focus-visible', // Klavye ile focuslanınca uygulanır
        'focus-within': ':focus-within', // İçerik odaklandığında uygulanır
        'focus': ':focus', // Eleman odaklandığında (örneğin input kutusu odaklandığında) uygulanır
        'active': ':active', // Eleman tıklanıp aktif olduğunda uygulanır
        'visited': ':visited', // Ziyaret edilen linkler için uygulanır
        'link': ':link', // Ziyaret edilmemiş linkler için uygulanır
        'checked': ':checked', // Checkbox veya radio button gibi elemanlar seçildiğinde uygulanır
        'disabled': ':disabled', // Disable (devre dışı) edilmiş form elemanları için uygulanır
        'enabled': ':enabled', // Enable (etkin) durumdaki form elemanları için uygulanır
        'required': ':required', // Gerekli (required) form elemanları için uygulanır
        'optional': ':optional', // Opsiyonel (required olmayan) form elemanları için uygulanır
        'read-only': ':read-only', // Salt okunur (readonly) elemanlar için uygulanır
        'read-write': ':read-write', // Düzenlenebilir elemanlar için uygulanır
        'placeholder-shown': ':placeholder-shown', // Placeholder gösterildiğinde uygulanır (input elemanları için)
        'target': ':target', // URL'de # ile belirtilen fragment'a hedeflenen eleman için uygulanır
        'first': ':first-child', // İlk çocuk eleman için uygulanır
        'last': ':last-child', // Son çocuk eleman için uygulanır
        'nth-child': ':nth-child', // Belirli sıradaki çocuk eleman için uygulanır (örnek: nth-child(2) -> 2. çocuk)
        'nth-last-child': ':nth-last-child', // Belirli sıradaki son çocuk eleman için uygulanır
        'first-of-type': ':first-of-type', // Aynı tipteki ilk eleman için uygulanır (örneğin, ilk `<p>` elemanı)
        'last-of-type': ':last-of-type', // Aynı tipteki son eleman için uygulanır
        'nth-of-type': ':nth-of-type', // Belirli sıradaki aynı tipteki eleman için uygulanır
        'nth-last-of-type': ':nth-last-of-type', // Belirli sıradaki aynı tipteki son eleman için uygulanır
        'only-child': ':only-child', // Tek çocuk eleman için uygulanır (eğer bir ebeveynin sadece bir çocuğu varsa)
        'only-of-type': ':only-of-type', // Tek tipteki eleman için uygulanır (örneğin, sadece bir `<div>` varsa)
        'empty': ':empty', // İçeriği olmayan elemanlar için uygulanır
        'odd': ':nth-child(odd)', // Tek sıra numarasındaki elemanlar için uygulanır (örnek: 1., 3., 5. eleman)
        'even': ':nth-child(even)', // Çift sıra numarasındaki elemanlar için uygulanır (örnek: 2., 4., 6. eleman)
        'autofill': ':autofill', // Form elemanlarına otomatik doldurma işlemi başladığında uygulanır,
        'invalid': ':invalid', // Geçersiz form elemanları için uygulanır
        'valid': ':valid', // Geçerli form elemanları için uygulanır
        'indeterminate': ':indeterminate', // Checkbox veya radio button gibi elemanlar için uygulanır
        'out-of-range': ':out-of-range', // Belirli aralık dışındaki form elemanları için uygulanır
        'in-range': ':in-range', // Belirli aralık içindeki form elemanları için uygulanır
    };


    const pseudoElements = {
        'before': '::before', // Elemanın öncesine içerik ekler, örneğin bir simge eklemek için kullanılabilir
        'after': '::after', // Elemanın sonrasına içerik ekler, örneğin bir simge veya stil eklemek için kullanılabilir
        'first-letter': '::first-letter', // Elemanın ilk harfi için özel stil uygulamak için kullanılır
        'first-line': '::first-line', // Elemanın ilk satırına özel stil uygulamak için kullanılır
        'selection': '::selection', // Seçilen (highlight edilen) metin için stil uygulamak için kullanılır
        'placeholder': '::placeholder', // Form input elemanlarının placeholder'ına stil uygulamak için kullanılır
        'backdrop': '::backdrop', // Tam ekran modunda (fullscreen) olan içeriklerin arka planını stilize etmek için kullanılır
        'marker': '::marker', // Liste elemanlarının işaretleyicilerine (bullet points) stil uygulamak için kullanılır
        'file-selector-button': '::file-selector-button' // File input butonlarına stil uygulamak için kullanılır
    };

    // Pseudo-class kontrolü
    for (const [pseudoClassKey, pseudoClassSelector] of Object.entries(pseudoClasses)) {
        if (property.startsWith(`${pseudoClassKey}`)) {
            return {
                pseudoType: 'class',
                pseudoValue: pseudoClassSelector,
                property: property.slice(pseudoClassKey.length + 1), // Pseudo-class'ı çıkar
            };
        }
    }

    // Pseudo-element kontrolü
    for (const [pseudoElementKey, pseudoElementSelector] of Object.entries(pseudoElements)) {
        if (property.startsWith(`${pseudoElementKey}`)) {
            return {
                pseudoType: 'element',
                pseudoValue: pseudoElementSelector,
                property: property.slice(pseudoElementKey.length + 1), // Pseudo-element'i çıkar
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
    let pseudoSelector = '';
    let remainingProperty = property;
    let pseudoType, pseudoValue;

    do {
        ({ pseudoType, pseudoValue, property: remainingProperty } = extractPseudo(remainingProperty));
        if (pseudoType === 'class') {
            pseudoSelector += `${pseudoValue}`;
        } else if (pseudoType === 'element') {
            pseudoSelector += `${pseudoValue}`;
        }
    } while (pseudoType);
    return {
        pseudoSelector,
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
    const spacePropertyKey = `${property} > :not([hidden]) ~ :not([hidden]) `;
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

// Ana parse fonksiyonu
function parseKgClass(className) {

    // Eğer daha önce işlenmişse, tekrar işleme gerek yok
    if (processedClasses.has(className)) {
        return null;
    }

    // İşlenen class'ları ekleyin
    processedClasses.add(className);


    const regex = /^([^\s]+)-\[(.+)\]$/;
    const match = className.match(regex);

    if (!match) {
        return null;
    }

    // Pseudo-class veya pseudo-element'leri key-value yapısından recursive olarak ayır
    let { pseudoSelector, property } = extractMultiplePseudos(match[1]);

    let { property: cleanProperty, isImportant } = checkImportant(property);
    let value = specialCharToOriginal(match[2]);
    value = addSpacesAroundOperators(value);

    // space- ve divide- işlemleri için kontrol ekleyin
    if (cleanProperty.startsWith('space-') || cleanProperty.startsWith('divide-')) {
        return handleSpaceOrDivide(cleanProperty, className, value);
    }

    // Pseudo-element için content özelliğini kontrol et ve ekle
    if (cleanProperty.startsWith('content')) {
        return handlePseudoContent(cleanProperty, className, value, pseudoSelector);
    }

    // Genel CSS property işlemi
    const cssProperties = propertyMap[cleanProperty];
    if (!cssProperties) {
        return null;
    }

    return generateCSSOutput(
        `.${escapeClassName(className)}${pseudoSelector}`,
        cssProperties(value),
        isImportant,
        pseudoSelector.includes('::before') || pseudoSelector.includes('::after') // before/after varsa content ekle
    );
}



const customHtml = fs.readFileSync('./dist/custom.html', 'utf-8');

const regex = /class="([^"]+)"/g;
const classes = new Set();
let match;
while ((match = regex.exec(customHtml)) !== null) {
    const classList = match[1].split(' ');
    classList.forEach((className) => {
        classes.add(className);
    });
}

classes.forEach(element => {
    const cssOutput = parseKgClass(element);
    if (cssOutput) {
        fs.appendFileSync('./dist/custom.css', cssOutput + '\n\n');
    }
});

