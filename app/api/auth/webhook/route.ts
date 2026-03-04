import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { generateApiKey } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
  // Get the Svix headers for verification
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return new Response('Webhook secret not configured', { status: 500 });
  const wh = new Webhook(secret);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    logger.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    try {
      // Get primary email
      const primaryEmail = email_addresses.find((email: any) => email.id === evt.data.primary_email_address_id);
      const email = primaryEmail?.email_address || email_addresses[0]?.email_address;

      if (!email) {
        logger.error('No email found for user:', id);
        return new Response('No email found', { status: 400 });
      }

      // Generate API key
      const apiKey = generateApiKey();

      // Create user in database
      await prisma.user.create({
        data: {
          clerkId: id,
          email,
          name: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || null,
          imageUrl: image_url,
          emailVerified: true, // Clerk verifies emails
          apiKey,
          role: 'USER',
          plan: 'FREE',
          status: 'ACTIVE',
        },
      });

      logger.log('User created in database:', email);
    } catch (error: any) {
      logger.error('Error creating user:', error);
      // If user already exists, try to update
      if (error.code === 'P2002') {
        try {
          const primaryEmail = email_addresses.find((email: any) => email.id === evt.data.primary_email_address_id);
          const email = primaryEmail?.email_address || email_addresses[0]?.email_address;

          await prisma.user.update({
            where: { email },
            data: {
              clerkId: id,
              imageUrl: image_url,
              emailVerified: true,
            },
          });
        } catch (updateError) {
          logger.error('Error updating user:', updateError);
        }
      }
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    try {
      const primaryEmail = email_addresses.find((email: any) => email.id === evt.data.primary_email_address_id);
      const email = primaryEmail?.email_address || email_addresses[0]?.email_address;

      if (!email) {
        return new Response('No email found', { status: 400 });
      }

      // Update user in database
      await prisma.user.updateMany({
        where: { clerkId: id },
        data: {
          email,
          name: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || null,
          imageUrl: image_url,
          emailVerified: true,
        },
      });
    } catch (error) {
      logger.error('Error updating user:', error);
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      // Soft delete user
      await prisma.user.updateMany({
        where: { clerkId: id },
        data: {
          status: 'DELETED',
        },
      });
    } catch (error) {
      logger.error('Error deleting user:', error);
    }
  }

  return new Response('', { status: 200 });
}
