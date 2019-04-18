let windowInstance = null

export const open = (url, { title = '', width = 640, height = 480 } = {}) => {
	const windowParams = {
		scrollbars: 'yes',
		width,
		height,
		top: (screen.height - height) / 2,
		left: (screen.width - width) / 2,
	}

	console.log(width, height)

	const windowParamsString = Object.entries(windowParams)
		.reduce((result, [key, val]) => [...result, `${key}=${val}`], [])
		.join(', ')
	//'scrollbars=yes, frameWidth=' + w / systemZoom + ', height=' + h / systemZoom + ', top=' + top + ', left=' + left
	const popupWindow = window.open(url, title || url, windowParamsString)
	if (popupWindow) {
		popupWindow.focus()
	}

	windowInstance = popupWindow

	windowInstance.onbeforeunload = () => {
		windowInstance = null
	}

	return popupWindow
}

export const changeLocation = url => {
	if (!windowInstance) {
		return
	}

	windowInstance.location.href = url
}
