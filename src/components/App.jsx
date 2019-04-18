import React, { useState, useEffect, useReducer } from 'react'
import FramesCatalog from './FramesCatalog'

import { fetchFrames } from '../api'
import * as popup from '../libs/popup'

const ACTION_FETCH_DATA_REQUEST = 'ACTION_FETCH_DATA_REQUEST'
const ACTION_FETCH_DATA_COMPLETE = 'ACTION_FETCH_DATA_COMPLETE'
const ACTION_TOGGLE_FRAME_SELECTION = 'ACTION_TOGGLE_FRAME_SELECTION'

const defaultState = {
	isLoading: true,
	frames: [],
	taskTitle: 'Frames Demo APP',
	taskId: null,
	startFrame: null,
}

const catalogReducer = (state, { type, payload }) => {
	if (type === ACTION_FETCH_DATA_REQUEST) {
		return {
			...state,
			isLoading: true,
		}
	}

	if (type === ACTION_FETCH_DATA_COMPLETE) {
		return {
			...state,
			...payload,
			isLoading: false,
		}
	}

	if (type === ACTION_TOGGLE_FRAME_SELECTION) {
		let { startAt = null, endTo = null, markFlag } = payload || {}
		const swapSelection =
			startAt === null && endTo === null ? null : startAt > endTo

		if (swapSelection) {
			;[startAt, endTo] = [endTo, startAt]
		}

		return {
			...state,
			frames: state.frames.map(frame => {
				const frameNotInRange =
					swapSelection !== null && !(frame.id >= startAt && frame.id <= endTo)

				if (frameNotInRange) {
					return frame
				}

				frame.marked = markFlag

				return frame
			}),
		}
	}

	return state
}

const App = () => {
	const [catalog, dispatch] = useReducer(catalogReducer, defaultState)

	const [selection, toggleSelection] = useState({
		markFlag: null,
		startAt: null,
	})

	const [fromFrame, setStartFrame] = useState(null)
	const [totalItems, setTotalItems] = useState(null)

	useEffect(() => {
		const bootstrapData = async () => {
			dispatch({
				type: ACTION_FETCH_DATA_REQUEST,
			})

			const data = await fetchFrames()

			dispatch({
				type: ACTION_FETCH_DATA_COMPLETE,
				payload: data,
			})

			document.title = data.taskTitle
		}

		bootstrapData()
	}, [])

	const toggleAllSelection = markFlag => {
		dispatch({
			type: ACTION_TOGGLE_FRAME_SELECTION,
			payload: { markFlag },
		})
	}

	const manualFrameSelection = (event, frame, idx) => {
		event.preventDefault()

		if (selection.startAt === null) {
			const markFlag = event.type === 'click'
			toggleSelection({
				markFlag,
				startAt: frame.id,
			})

			return
		}

		dispatch({
			type: ACTION_TOGGLE_FRAME_SELECTION,
			payload: {
				startAt: selection.startAt,
				endTo: frame.id,
				markFlag: selection.markFlag,
			},
		})

		toggleSelection({
			markFlag: null,
			startAt: null,
		})
	}

	const loadingElement = (
		<div
			style={{
				position: 'absolute',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
			}}
		>
			<div
				className="spinner-border spinner-border-sm"
				style={{
					width: '3em',
					height: '3em',
				}}
				role="status"
			>
				<span className="sr-only">Loading...</span>
			</div>
		</div>
	)

	const pageFrames = catalog.frames.filter(frame => {
		if (totalItems === null) {
			return true
		}

		const toFrame = (fromFrame || 0) + totalItems
		return frame.id >= (fromFrame || 0) && frame.id <= toFrame
	})

	const isLast =
		catalog.frames &&
		catalog.frames.length > 0 &&
		pageFrames[pageFrames.length - 1].id ===
			catalog.frames[catalog.frames.length - 1].id

	const totalPages =
		pageFrames.length && totalItems
			? Math.ceil(pageFrames.length / totalItems)
			: 0

	const currentPage =
		pageFrames.length && totalItems ? Math.ceil(fromFrame / totalItems) : 0

	return catalog.isLoading ? (
		loadingElement
	) : (
		<React.Fragment>
			<nav className="navbar navbar-light bg-light mb-3">
				<a className="navbar-brand mx-auto" href="/">
					{catalog.taskTitle}
				</a>
			</nav>

			<FramesCatalog
				onPopupOpen={popup.open}
				onChangePreview={popup.changeLocation}
				toggleAllSelection={toggleAllSelection}
				frames={pageFrames}
				className="container-fluid"
				onFrameClick={manualFrameSelection}
				onCapacityChange={setTotalItems}
				onNextPage={setStartFrame}
				isLast={isLast}
				onSave={data => console.log(JSON.stringify(catalog.frames))}
				totalPages={totalPages}
				currentPage={currentPage}
			/>
		</React.Fragment>
	)
}

export default App
