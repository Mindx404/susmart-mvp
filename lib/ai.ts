export interface AnalysisResult {
    score: number
    indicator: 'low' | 'medium' | 'high' | 'critical'
    message: string
}

export async function analyzeCropPhoto(cropName: string): Promise<AnalysisResult> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    let score = Math.floor(Math.random() * 101)

    // Logic: "If the crop name contains 'Demo', return 90 (Critical)."
    if (cropName.toLowerCase().includes('demo')) {
        score = 90
    }

    let indicator: AnalysisResult['indicator'] = 'low'
    let message = 'Your crop status appears healthy.'

    if (score >= 80) {
        indicator = 'critical'
        message = 'Critical drought stress detected! High priority irrigation recommended.'
    } else if (score >= 60) {
        indicator = 'high'
        message = 'Significant drought stress detected. High priority.'
    } else if (score >= 30) {
        indicator = 'medium'
        message = 'Moderate drought stress detected. Monitor closely.'
    }

    return { score, indicator, message }
}

export function calculateRiskScore(imageScore: number, weatherDroughtIndex: number, daysSinceLastWatering: number): number {
    /**
     * RiskScore = (ImageAnalysisScore * 0.6) + (WeatherDroughtIndex * 0.3) + (DaysSinceLastWatering * 0.1).
     * Note: WeatherDroughtIndex and DaysSinceLastWatering should be normalized to 0-100 scales for this formula.
     */
    const score = (imageScore * 0.6) + (weatherDroughtIndex * 0.3) + (daysSinceLastWatering * 2 * 0.1);
    // Assuming daysSinceLastWatering max is ~50 for 100% impact

    return Math.min(100, Math.floor(score))
}
