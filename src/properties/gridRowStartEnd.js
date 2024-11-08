export function generateGridRowStartEndClasses() {
    const classes = {};

    const rowSpans = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    rowSpans.forEach(span => {
        classes[`row-span-${span}`] = `grid-row: span ${span} / span ${span};`;
    });
    classes['row-span-full'] = 'grid-row: 1 / -1;';

    const rowStarts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    rowStarts.forEach(start => {
        classes[`row-start-${start}`] = `grid-row-start: ${start};`;
    });
    classes['row-start-auto'] = 'grid-row-start: auto;';

    const rowEnds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    rowEnds.forEach(end => {
        classes[`row-end-${end}`] = `grid-row-end: ${end};`;
    });
    classes['row-end-auto'] = 'grid-row-end: auto;';

    classes['row-auto'] = 'grid-row: auto;';

    return classes;
}
