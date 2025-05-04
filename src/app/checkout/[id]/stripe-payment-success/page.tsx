import { redirect } from 'next/navigation'

export default async function StripePaymentSuccess(props: {
  params: Promise<{id: string}>
}) {
  const params = await props.params
  const { id } = params
  
  // Redirect to the order page since Stripe is no longer supported
  return redirect(`/account/orders/${id}`)
}
