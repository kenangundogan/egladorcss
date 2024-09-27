export function generateTopRightBottomLeftClasses() {
    const classes = {};
    const insetScale = {
        '0': '0px',
        'px': '1px',
        '0.5': '0.125rem', // 2px
        '1': '0.25rem', // 4px
        '1.5': '0.375rem', // 6px
        '2': '0.5rem', // 8px
        '2.5': '0.625rem', // 10px
        '3': '0.75rem', // 12px
        '3.5': '0.875rem', // 14px
        '4': '1rem', // 16px
        '5': '1.25rem', // 20px
        '6': '1.5rem', // 24px
        '7': '1.75rem', // 28px
        '8': '2rem', // 32px
        '9': '2.25rem', // 36px
        '10': '2.5rem', // 40px
        '11': '2.75rem', // 44px
        '12': '3rem', // 48px
        '14': '3.5rem', // 56px
        '16': '4rem', // 64px
        '20': '5rem', // 80px
        '24': '6rem', // 96px
        '28': '7rem', // 112px
        '32': '8rem', // 128px
        '36': '9rem', // 144px
        '40': '10rem', // 160px
        '44': '11rem', // 176px
        '48': '12rem', // 192px
        '52': '13rem', // 208px
        '56': '14rem', // 224px
        '60': '15rem', // 240px
        '64': '16rem', // 256px
        '72': '18rem', // 288px
        '80': '20rem', // 320px
        '96': '24rem', // 384px
        'auto': 'auto',
        '1/2': '50%',
        '1/3': '33.333333%',
        '2/3': '66.666667%',
        '1/4': '25%',
        '2/4': '50%',
        '3/4': '75%',
        'full': '100%',
    };

    const directions = ['inset', 'top', 'right', 'bottom', 'left', 'inset-x', 'inset-y', 'start', 'end'];

    directions.forEach((direction) => {
        Object.keys(insetScale).forEach((key) => {
            const className = `${direction}-${key}`;
            let value = insetScale[key];
            switch (direction) {
                case 'inset':
                    classes[className] = `inset: ${value};`;
                    break;
                case 'top':
                    classes[className] = `top: ${value};`;
                    break;
                case 'right':
                    classes[className] = `right: ${value};`;
                    break;
                case 'bottom':
                    classes[className] = `bottom: ${value};`;
                    break;
                case 'left':
                    classes[className] = `left: ${value};`;
                    break;
                case 'inset-x':
                    classes[className] = `left: ${value}; right: ${value};`;
                    break;
                case 'inset-y':
                    classes[className] = `top: ${value}; bottom: ${value};`;
                    break;
                case 'start':
                    classes[className] = `inset-inline-start: ${value};`;
                    break;
                case 'end':
                    classes[className] = `inset-inline-end: ${value};`;
                    break;
            }
        });
    });

    return classes;
}
