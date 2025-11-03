let widget1Disabled = false
let widget2Disabled = false

// hides these two widgets instantly
const observer = new MutationObserver(() => {
	const widget1 = document.querySelector('.optimus-container')
	if (widget1) {
		widget1.style.setProperty('display', 'none', 'important')
		widget1Disabled = true
	}

	const widget2 = document.querySelector(
		'#carrotquest-messenger-collapsed-container'
	)
	if (widget2) {
		widget2.style.setProperty('display', 'none', 'important')
		widget2Disabled = true
	}

	if (widget1Disabled && widget2Disabled) {
		observer.disconnect()
	}
})

// start observing the document as soon as possible
observer.observe(document, { childList: true, subtree: true })
