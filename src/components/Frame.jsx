import React, { useRef, useEffect, useState } from 'react'
import classNames from 'classnames'

const caluclateCardHeight = (cardRef, id = null) => {
	return updateCallback => {
		const cardElement = cardRef.current
		if (!cardElement || !updateCallback || id === null) {
			return
		}
		updateCallback(cardElement.getBoundingClientRect().height, id)
	}
}

const imageGetSize = (src, done) => {
	const loader = document.createElement('IMG')
	loader.onload = event => {
		const { width, height } = event.target
		done({ width, height })
	}

	loader.src = src
}

const Frame = ({
	width = 300,
	url,
	marked,
	top = 0,
	left = 0,
	onHeightChange,
	onClick,
	idx = 0,
	id,
	// onPopupOpen,
	onChangePreview,
}) => {
	const cardStyle = {
		width,
		position: 'absolute',
		cursor: 'pointer',
		top,
		left,
	}

	const [imageSize, setImageSize] = useState({
		width,
		height: 0,
	})

	const cardRef = useRef(null)
	const reCalculate = caluclateCardHeight(cardRef, id)

	useEffect(() => {
		imageGetSize(url, setImageSize)

		reCalculate(onHeightChange)
	}, [width])

	return (
		<div
			className={classNames('card', 'frame', marked && 'border border-primary')}
			style={cardStyle}
			ref={cardRef}
			onClick={onClick}
			onContextMenu={onClick}
			onMouseOver={event => onChangePreview && onChangePreview(url)}
		>
			<img
				src={url}
				onLoad={event => reCalculate(onHeightChange)}
				className="card-img-top"
			/>
			{/* <div className="card-body">
				<div
					onClick={event => {
						onPopupOpen &&
							onPopupOpen(url, {
								width: imageSize.width,
								height: imageSize.height,
							})
						event.stopPropagation()
					}}
					className="btn btn-sm btn-primary btn-block"
				>
					OPEN
				</div>
			</div> */}
		</div>
	)
}

export default Frame
