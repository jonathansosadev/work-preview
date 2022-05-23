const isOnMobileDevice = () => {
    return ( navigator.userAgent.includes('Android')
    || navigator.userAgent.includes('webOS')
    || navigator.userAgent.includes('iPhone')
    || navigator.userAgent.includes('iPad')
    || navigator.userAgent.includes('iPod')
    || navigator.userAgent.includes('BlackBerry')
    || navigator.userAgent.includes('Windows Phone'));
}

export { isOnMobileDevice }
