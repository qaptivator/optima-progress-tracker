const observer = new MutationObserver(() => {
	const widget = document.querySelector('.optimus-container')
	if (widget) {
		// hide instantly
		widget.style.setProperty('display', 'none', 'important')
		// stop observing once hidden
		observer.disconnect()
	}
})

// start observing the document as soon as possible
observer.observe(document, { childList: true, subtree: true })
