;(async () => {
	// table rendering logic
	const { optimaData } = await browser.storage.local.get('optimaData')
	const data = optimaData || []

	const tbody = document.querySelector('#results tbody')
	const headers = document.querySelectorAll('#results th')

	let currentSort = { key: 'todo', direction: 'asc' }

	if (data.length === 0) {
		tbody.innerHTML =
			'<tr><td colspan="4">No data found. Open your Optima dashboard first!</td></tr>'
		return
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
	const toggleBtn = document.getElementById('toggleWidgets')
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
	}
})()
