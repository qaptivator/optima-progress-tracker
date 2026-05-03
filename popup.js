;(async () => {
	// --- Data & Initialization ---
	const { optimaData, settings } = await browser.storage.local.get([
		'optimaData',
		'settings',
	])
	const rawData = optimaData || []
	let filteredData = [...rawData]

	// Default settings
	const currentSettings = {
		blacklist: '',
		theme: 'system',
		showTotal: true,
		...settings,
	}

	// --- DOM Elements ---
	const table = document.querySelector('#results')
	const thead = table.querySelector('thead tr')
	const tbody = table.querySelector('tbody')
	const copyTableBtn = document.querySelector('#copyTableBtn')
	const copyTableBtnIcon = copyTableBtn.innerHTML

	const navbarMain = document.querySelector('#navbar-main')
	const navbarSettings = document.querySelector('#navbar-settings')
	const viewTable = document.querySelector('#view-table')
	const viewSettings = document.querySelector('#view-settings')

	const settingsBtn = document.querySelector('#settingsBtn')
	const quitBtn = document.querySelector('#quitBtn')
	const closeSettingsBtn = document.querySelector('#closeSettingsBtn')
	const blacklistInput = document.querySelector('#blacklist')
	const themeSelect = document.querySelector('#theme-select')
	const showTotalInput = document.querySelector('#show-total')

	// --- Configuration ---
	// desc for ascending, asc for ascending (idk why)
	const modes = {
		counts: {
			headers: ['Class', 'Done', 'Todo', 'Future'],
			keys: ['name', 'done', 'todo', 'ahead'],
			defaultSort: { key: 'todo', direction: 'desc' },
		},
		todo: {
			headers: ['Class', 'Lesson', 'Test', 'Assign'],
			keys: ['name', 'todoLessons', 'todoTests', 'todoAssigns'],
			defaultSort: { key: 'todoLessons', direction: 'desc' },
		},
		grades: {
			headers: ['Class', 'Sem 1', 'Sem 2', 'Total'],
			keys: ['name', 'avg1', 'avg2', 'avgTotal'],
			defaultSort: { key: 'avgTotal', direction: 'desc' },
		},
	}

	let currentMode = 'counts'
	let currentSort = { ...modes[currentMode].defaultSort }
	const GRADES_FIXED_ROUND = 0
	const FALLBACK_SORT_DIRECTION = 'desc'

	// --- Functions ---

	function applyTheme(theme) {
		const root = document.documentElement
		if (theme === 'system') {
			root.removeAttribute('data-theme')
		} else {
			root.setAttribute('data-theme', theme)
		}
	}

	function applyBlacklist() {
		const lines = currentSettings.blacklist
			.split('\n')
			.map((s) => s.trim())
			.filter((s) => s.length > 0)
		filteredData = rawData.filter(
			(item) => !lines.some((line) => item.name.includes(line))
		)
	}

	function renderHeaders() {
		thead.innerHTML = ''
		const config = modes[currentMode]
		config.headers.forEach((text, i) => {
			const th = document.createElement('th')
			th.textContent = text
			th.style.cursor = 'pointer'
			th.addEventListener('click', () => sortData(config.keys[i], true))

			const key = config.keys[i]
			if (currentSort.key === key) {
				th.classList.add(
					currentSort.direction === 'asc' ? 'sorted-asc' : 'sorted-desc'
				)
			}
			thead.appendChild(th)
		})
	}

	function dataTotals() {
		const config = modes[currentMode]
		const totals = {}
		config.keys.forEach((key) => {
			if (key === 'name') {
				totals[key] = 'TOTAL'
			} else if (currentMode === 'grades') {
				const filtered = filteredData.filter((v) => v[key] > 0)
				totals[key] = filtered.length
					? (
							filtered.reduce((c, v) => c + v[key], 0) / filtered.length
					  ).toFixed(GRADES_FIXED_ROUND)
					: '0.00'
			} else {
				totals[key] = filteredData.reduce((c, v) => c + v[key], 0)
			}
		})
		return totals
	}

	function renderTable() {
		table.className = `mode-${currentMode}`
		renderHeaders()
		tbody.innerHTML = ''

		if (filteredData.length === 0) {
			tbody.innerHTML =
				'<tr><td colspan="4">No data found or all classes blacklisted.</td></tr>'
			return
		}

		const config = modes[currentMode]
		for (const item of filteredData) {
			const row = document.createElement('tr')
			config.keys.forEach((key) => {
				const td = document.createElement('td')
				let val = item[key]
				if (currentMode === 'grades' && key !== 'name') {
					val = val > 0 ? val.toFixed(GRADES_FIXED_ROUND) : '-'
				}
				td.textContent = val
				row.appendChild(td)
			})
			tbody.appendChild(row)
		}

		if (currentSettings.showTotal) {
			const totals = dataTotals()
			const totalRow = document.createElement('tr')
			config.keys.forEach((key) => {
				const td = document.createElement('td')
				let val = totals[key]
				td.innerHTML = `<b>${val}</b>`
				totalRow.appendChild(td)
			})
			tbody.appendChild(totalRow)
		}
	}

	function sortData(key, toggleDirection = false) {
		if (toggleDirection) {
			// toggle if we clicked the same column
			if (currentSort.key === key) {
				currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc'
			} else {
				currentSort = { key, direction: FALLBACK_SORT_DIRECTION }
			}
		}

		filteredData.sort((a, b) => {
			let valA = a[key] ?? ''
			let valB = b[key] ?? ''

			if (key === 'name') {
				valA = valA.toString().toLowerCase()
				valB = valB.toString().toLowerCase()
				return currentSort.direction === 'asc'
					? valA.localeCompare(valB)
					: valB.localeCompare(valA)
			}

			return currentSort.direction === 'asc' ? valA - valB : valB - valA
		})

		renderTable()
	}

	function copyTable() {
		const config = modes[currentMode]
		let plainText = config.headers.join('\t') + '\n'
		let htmlText =
			'<table><tr>' +
			config.headers.map((h) => `<th>${h}</th>`).join('') +
			'</tr>'

		for (const item of filteredData) {
			const rowVals = config.keys.map((key) => {
				let val = item[key]
				if (currentMode === 'grades' && key !== 'name') {
					return val > 0 ? val.toFixed(GRADES_FIXED_ROUND) : '-'
				}
				return val
			})
			plainText += rowVals.join('\t') + '\n'
			htmlText +=
				'<tr>' + rowVals.map((v) => `<td>${v}</td>`).join('') + '</tr>'
		}

		const totals = dataTotals()
		const totalVals = config.keys.map((key) => totals[key])
		plainText += totalVals.join('\t') + '\n'
		htmlText +=
			'<tr>' + totalVals.map((v) => `<td><b>${v}</b></td>`).join('') + '</tr>'
		htmlText += '</table>'

		const clipboardItem = new ClipboardItem({
			'text/plain': new Blob([plainText], { type: 'text/plain' }),
			'text/html': new Blob([htmlText], { type: 'text/html' }),
		})

		navigator.clipboard
			.write([clipboardItem])
			.then(() => {
				const originalText = copyTableBtn.querySelector('span').textContent
				copyTableBtn.querySelector('span').textContent = 'Copied!'
				setTimeout(() => {
					copyTableBtn.querySelector('span').textContent = originalText
				}, 1000)
			})
			.catch(console.error)
	}

	async function saveSettings() {
		currentSettings.blacklist = blacklistInput.value
		currentSettings.theme = themeSelect.value
		currentSettings.showTotal = showTotalInput.checked
		await browser.storage.local.set({ settings: currentSettings })
		applyTheme(currentSettings.theme)
		applyBlacklist()
	}

	function toggleSettings(show) {
		if (show) {
			navbarMain.classList.add('hidden')
			viewTable.classList.add('hidden')
			navbarSettings.classList.remove('hidden')
			viewSettings.classList.remove('hidden')

			// Populate fields
			blacklistInput.value = currentSettings.blacklist
			themeSelect.value = currentSettings.theme
			showTotalInput.checked = currentSettings.showTotal
		} else {
			navbarSettings.classList.add('hidden')
			viewSettings.classList.add('hidden')
			navbarMain.classList.remove('hidden')
			viewTable.classList.remove('hidden')

			saveSettings().then(() => {
				sortData(currentSort.key, false)
			})
		}
	}

	// --- Event Listeners ---
	settingsBtn.addEventListener('click', () => toggleSettings(true))
	closeSettingsBtn.addEventListener('click', () => toggleSettings(false))
	quitBtn.addEventListener('click', () => window.close())

	document.querySelectorAll('input[name="mode"]').forEach((input) => {
		input.addEventListener('change', (e) => {
			currentMode = e.target.value
			currentSort = { ...modes[currentMode].defaultSort }
			sortData(currentSort.key, false)
		})
	})

	copyTableBtn.addEventListener('click', copyTable)

	// --- Initial Setup ---
	applyTheme(currentSettings.theme)
	applyBlacklist()
	sortData(currentSort.key, false)
})()
