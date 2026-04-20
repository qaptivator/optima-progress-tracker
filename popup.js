;(async () => {
	// table rendering logic
	const { optimaData } = await browser.storage.local.get('optimaData')
	const data = optimaData || []

	const tbody = document.querySelector('#results tbody')
	const headers = document.querySelectorAll('#results th')
	const copyTableBtn = document.querySelector('#copyTableBtn')
	copyTableBtn.addEventListener('click', copyTable)
	const copyTableBtnIcon = copyTableBtn.innerHTML

	let currentSort = { key: 'todo', direction: 'asc' }

	if (data.length === 0) {
		tbody.innerHTML =
			'<tr><td colspan="4">No data found. Open your Optima dashboard first!</td></tr>'
		return
	}

	function dataTotals() {
		return {
			done: data.reduce((c, v) => c + v.done, 0),
			todo: data.reduce((c, v) => c + v.todo, 0),
			ahead: data.reduce((c, v) => c + v.ahead, 0),
		}
	}

	function renderTable() {
		tbody.innerHTML = ''
		for (const { name, done, todo, ahead } of data) {
			const row = document.createElement('tr')
			row.innerHTML = `
		  <td>${name}</td>
		  <td>${done}</td>
		  <td>${todo}</td>
		  <td>${ahead}</td>
		`
			tbody.appendChild(row)
		}

		const totals = dataTotals()
		const totalRow = document.createElement('tr')
		totalRow.innerHTML = `
		  <td><b>TOTAL</b></td>
		  <td><b>${totals.done}</b></td>
		  <td><b>${totals.todo}</b></td>
		  <td><b>${totals.ahead}</b></td>
		`
		tbody.appendChild(totalRow)
	}

	function copyTable() {
		let plainText = 'Name\tDone\tTodo\tAhead\n'
		let htmlText =
			'<table><tr><th>Name</th><th>Done</th><th>Todo</th><th>Ahead</th></tr>'

		for (const { name, done, todo, ahead } of data) {
			plainText += `${name}\t${done}\t${todo}\t${ahead}\n`
			htmlText += `<tr><td>${name}</td><td>${done}</td><td>${todo}</td><td>${ahead}</td></tr>`
		}

		const totals = dataTotals()
		plainText += `TOTAL\t${totals.done}\t${totals.todo}\t${totals.ahead}\n`
		htmlText += `<tr><td>TOTAL</td><td>${totals.done}</td><td>${totals.todo}</td><td>${totals.ahead}</td></tr></table>`

		const clipboardItem = new ClipboardItem({
			'text/plain': new Blob([plainText], { type: 'text/plain' }),
			'text/html': new Blob([htmlText], { type: 'text/html' }),
		})

		navigator.clipboard
			.write([clipboardItem])
			.then(() => {
				copyTableBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>`
				setTimeout(() => {
					copyTableBtn.innerHTML = copyTableBtnIcon
				}, 1000)
			})
			.catch((err) => {
				copyTableBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`
				setTimeout(() => {
					copyTableBtn.innerHTML = copyTableBtnIcon
				}, 1000)
			})
	}

	function sortData(key) {
		const dir =
			currentSort.key === key && currentSort.direction === 'desc'
				? 'asc'
				: 'desc'
		currentSort = { key, direction: dir }

		data.sort((a, b) => {
			let valA, valB
			switch (key) {
				case 'name':
					valA = a.name.toLowerCase()
					valB = b.name.toLowerCase()
					return dir === 'asc'
						? valA.localeCompare(valB)
						: valB.localeCompare(valA)
				case 'done':
				case 'todo':
				case 'ahead':
					return dir === 'asc' ? a[key] - b[key] : b[key] - a[key]
				default:
					return 0
			}
		})

		const headerKeyMap = { name: 0, done: 1, todo: 2, ahead: 3 }

		headers.forEach((h) => h.classList.remove('sorted-asc', 'sorted-desc'))
		const idx = headerKeyMap[key]
		if (idx >= 0)
			headers[idx].classList.add(dir === 'asc' ? 'sorted-asc' : 'sorted-desc')

		renderTable()
	}

	headers.forEach((th, i) => {
		th.style.cursor = 'pointer'
		th.addEventListener('click', () => {
			switch (i) {
				case 0:
					sortData('name')
					break
				case 1:
					sortData('done')
					break
				case 2:
					sortData('todo')
					break
				case 3:
					sortData('ahead')
					break
			}
		})
	})

	sortData('todo')

	// header ui
	/*const toggleBtn = document.getElementById('toggleWidgets')
	const iconOff = toggleBtn.querySelector('.icon-btn-off')
	const iconOn = toggleBtn.querySelector('.icon-btn-on')

	let widgetsHidden = false

	function updateToggleBtnIcon() {
		if (widgetsHidden) {
			iconOff.classList.add('hidden')
			iconOn.classList.remove('hidden')
		} else {
			iconOff.classList.remove('hidden')
			iconOn.classList.add('hidden')
		}
	}

	;(async () => {
		const result = await browser.storage.local.get('widgetsHidden')
		widgetsHidden = result.widgetsHidden ?? false // default false
		updateToggleBtnIcon()
	})()

	toggleBtn.addEventListener('click', async () => {
		widgetsHidden = !widgetsHidden // flip the variable
		updateToggleBtnIcon()
		await browser.storage.local.set({ widgetsHidden })
	})

	function clearTable() {
		browser.storage.local.remove('optimaData').then(() => {
			renderTable()
		})
	}*/
})()
