import Stripe from "stripe";

export function getStripe() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    throw new Error("STRIPE_SECRET_KEY não está definido.");
  }

  return new Stripe(stripeKey);
}