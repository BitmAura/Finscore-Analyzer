import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Simple database test...')
    
    // Try to find mock data directly
    const mockUsers = [
      {
        id: 'user_001',
        email: 'admin@finscore.com',
        name: 'FinScore Admin',
        password_hash: '$2a$12$LQv3c1yqBw2XYVOp.5dBhuQs6.vH3OZm2KOTmF9UJ/Xs8J6KZyDJW', // admin123
        role: 'admin'
      }
    ];
    
    const user = mockUsers.find(u => u.email === 'admin@finscore.com');
    console.log('🔍 Found user:', user);
    
    return NextResponse.json({
      success: true,
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasPasswordHash: !!user.password_hash
      } : null,
      databaseMode: process.env.DATABASE_MODE || 'mock'
    })
  } catch (error) {
    console.error('🔍 Database test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}