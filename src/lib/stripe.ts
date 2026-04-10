import Stripe from "stripe";

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_KEY) {
  throw new Error("FATAL ERROR: STRIPE_SECRET_KEY não está definido.");
}

export const stripe = new Stripe(STRIPE_KEY);