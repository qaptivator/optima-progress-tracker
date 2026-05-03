;(async () => {
	// table rendering logic
	const { optimaData } = await browser.storage.local.get('optimaData')
	const data = optimaData || []

	const table = document.querySelector('#results')
	const thead = table.querySelector('thead tr')
	const tbody = table.querySelector('tbody')
	const copyTableBtn = document.querySelector('#copyTableBtn')
	const copyTableBtnIcon = copyTableBtn.innerHTML
	document
		.querySelector('#closeBtn')
		.addEventListener('click', () => window.close())

	// Centralized configuration for all table modes
	// for ascending use desc, for descending use asc (idk why)
	const modes = {
		counts: {
			headers: ['Class', 'Done', 'Todo', 'Future'],
			keys: ['name', 'done', 'todo', 'ahead'],
			defaultSort: { key: 'todo', direction: 'asc' },
		},
		todo: {
			headers: ['Class', 'Lesson', 'Test', 'Assign'],
			keys: ['name', 'todoLessons', 'todoTests', 'todoAssigns'],
			defaultSort: { key: 'todoLessons', direction: 'asc' },
		},
		grades: {
			headers: ['Class', 'Sem 1', 'Sem 2', 'Total'],
			keys: ['name', 'avg1', 'avg2', 'avgTotal'],
			defaultSort: { key: 'avgTotal', direction: 'asc' },
		},
	}

	let currentMode = 'counts'
	let currentSort = { ...modes[currentMode].defaultSort }

	if (data.length === 0) {
		tbody.innerHTML =
			'<tr><td colspan="4">No data found. Open your Optima dashboard first!</td></tr>'
		return
	}

	function renderHeaders() {
		thead.innerHTML = ''
		const config = modes[currentMode]
		config.headers.forEach((text, i) => {
			const th = document.createElement('th')
			th.textContent = text
			th.style.cursor = 'pointer'
			th.addEventListener('click', () => sortData(config.keys[i]))

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
				const filtered = data.filter((v) => v[key] > 0)
				totals[key] = filtered.length
					? (
							filtered.reduce((c, v) => c + v[key], 0) / filtered.length
					  ).toFixed(2)
					: '0.00'
			} else {
				totals[key] = data.reduce((c, v) => c + v[key], 0)
			}
		})
		return totals
	}

	function renderTable() {
		table.className = `mode-${currentMode}`
		renderHeaders()
		tbody.innerHTML = ''
		const config = modes[currentMode]

		for (const item of data) {
			const row = document.createElement('tr')
			config.keys.forEach((key) => {
				const td = document.createElement('td')
				let val = item[key]
				if (currentMode === 'grades' && key !== 'name') {
					val = val > 0 ? val.toFixed(2) : '-'
				}
				td.textContent = val
				row.appendChild(td)
			})
			tbody.appendChild(row)
		}

		const totals = dataTotals()
		const totalRow = document.createElement('tr')
		config.keys.forEach((key) => {
			const td = document.createElement('td')
			let val = totals[key]
			if (key === 'name') {
				td.innerHTML = `<b>${val}</b>`
			} else {
				td.innerHTML = `<b>${val}</b>`
			}
			totalRow.appendChild(td)
		})
		tbody.appendChild(totalRow)
	}

	function sortData(key) {
		// Toggle direction if same key, otherwise default to descending for new keys
		if (currentSort.key === key) {
			currentSort.direction = currentSort.direction === 'desc' ? 'asc' : 'desc'
		} else {
			currentSort = { key, direction: 'desc' }
		}

		data.sort((a, b) => {
			let valA = a[key]
			let valB = b[key]

			if (key === 'name') {
				valA = (valA || '').toLowerCase()
				valB = (valB || '').toLowerCase()
				return currentSort.direction === 'asc'
					? valA.localeCompare(valB)
					: valB.localeCompare(valA)
			} else {
				return currentSort.direction === 'asc' ? valA - valB : valB - valA
			}
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

		for (const item of data) {
			const rowVals = config.keys.map((key) => {
				let val = item[key]
				if (currentMode === 'grades' && key !== 'name') {
					return val > 0 ? val.toFixed(2) : '-'
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
				copyTableBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>`
				setTimeout(() => {
					copyTableBtn.innerHTML = copyTableBtnIcon
				}, 1000)
			})
			.catch((err) => {
				copyTableBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`
				setTimeout(() => {
					copyTableBtn.innerHTML = copyTableBtnIcon
				}, 1000)
			})
	}

	// Event Listeners for Mode Switch
	document.querySelectorAll('input[name="mode"]').forEach((input) => {
		input.addEventListener('change', (e) => {
			currentMode = e.target.value
			currentSort = { ...modes[currentMode].defaultSort }
			sortData(currentSort.key)
		})
	})

	copyTableBtn.addEventListener('click', copyTable)

	// Initial Render
	sortData(currentSort.key)
})()
