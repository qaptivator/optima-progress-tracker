const style = document.createElement('style')
style.textContent = `
    .optimus-container, 
    #carrotquest-messenger-collapsed-container {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
    }
`
document.documentElement.appendChild(style)
