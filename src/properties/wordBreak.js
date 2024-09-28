export function generateWordBreakClasses() {
    return {
        'break-normal': 'overflow-wrap: normal; word-break: normal;',
        'break-words': 'overflow-wrap: break-word;',
        'break-all': 'word-break: break-all;',
        'break-keep': 'word-break: keep-all;',
    };
}