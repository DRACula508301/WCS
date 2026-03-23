import type { VisualizationData } from '../providers/visualization/VisualizationDataProvider'
import { scaleBand, scaleLinear } from 'd3'

interface VisualizationProps {
	data: VisualizationData
	isLoading: boolean
	error: string | null
	includeNAResponses: boolean
	useWeightedPercentages: boolean
	onToggleIncludeNAResponses: () => void
	onToggleUseWeightedPercentages: () => void
}

export default function Visualization({
	data,
	isLoading,
	error,
	includeNAResponses,
	useWeightedPercentages,
	onToggleIncludeNAResponses,
	onToggleUseWeightedPercentages,
}: VisualizationProps) {
	if (isLoading) {
		return <div style={{ padding: '1rem' }}>Loading chart data...</div>
	}

	if (error) {
		return <div style={{ padding: '1rem', color: '#CB181D' }}>{error}</div>
	}

	const hasBars = data.bars.length > 0
	const chartWidth = 940
	const chartHeight = 360
	const margin = { top: 20, right: 16, bottom: 64, left: 52 }
	const plotWidth = chartWidth - margin.left - margin.right
	const plotHeight = chartHeight - margin.top - margin.bottom

	const x0 = scaleBand<string>()
		.domain(data.bars.map((bar) => bar.category))
		.range([0, plotWidth])
		.paddingInner(0.2)
		.paddingOuter(0.05)

	const segmentLabels = Array.from(new Set(data.bars.flatMap((bar) => bar.segments.map((segment) => segment.label))))

	const x1 = scaleBand<string>()
		.domain(segmentLabels)
		.range([0, x0.bandwidth()])
		.padding(0.1)

	const y = scaleLinear().domain([0, 100]).range([plotHeight, 0])

	const yTicks = [0, 20, 40, 60, 80, 100]

	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				border: '1px solid #ddd',
				borderRadius: '8px',
				padding: '1rem',
				backgroundColor: '#fff',
			}}
		>
			<h3 style={{ marginBottom: '0.25rem' }}>{data.title}</h3>
			<div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
				<button type="button" onClick={onToggleIncludeNAResponses} style={{ fontSize: '12px', padding: '0.35rem 0.6rem' }}>
					{includeNAResponses ? 'N/A: Included' : 'N/A: Excluded'}
				</button>
				<button
					type="button"
					onClick={onToggleUseWeightedPercentages}
					style={{ fontSize: '12px', padding: '0.35rem 0.6rem' }}
				>
					{useWeightedPercentages ? 'Percentages: Weighted' : 'Percentages: Unweighted'}
				</button>
			</div>
			<div style={{ color: '#666666', fontSize: '12px', marginBottom: '0.75rem' }}>{data.subtitle}</div>

			{!hasBars ? (
				<div style={{ padding: '1rem 0', color: '#666' }}>Complete your selections to render the bar chart.</div>
			) : (
				<div style={{ width: '100%', border: '1px solid #eee', borderRadius: 6, height: 'clamp(280px, 45vh, 520px)' }}>
					<svg
						width="100%"
						height="100%"
						viewBox={`0 0 ${chartWidth} ${chartHeight}`}
						preserveAspectRatio="xMidYMid meet"
						role="img"
						aria-label="Grouped percentage bar chart"
					>
						<g transform={`translate(${margin.left}, ${margin.top})`}>
							{yTicks.map((tick) => (
								<g key={tick}>
									<line x1={0} x2={plotWidth} y1={y(tick)} y2={y(tick)} stroke="#e9ecef" />
									<text x={-8} y={y(tick)} dy="0.32em" textAnchor="end" fontSize={11} fill="#666">
										{tick}%
									</text>
								</g>
							))}

							{data.bars.map((bar) => {
								const categoryX = x0(bar.category) ?? 0

								return (
									<g key={bar.category} transform={`translate(${categoryX}, 0)`}>
										{bar.segments.map((segment) => {
											const segmentX = x1(segment.label)
											if (segmentX === undefined) {
												return null
											}

											const barHeight = plotHeight - y(segment.percentage)

											return (
												<rect
													key={`${bar.category}-${segment.label}`}
													x={segmentX}
													y={y(segment.percentage)}
													width={x1.bandwidth()}
													height={Math.max(0, barHeight)}
													fill={segment.color}
											>
													<title>{`${bar.category} · ${segment.label}: ${segment.percentage.toFixed(1)}%`}</title>
												</rect>
											)
										})}

										<text
											x={x0.bandwidth() / 2}
											y={plotHeight + 14}
											textAnchor="middle"
											fontSize={11}
											fill="#333"
										>
											{bar.category}
										</text>
										<text
											x={x0.bandwidth() / 2}
											y={Math.max(12, y(bar.percentage) - 6)}
											textAnchor="middle"
											fontSize={11}
											fill="#333"
										>
											{bar.percentage.toFixed(1)}%
										</text>
									</g>
								)
							})}

							<line x1={0} x2={plotWidth} y1={plotHeight} y2={plotHeight} stroke="#999" />
						</g>
					</svg>
				</div>
			)}

			<div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
				{data.legend.map((item) => (
					<div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '12px' }}>
						<span style={{ width: 12, height: 12, backgroundColor: item.color, display: 'inline-block' }} />
						<span>{item.label}</span>
					</div>
				))}
			</div>

			<div style={{ marginTop: '1rem', fontSize: '14px', color: '#444' }}>
				<strong>Question:</strong> {data.questionText}
			</div>
		</div>
	)
}