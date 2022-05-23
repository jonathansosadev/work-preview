const checkPermissions = (have, ...mustHave) => {
    return have.some(permission => mustHave.includes(permission))
}

module.exports = {
    routesPermissions: {
        CUSTEED: 'CUSTEED',
        SHARED_REVIEWS: 'SHARED_REVIEWS',
        REVIEWS: 'REVIEWS',
        LEADS: 'LEADS',
        GARAGES: 'GARAGES'
    },
    checkPermissions
}
