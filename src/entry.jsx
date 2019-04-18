import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'

const getRootElement = rootId => {
	const rootElement = document.getElementById(rootId)
	if (rootElement) {
		return rootElement
	}

	const newRootElement = document.createElement('DIV')
	newRootElement.id = rootId
	document.body.appendChild(newRootElement)

	return newRootElement
}

const main = () => ReactDOM.render(<App />, getRootElement('app'))

main()
