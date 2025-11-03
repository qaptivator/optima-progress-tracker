// table ui
function scrapeData() {
	const selector = '.block_completion_progress > div > div'
	const container = document.querySelector(selector)
	if (!container) return

	const results = []

	for (const card of container.querySelectorAll(':scope > div')) {
		const headerLink = card.querySelector('div.completion-progress-header a')
		if (!headerLink) continue
		const name = headerLink.textContent.trim()

		const bars = card.querySelectorAll(
			'div.barContainer div.barRow.barModeWrap div.barRowCells div'
		)

		let done = 0,
			todo = 0,
			ahead = 0

		for (const bar of bars) {
			const cls = bar.classList
			if (getComputedStyle(bar).display === 'none') continue
			if (cls.contains('completed')) done++
			else if (cls.contains('notCompleted')) todo++
			else if (cls.contains('futureNotCompleted')) ahead++
		}

		results.push({ name, done, todo, ahead })
	}

	results.sort((a, b) => b.todo - a.todo)

	browser.storage.local.set({ optimaData: results })
}

scrapeData()

// navbar ui
function updateWidgetVisibility(hidden) {
	const widget1 = document.querySelector(
		'#carrotquest-messenger-collapsed-container'
	)
	const widget2 = document.querySelector('.optimus-container')

	if (hidden) {
		console.log(
			'[updateWidgetVisibility]',
			hidden,
			'widget1',
			widget1,
			'widget2',
			widget2
		)
		if (widget1) widget1.style.setProperty('display', 'none', 'important')
		if (widget2) widget2.style.setProperty('display', 'none', 'important')
	} else {
		if (widget1) widget1.style.setProperty('display', '', '')
		if (widget2) widget2.style.setProperty('display', 'flex', 'important')
	}
}

;(async () => {
	const { widgetsHidden } = await browser.storage.local.get('widgetsHidden')
	updateWidgetVisibility(widgetsHidden ?? false)
})()

browser.storage.onChanged.addListener((changes, area) => {
	if (area === 'local' && 'widgetsHidden' in changes) {
		updateWidgetVisibility(changes.widgetsHidden.newValue)
	}
})
