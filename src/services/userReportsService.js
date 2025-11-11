// Service for managing user reports (using localStorage for now)
// In production, this would connect to a backend API

const STORAGE_KEY = 'weather_app_user_reports'

export function saveUserReport(report) {
  const reports = getUserReports()
  const newReport = {
    ...report,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    imageData: report.imagePreview, // Store base64 image
  }
  reports.push(newReport)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
  return newReport
}

export function getUserReports() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error loading user reports:', error)
    return []
  }
}

export function deleteUserReport(reportId) {
  const reports = getUserReports()
  const filtered = reports.filter(r => r.id !== reportId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return filtered
}

export function getUserReportsByLocation(lat, lon, radius = 0.1) {
  const reports = getUserReports()
  return reports.filter(report => {
    if (!report.lat || !report.lon) return false
    const latDiff = Math.abs(report.lat - lat)
    const lonDiff = Math.abs(report.lon - lon)
    return latDiff <= radius && lonDiff <= radius
  })
}

