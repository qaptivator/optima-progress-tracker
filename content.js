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

	// Sort by todo descending
	results.sort((a, b) => b.todo - a.todo)

	// Save to storage
	browser.storage.local.set({ optimaData: results })
}

// Run scrape
scrapeData()
