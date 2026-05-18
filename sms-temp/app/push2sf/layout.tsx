import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SF Engagement Uploader',
  description: 'Review and upload student engagements to Salesforce',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
