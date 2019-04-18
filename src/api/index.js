export const ENDPOINT_FRAMES_DATA =
	'https://s3-eu-west-1.amazonaws.com/poteha-job-interview-uploads/f98f8e9a-24d0-4c2c-a481-bcfd15c140d4/task.json'

export const camelCased = inputString =>
	inputString.replace(/_([a-z])/g, ([_, letter]) => letter.toUpperCase())

export const convertData = data =>
	Object.entries(data).reduce(
		(result, [key, value]) => ({
			...result,
			[camelCased(key)]: value,
		}),
		{},
	)

export const fetchFramesRemote = () =>
	fetch(ENDPOINT_FRAMES_DATA)
		.then(res => res.json())
		.then(convertData)

export const fetchFrames = () => import('../task.json').then(convertData)
