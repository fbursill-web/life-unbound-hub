import React from 'react'

export const metadata = {
  title: 'Life Unbound Support Staff Portal',
  description: 'Internal operational management infrastructure matrix gate.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f8fafc' }}>
        {children}
      </body>
    </html>
  )
}
