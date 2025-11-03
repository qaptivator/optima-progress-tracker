function scrapeData() {
	// i was using "<all_urls>" in the manifest, but i can literally just not use it and restrict it to a certain domain in the manifest
	// currenlty i'm using *://*.optima-osvita.org/*
	/*const allowedHost = 'optima-osvita.org'
	if (window.location.host !== allowedHost) {
		window.__optimaProgress = null
		return
	}*/

	/*const selector =
		'html.yui3-js-enabled body#page-my-index.limitedwidth.format-site.theme-light.sidebar-hidden.path-my.gecko.dir-ltr.lang-uk.yui-skin-sam.yui3-skin-sam.b-optima-osvita-org.pagelayout-mydashboard.course-1.context-210763.theme.jsenabled div#page-wrapper.d-print-block.columns-layout div#page div#page-content.blocks-pre.d-print-block div#region-main-box.region-main section#region-main.region-main-content div aside#block-region-content.block-region section#inst3661.block_completion_progress.block.card.mb-3 div.card-body.p-3 div.card-text.content.mt-3'*/

	// LOL the selector could be made much simpler (used to be #inst3661)
	const selector = '.block_completion_progress > div > div'

	const container = document.querySelector(selector)
	console.log('hi from content', container)
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
	window.__optimaProgress = results
}

;(() => {
	/*if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', scrapeData)
	} else {
		scrapeData()
	}*/
	scrapeData()
})()
