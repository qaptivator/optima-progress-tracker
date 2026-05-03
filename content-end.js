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

		const cellsContainer = card.querySelector('div.barRowCells')
		if (!cellsContainer) continue

		let done = 0,
			todo = 0,
			ahead = 0
		let todoLessons = 0,
			todoTests = 0,
			todoAssigns = 0
		let gradesSem1 = [],
			gradesSem2 = []
		let currentSemester = 1

		for (const child of cellsContainer.children) {
			if (child.classList.contains('completion-progress--section-name')) {
				const text = child.textContent.toUpperCase()
				if (text.includes('1 СЕМЕСТР')) currentSemester = 1
				else if (text.includes('2 СЕМЕСТР')) currentSemester = 2
				continue
			}

			if (child.tagName !== 'DIV') continue

			const bar = child
			const cls = bar.classList
			if (getComputedStyle(bar).display === 'none') continue

			const isDone = cls.contains('completed')
			const isTodo = cls.contains('notCompleted')
			const isAhead = cls.contains('futureNotCompleted')

			if (isDone) done++
			else if (isTodo) todo++
			else if (isAhead) ahead++

			// TODO breakdown
			if (isTodo) {
				if (cls.contains('progressBarCell--lesson')) todoLessons++
				else if (cls.contains('progressBarCell--quiz')) todoTests++
				else if (cls.contains('progressBarCell--assign')) todoAssigns++
			}

			// Grade parsing
			if (
				cls.contains('progressBarCell--quiz') ||
				cls.contains('progressBarCell--assign')
			) {
				const gradeMatch = bar.textContent.match(/(\d+(?:[.,]\d+)?)/)
				if (gradeMatch) {
					const grade = parseFloat(gradeMatch[1].replace(',', '.'))
					if (!isNaN(grade)) {
						if (currentSemester === 1) gradesSem1.push(grade)
						else gradesSem2.push(grade)
					}
				}
			}
		}

		const avg1 = Math.round(
			gradesSem1.length
				? gradesSem1.reduce((a, b) => a + b, 0) / gradesSem1.length
				: 0
		)
		const avg2 = Math.round(
			gradesSem2.length
				? gradesSem2.reduce((a, b) => a + b, 0) / gradesSem2.length
				: 0
		)
		const avgTotal = Math.round((avg1 + avg2) / 2)
		/*const allGrades = [...gradesSem1, ...gradesSem2]
		const avgTotal = allGrades.length
			? allGrades.reduce((a, b) => a + b, 0) / allGrades.length
			: 0*/

		results.push({
			name,
			done,
			todo,
			ahead,
			todoLessons,
			todoTests,
			todoAssigns,
			avg1,
			avg2,
			avgTotal,
		})
	}

	results.sort((a, b) => b.todo - a.todo)

	browser.storage.local.set({ optimaData: results })
}

scrapeData()

// navbar ui
/*function updateWidgetVisibility(hidden) {
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
})*/
