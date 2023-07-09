export const generateNewId = (items: Record<number, unknown>) => {
    return Math.max(0, ...Object.keys(items).map(Number)) + 1;
}