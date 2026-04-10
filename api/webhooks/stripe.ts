import { prisma } from "../../src/lib/prisma";
import Stripe from "stripe";

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_KEY ? new Stripe(STRIPE_KEY) : null;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!stripe) return res.status(400).send("Stripe not configured");
    
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (endpointSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret);
    } else {
      // Fallback para facilitar testes sem a chave do webhook configurada
      event = JSON.parse(req.body.toString());
    }
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.client_reference_id && session.subscription) {
          await prisma.tenant.update({
            where: { id: session.client_reference_id },
            data: {
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              planStatus: 'ACTIVE'
            }
          });
          console.log(`Assinatura ativada para o tenant ${session.client_reference_id}`);
        }
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status === 'active' ? 'ACTIVE' : 
                       subscription.status === 'past_due' ? 'PAST_DUE' : 'CANCELED';
        
        await prisma.tenant.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { planStatus: status }
        });
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.tenant.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { planStatus: 'CANCELED' }
        });
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    res.send();
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Internal Server Error");
  }
}
