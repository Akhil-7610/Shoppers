import { NextResponse } from 'next/server'

export async function POST() {
  // Return a simple response indicating Stripe is not supported
  return NextResponse.json({
    message: 'Stripe payments are no longer supported',
  }, { status: 404 })
}
