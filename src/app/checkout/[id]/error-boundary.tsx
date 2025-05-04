'use client'
import React from 'react'
import { Button } from '@/components/ui/button'

export default function CheckoutErrorBoundary({
  children
}: {
  children: React.ReactNode
}) {
  const [hasError, setHasError] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Caught in error boundary:', event.error)
      setError(event.error)
      setHasError(true)
      event.preventDefault()
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (hasError) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[50vh]'>
        <div className='p-6 rounded-lg shadow-md w-full max-w-md text-center'>
          <h1 className='text-3xl font-bold mb-4'>Payment Error</h1>
          <p className='text-destructive mb-4'>
            {error?.message || 'There was an error processing your payment.'}
          </p>
          <p className='mb-4'>
            Please try refreshing the page or using a different payment method.
          </p>
          <div className='flex flex-col sm:flex-row gap-2 justify-center'>
            <Button 
              variant='outline' 
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
            <Button 
              variant='default'
              onClick={() => {
                setHasError(false)
                setError(null)
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}