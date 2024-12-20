export function generateSizeClasses() {
    const classes = {};

    const sizeValues = {
        '0': '0px',
        'px': '1px',
        '0.5': '0.125rem',    // 2px
        '1': '0.25rem',       // 4px
        '1.5': '0.375rem',    // 6px
        '2': '0.5rem',        // 8px
        '2.5': '0.625rem',    // 10px
        '3': '0.75rem',       // 12px
        '3.5': '0.875rem',    // 14px
        '4': '1rem',          // 16px
        '5': '1.25rem',       // 20px
        '6': '1.5rem',        // 24px
        '7': '1.75rem',       // 28px
        '8': '2rem',          // 32px
        '9': '2.25rem',       // 36px
        '10': '2.5rem',       // 40px
        '11': '2.75rem',      // 44px
        '12': '3rem',         // 48px
        '14': '3.5rem',       // 56px
        '16': '4rem',         // 64px
        '18': '4.5rem',       // 72px
        '20': '5rem',         // 80px
        '24': '6rem',         // 96px
        '28': '7rem',         // 112px
        '32': '8rem',         // 128px
        '36': '9rem',         // 144px
        '40': '10rem',        // 160px
        '44': '11rem',        // 176px
        '48': '12rem',        // 192px
        '52': '13rem',        // 208px
        '56': '14rem',        // 224px
        '60': '15rem',        // 240px
        '64': '16rem',        // 256px
        '72': '18rem',        // 288px
        '80': '20rem',        // 320px
        '96': '24rem',        // 384px,
        'auto': 'auto',
        'full': '100%',
        'min': 'min-content',
        'max': 'max-content',
        'fit': 'fit-content',
        '1/2': '50%',
        '1/3': '33.333333%',
        '2/3': '66.666667%',
        '1/4': '25%',
        '2/4': '50%',
        '3/4': '75%',
        '1/5': '20%',
        '2/5': '40%',
        '3/5': '60%',
        '4/5': '80%',
        '1/6': '16.666667%',
        '2/6': '33.333333%',
        '3/6': '50%',
        '4/6': '66.666667%',
        '5/6': '83.333333%',
        '1/12': '8.333333%',
        '2/12': '16.666667%',
        '3/12': '25%',
        '4/12': '33.333333%',
        '5/12': '41.666667%',
        '6/12': '50%',
        '7/12': '58.333333%',
        '8/12': '66.666667%',
        '9/12': '75%',
        '10/12': '83.333333%',
        '11/12': '91.666667%',
    };

    Object.keys(sizeValues).forEach((key) => {
        const value = sizeValues[key];
        classes[`size-${key}`] = `width: ${value}; height: ${value};`;
    });

    return classes;
}
