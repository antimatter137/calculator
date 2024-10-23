import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = 'https://ibkyruibxpagxwawgybn.supabase.co';
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabaseClient = createClient(supabaseUrl, supabaseKey);

async function insertVisitorData(visitorId: string, platform: string, webgl: string, ipAddress: string, timezone: string) {
    const { data, error } = await supabaseClient
        .from('calculator')
        .insert([{ visitor_id: visitorId, browser: platform, os: webgl, ip: ipAddress, timezone: timezone }]);

    if (error) {
        console.error('Error inserting visitor data:', error);
        return { error };
    }
    return { data };
}

serve(async (req: Request) => {
    try {
        const { visitorId, platform, webgl, ipAddress, timezone } = await req.json();
        const result = await insertVisitorData(visitorId, platform, webgl, ipAddress, timezone);
        return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 500,
        });
    }
});
