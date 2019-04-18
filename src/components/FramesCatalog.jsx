import React, { useReducer, useEffect, useRef } from 'react'
import Frame from './Frame'

const FRAME_WIDTH_DEFAULT = 300
const FRAME_WIDTH_MIN = 150
const FRAME_DEFAULT_GAP = 10

const ACTION_SET_CONTAINER_SIZES = 'ACTION_SET_CONTAINER_SIZES'

const ACTION_SET_FRAME_SIZE = 'ACTION_SET_FRAME_SIZE'
const ACTION_SET_FRAME_HEIGHT = 'ACTION_SET_FRAME_HEIGHT'

const calculateContainerWidth = containerElement => {
	const elementStyle = global.getComputedStyle(containerElement)

	const offset =
		(parseInt(elementStyle.getPropertyValue('padding-left')) || 0) +
		(parseInt(elementStyle.getPropertyValue('padding-right')) || 0)

	return containerElement.clientWidth - offset
}

const calculateWrapperHeight = framesWrapperElement => {
	const { top } = framesWrapperElement.getBoundingClientRect()
	return document.documentElement.clientHeight - top
}

const imageGetSize = (src, done) => {
	const loader = document.createElement('IMG')
	loader.onload = event => {
		const { width, height } = event.target
		done({ width, height })
	}

	loader.src = src
}

const calculateTotalColumns = ({
	frameWidth = FRAME_WIDTH_DEFAULT,
	containerWidth = FRAME_WIDTH_DEFAULT,
} = {}) => {
	if (!containerWidth) {
		return 1
	}

	const containerWidthWithGap = containerWidth - FRAME_DEFAULT_GAP
	const frameWidthWithGap = frameWidth + FRAME_DEFAULT_GAP
	const offset = containerWidthWithGap % frameWidthWithGap
	const totalColumns = (containerWidthWithGap - offset) / frameWidthWithGap

	return totalColumns
}

const calculateTotalRows = ({
	wrapperHeight,
	frameWidth = FRAME_WIDTH_DEFAULT,
	framesHeightMap = {},
}) => {
	const frameHeight = frameWidth * 0.58
	const totalRows = Math.floor(wrapperHeight / frameHeight)

	return totalRows || 1
}

const calculateWrapperWidth = ({ totalColumns = 1, frameWidth } = {}) =>
	(totalColumns || 1) * (frameWidth + FRAME_DEFAULT_GAP) - FRAME_DEFAULT_GAP

function* columnNumbers(
	currentElementIdx = 0,
	currentColumn = 0,
	rowCapacity = 0,
) {
	let elementIdx = currentColumn

	while (elementIdx < currentElementIdx) {
		elementIdx = elementIdx + rowCapacity
		yield elementIdx
	}
}

const calculatePosition = (
	idx,
	{ totalColumns = 1, frameWidth, framesHeightMap = {} } = {},
) => {
	const column = idx % (totalColumns || 1)
	const left = column * (frameWidth + FRAME_DEFAULT_GAP)

	const columnElements =
		totalColumns === 1
			? Object.keys(framesHeightMap).filter(
					item => parseInt(item) <= idx && parseInt(item) !== column,
			  )
			: [...columnNumbers(idx, column, totalColumns)]

	const top = columnElements.reduce((top = 0, currentElementIdx = 0) => {
		if (currentElementIdx === column) {
			return top
		}

		let elementHeight = framesHeightMap[currentElementIdx] || 0
		return top + elementHeight
	}, 0)

	return [top, left]
}

const defaultState = {
	wrapperWidth: null,
	wrapperHeight: null,
	containerWidth: null,
	frameWidth: FRAME_WIDTH_DEFAULT,
	totalColumns: 1,
	totalRows: 1,
	framesHeightMap: {},
}

const reducer = (state, { type, payload }) => {
	if (type === ACTION_SET_CONTAINER_SIZES) {
		const frameWidth =
			state.frameWidth >= payload.containerWidth
				? payload.containerWidth
				: state.frameWidth

		const totalColumns = calculateTotalColumns({
			frameWidth,
			containerWidth: payload.containerWidth,
		})

		const wrapperWidth = calculateWrapperWidth({
			frameWidth,
			totalColumns,
		})

		const totalRows = calculateTotalRows({
			wrapperHeight: payload.wrapperHeight,
			frameWidth,
		})

		return {
			...state,
			...payload,
			frameWidth,
			totalColumns,
			wrapperWidth,
			totalRows,
		}
	}

	if (type === ACTION_SET_FRAME_HEIGHT) {
		const framesHeightMap = {
			...state.framesHeightMap,
			[payload.id]: payload.height,
		}

		const totalRows = calculateTotalRows({
			wrapperHeight: state.wrapperHeight,
			frameWidth: state.frameWidth,
		})

		return {
			...state,
			framesHeightMap,
			totalRows,
		}
	}

	if (type === ACTION_SET_FRAME_SIZE) {
		const totalColumns =
			calculateTotalColumns({
				frameWidth: payload.frameWidth,
				containerWidth: state.containerWidth,
			}) || 1

		const wrapperWidth = calculateWrapperWidth({
			frameWidth: payload.frameWidth,
			totalColumns,
		})

		const totalRows = calculateTotalRows({
			wrapperHeight: state.wrapperHeight,
			frameWidth: payload.frameWidth,
		})

		return {
			...state,
			...payload,
			totalColumns,
			wrapperWidth,
			totalRows,
		}
	}

	return state
}

const FramesCatalog = ({
	className,
	frames = [],
	onFrameClick,
	toggleAllSelection,
	onPopupOpen,
	onChangePreview,
	onCapacityChange,
	onNextPage,
	onSave,
	isLast,
	totalPages,
	currentPage,
}) => {
	const containerRef = useRef(null)
	const framesWrapperRef = useRef(null)
	const [state, dispatch] = useReducer(reducer, defaultState)

	useEffect(() => {
		function syncSizes() {
			if (!containerRef.current) {
				return
			}

			dispatch({
				type: ACTION_SET_CONTAINER_SIZES,
				payload: {
					containerWidth: calculateContainerWidth(containerRef.current),
					wrapperHeight: calculateWrapperHeight(framesWrapperRef.current),
				},
			})
		}

		syncSizes()
		window.addEventListener('resize', syncSizes)
		return () => window.removeEventListener('resize', syncSizes)
	}, [frames.length, frames[0] && frames[0].id])

	useEffect(() => {
		onCapacityChange && onCapacityChange(state.totalRows * state.totalColumns)
	}, [state.totalRows, state.totalColumns, onCapacityChange])

	const containerStyle = {
		position: 'relative',
		margin: '0 auto',
		width: state.wrapperWidth,
		height: state.wrapperHeight,
	}

	const frameHeightChange = (height, id) =>
		dispatch({
			type: ACTION_SET_FRAME_HEIGHT,
			payload: { height: height + FRAME_DEFAULT_GAP, id },
		})

	return (
		<div ref={containerRef} className={className}>
			<div className="card mb-3 p-2">
				<div className="form-inline">
					<div className="form-group mr-auto">
						<label htmlFor={ACTION_SET_FRAME_SIZE}>Change size</label>
						<input
							onChange={event => {
								dispatch({
									type: ACTION_SET_FRAME_SIZE,
									payload: {
										frameWidth: parseInt(event.target.value),
									},
								})
							}}
							min={FRAME_WIDTH_MIN}
							max={state.containerWidth}
							type="range"
							className="custom-range"
							id={ACTION_SET_FRAME_SIZE}
							value={state.frameWidth}
						/>
					</div>
					<div className="mx-auto text-center">
						{currentPage}/{totalPages}
					</div>
					<div className="form-group">
						<button
							onClick={event => toggleAllSelection && toggleAllSelection(true)}
							className="btn btn-primary btn-sm mr-1"
						>
							SELECT ALL
						</button>
						<button
							onClick={event => toggleAllSelection && toggleAllSelection(false)}
							className="btn btn-primary btn-sm mr-1"
						>
							DESELECT ALL
						</button>
						<button
							onClick={event => {
								if (!onPopupOpen || !frames.length) {
									return
								}

								const currentFrame = frames[0]
								imageGetSize(currentFrame.url, sizes => {
									onPopupOpen(currentFrame.url, sizes)
								})
							}}
							className="btn btn-primary btn-sm mr-1"
						>
							PREVIEW
						</button>
						{!isLast && (
							<button
								onClick={() => {
									onNextPage && onNextPage(frames[frames.length - 1].id + 1)
								}}
								className="btn btn-primary btn-sm"
							>
								NEXT
							</button>
						)}

						{isLast && (
							<button onClick={onSave} className="btn btn-primary btn-sm">
								SAVE
							</button>
						)}
					</div>
				</div>
			</div>

			<div className="mx-auto" style={containerStyle} ref={framesWrapperRef}>
				{frames.map((frame, idx) => {
					const [top, left] = calculatePosition(idx, state)

					return (
						<Frame
							onHeightChange={frameHeightChange}
							width={state.frameWidth}
							key={frame.id}
							idx={idx}
							left={left}
							top={top}
							onChangePreview={onChangePreview}
							onClick={event => onFrameClick && onFrameClick(event, frame, idx)}
							{...frame}
						/>
					)
				})}
			</div>
		</div>
	)
}

export default FramesCatalog
