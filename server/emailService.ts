// Resend Email Service for Blueprint Nexus
// Integration: resend connection

import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: connectionSettings.settings.from_email
  };
}

async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

export async function sendDeliveryEmail(
  customerEmail: string, 
  blueprintTitle: string, 
  tier: string, 
  firstName: string = "there"
) {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    
    await client.emails.send({
      from: fromEmail || 'Blueprint Nexus <noreply@blueprintnexus.com>',
      to: customerEmail,
      subject: `Your ${blueprintTitle} Blueprint has arrived!`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1C2B47 0%, #2A3F5F 100%); padding: 30px; border-radius: 12px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Blueprint Nexus</h1>
          </div>
          
          <h2 style="color: #1C2B47;">Hi ${firstName},</h2>
          
          <p style="color: #4A5568; line-height: 1.6;">
            Your <strong>${tier}</strong> guide is ready for action! You can access the full 
            interactive version and download it from your dashboard.
          </p>
          
          <div style="background: #F7FAFC; border-left: 4px solid #1C2B47; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #1C2B47; margin-top: 0;">Your 60-Minute Objective</h3>
            <p style="color: #4A5568; margin-bottom: 0;">
              Most people buy guides and let them sit. Don't be "most people." Open your blueprint, 
              scroll to <strong>Section 5: Immediate Action Item</strong>, and complete that one task right now.
            </p>
          </div>
          
          <p style="color: #4A5568; line-height: 1.6;">
            Building a business is about momentum. You just took the first step—don't stop now.
          </p>
          
          <a href="${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : ''}/dashboard" 
             style="display: inline-block; background: #1C2B47; color: white; padding: 14px 28px; 
                    text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0;">
            Access Your Dashboard
          </a>
          
          <p style="color: #4A5568; line-height: 1.6;">
            To your success,<br/>
            <strong>The Blueprint Nexus Team</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 30px 0;" />
          
          <p style="color: #A0AEC0; font-size: 12px; text-align: center;">
            Synthesized by the Blueprint Nexus AI-Ops Engine using real-time data.<br/>
            © 2026 Blueprint Nexus. All Rights Reserved.
          </p>
        </div>
      `
    });

    console.log(`[Email] Delivery email sent to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send delivery email:', error);
    return false;
  }
}

export async function sendTechStackEmail(
  customerEmail: string, 
  blueprintTitle: string, 
  tier: string
) {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    
    await client.emails.send({
      from: fromEmail || 'Blueprint Nexus <noreply@blueprintnexus.com>',
      to: customerEmail,
      subject: `The tools you need for ${blueprintTitle} scaling`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1C2B47 0%, #2A3F5F 100%); padding: 30px; border-radius: 12px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Blueprint Nexus</h1>
          </div>
          
          <h2 style="color: #1C2B47;">Hi there,</h2>
          
          <p style="color: #4A5568; line-height: 1.6;">
            In <strong>Section 3</strong> of your blueprint, we outlined the High-Leverage Tech Stack.
          </p>
          
          <p style="color: #4A5568; line-height: 1.6;">
            One common mistake entrepreneurs make at the ${tier} level is "tool hoarding." 
            You don't need 20 subscriptions; you need a workflow that talks to itself.
          </p>
          
          <div style="background: #EBF8FF; border-left: 4px solid #3182CE; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #2B6CB0; margin-top: 0;">Pro-Tip for 2026</h3>
            <p style="color: #4A5568; margin-bottom: 0;">
              If you're using the AI-Ops tools we recommended, make sure to connect them via an 
              automation layer like Make.com. It saves an average of 12 hours of manual data entry per week.
            </p>
          </div>
          
          <p style="color: #4A5568; line-height: 1.6;">
            Have questions about a specific tool in your roadmap? Just hit reply. We're here to help 
            you clear the technical hurdles.
          </p>
          
          <p style="color: #4A5568; line-height: 1.6;">
            Best,<br/>
            <strong>The Blueprint Nexus Team</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 30px 0;" />
          
          <p style="color: #A0AEC0; font-size: 12px; text-align: center;">
            © 2026 Blueprint Nexus. All Rights Reserved.
          </p>
        </div>
      `
    });

    console.log(`[Email] Tech stack email sent to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send tech stack email:', error);
    return false;
  }
}

export async function sendLevelUpEmail(
  customerEmail: string, 
  tier: string
) {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    
    const dashboardUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
      : '';
    
    await client.emails.send({
      from: fromEmail || 'Blueprint Nexus <noreply@blueprintnexus.com>',
      to: customerEmail,
      subject: `Ready for the next tier?`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1C2B47 0%, #2A3F5F 100%); padding: 30px; border-radius: 12px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Blueprint Nexus</h1>
          </div>
          
          <h2 style="color: #1C2B47;">Hi there,</h2>
          
          <p style="color: #4A5568; line-height: 1.6;">
            By now, you've had a chance to digest the roadmap for your venture.
          </p>
          
          <p style="color: #4A5568; line-height: 1.6;">
            Business growth isn't a straight line—it's a series of levels. Once you've checked off 
            the milestones in your <strong>${tier}</strong> guide, the challenges change. 
            You move from finding customers to managing scale.
          </p>
          
          <div style="background: #F0FFF4; border: 2px solid #48BB78; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
            <p style="color: #276749; font-size: 18px; font-weight: 600; margin: 0;">
              Use code <span style="background: #276749; color: white; padding: 4px 12px; border-radius: 4px;">SCALEUP20</span> 
              for 20% off your next blueprint
            </p>
          </div>
          
          <a href="${dashboardUrl}/marketplace" 
             style="display: inline-block; background: #1C2B47; color: white; padding: 14px 28px; 
                    text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0;">
            Browse the Blueprint Catalog
          </a>
          
          <p style="color: #4A5568; line-height: 1.6;">
            Keep building,<br/>
            <strong>The Blueprint Nexus Team</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 30px 0;" />
          
          <p style="color: #A0AEC0; font-size: 12px; text-align: center;">
            © 2026 Blueprint Nexus. All Rights Reserved.
          </p>
        </div>
      `
    });

    console.log(`[Email] Level up email sent to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send level up email:', error);
    return false;
  }
}

export async function triggerPostPurchaseSequence(
  customerEmail: string,
  blueprintTitle: string,
  tier: string,
  firstName: string = "there"
) {
  console.log(`[Email] Starting post-purchase sequence for ${customerEmail}`);
  
  await sendDeliveryEmail(customerEmail, blueprintTitle, tier, firstName);
  
  // Note: For production, use a job scheduler like BullMQ
  // These timeouts work for short windows if the process stays alive
  
  // Schedule Day 2 email (24 hours)
  setTimeout(() => {
    sendTechStackEmail(customerEmail, blueprintTitle, tier);
  }, 24 * 60 * 60 * 1000);
  
  // Schedule Day 3 email (72 hours)
  setTimeout(() => {
    sendLevelUpEmail(customerEmail, tier);
  }, 72 * 60 * 60 * 1000);
}
