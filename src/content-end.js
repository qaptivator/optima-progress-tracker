// table ui
function scrapeData() {
	const selector = '.block_optima_indicators__dashboard'
	const container = document.querySelector(selector)
	if (!container) return

	const results = []

	for (const subjectCard of container.querySelectorAll(':scope > div')) {
		const headerLink = subjectCard.querySelector(
			'div.block_optima_indicators__course-header a'
		)
		if (!headerLink) continue
		const name = headerLink.textContent.trim()

		const cellsContainer = subjectCard.querySelector(
			'div.block_optima_indicators__scale'
		)
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

		// before these css classes were different, but in september of 2026 (in my case, 10th grade, and today is 10th of september) they were totally changed and renamed... soo yeah, the old versions of this extension wont work anymore
		// there also used to be this check before for some reason... if (child.tagName !== 'DIV') continue
		// also uhhh if the second semester hasnt hit yet, the total estimated year grade is just the halved grade of the first semester... which probably is wrong, but on another hand, that's just a mathematical mean/average so idc. plus, you'll just look at the first or second semester grade anyway instead of looking at the final one (which for some reason doesn't match with what you have in your final tabel/report card)
		for (const cellsCard of cellsContainer.children) {
			if (cellsCard.classList.contains('block_optima_indicators__section')) {
				const text = cellsCard.textContent.toUpperCase()
				// fun fact, these two pieces of text arent multilingual, so there is no need to add ENG/PL translations :3
				if (text.includes('1 СЕМЕСТР')) currentSemester = 1
				else if (text.includes('2 СЕМЕСТР')) currentSemester = 2
				continue
			} else if (
				cellsCard.classList.contains('block_optima_indicators__cells')
			) {
				for (const cell of cellsCard.children) {
					const cls = cell.classList
					if (getComputedStyle(cell).display === 'none') continue

					const isDone = cls.contains(
						'block_optima_indicators__cell--completed'
					)
					const isTodo = cls.contains('block_optima_indicators__cell--overdue')
					const isAhead = cls.contains('block_optima_indicators__cell--future')

					if (isDone) done++
					else if (isTodo) todo++
					else if (isAhead) ahead++

					// TODO breakdown
					if (isTodo) {
						if (cls.contains('block_optima_indicators__cell--lesson'))
							todoLessons++
						else if (cls.contains('block_optima_indicators__cell--quiz'))
							todoTests++
						else if (cls.contains('block_optima_indicators__cell--assign'))
							todoAssigns++
					}

					// Grade parsing
					if (
						cls.contains('block_optima_indicators__cell--quiz') ||
						cls.contains('block_optima_indicators__cell--assign')
					) {
						const gradeMatch = cell.textContent.match(/(\d+(?:[.,]\d+)?)/)
						if (gradeMatch) {
							const grade = parseFloat(gradeMatch[1].replace(',', '.'))
							if (!isNaN(grade)) {
								if (currentSemester === 1) gradesSem1.push(grade)
								else gradesSem2.push(grade)
							}
						}
					}
				}
				continue
			}
		}

		const avg1 = Math.round(
			gradesSem1.length
				? gradesSem1.reduce((a, b) => a + b, 0) / gradesSem1.length
				: null
		)
		const avg2 = Math.round(
			gradesSem2.length
				? gradesSem2.reduce((a, b) => a + b, 0) / gradesSem2.length
				: null
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
