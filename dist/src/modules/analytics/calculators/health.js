export const getBusinessHealthScore = (growth) => {
    if (growth > 20)
        return "Excellent";
    if (growth > 10)
        return "Good";
    if (growth > 0)
        return "Average";
    return "Poor";
};
//# sourceMappingURL=health.js.map