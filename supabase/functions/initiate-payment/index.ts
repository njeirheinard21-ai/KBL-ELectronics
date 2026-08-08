import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// TODO: Set up Campay or Notch Pay credentials in Supabase secrets
// const CAMPAY_API_KEY = Deno.env.get("CAMPAY_API_KEY");
// const CAMPAY_SECRET = Deno.env.get("CAMPAY_SECRET");

interface PaymentRequest {
  order_id: string;
  method: "mtn_momo" | "orange_money" | "card" | "bank_transfer" | "cash_on_delivery";
  phone?: string;
  amount_xaf: number;
}

serve(async (req) => {
  // CORS Headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);

    // Payment Status Polling endpoint
    // e.g. /functions/v1/initiate-payment/status?ref=...
    if (url.pathname.endsWith("/status")) {
      const ref = url.searchParams.get("ref");
      
      if (!ref) {
        return new Response(JSON.stringify({ error: "Missing ref parameter" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // TODO: Call Campay/Notch Pay to get the status of the transaction
      // Mocked response for now
      return new Response(
        JSON.stringify({
          status: "pending", // "pending" | "successful" | "failed"
          ref,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initiate Payment Endpoint
    const _body = (await req.json()) as PaymentRequest;
    
    // TODO: Validate order_id exists, amount matches DB, etc.
    // TODO: Call Campay/Notch Pay to initiate the push request
    
    // Mocked response for now
    const mockRef = `ref_${Math.random().toString(36).substring(7)}`;

    return new Response(
      JSON.stringify({
        success: true,
        ref: mockRef,
        message: "Payment initiated successfully",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
