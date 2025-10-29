import Link from 'next/link';

export default function TestPage() {
  return (
    <html>
      <body style={{ fontFamily: 'Arial', padding: '2rem', background: '#f3f4f6' }}>
        <h1 style={{ color: '#1f2937' }}>🎉 Next.js is Working!</h1>
        <p>This is a standalone test page.</p>
        <Link href="/" style={{ color: '#3b82f6' }}>Back to Home</Link>
      </body>
    </html>
  )
}
