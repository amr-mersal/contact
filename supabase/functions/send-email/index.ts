import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { Resend } from "https://esm.sh/resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: { method: string; json: () => PromiseLike<{ name: any; email: any; message: any; }> | { name: any; email: any; message: any; }; }) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, email, message, captchaToken } = await req.json();

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const verifyCaptcha = await fetch(
  "https://challenges.cloudflare.com/turnstile/v0/siteverify",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `secret=${Deno.env.get("TURNSTILE_SECRET_KEY")}&response=${captchaToken}`,
  }
);

const captchaResult = await verifyCaptcha.json();

if (!captchaResult.success) {
  return new Response(
    JSON.stringify({ error: "Captcha verification failed" }),
    { status: 400, headers: corsHeaders }
  );
}
    await resend.emails.send({
      from: "Contact <contact@contact-azure-two.vercel.app>",
      to: ["amrrmersall@gmail.com"], // خلي ده نفس ايميل حسابك لو test
      subject: "New Contact Form Submission",
      html: `
        <h2>New Contact Message</h2>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        
        <hr/>

        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});

