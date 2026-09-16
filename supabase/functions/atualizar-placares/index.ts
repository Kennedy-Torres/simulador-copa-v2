import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const apiToken = Deno.env.get('SPORTS_API_TOKEN') ?? '';
    const response = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
      headers: { 'X-Auth-Token': apiToken }
    });

    if (!response.ok) throw new Error(`Erro na API: ${response.status}`);

    const data = await response.json();
    const matchesApi = data.matches || [];

    let jogosAtualizados = 0;

    for (const match of matchesApi) {
      const golsCasa = match.score?.fullTime?.home ?? null;
      const golsFora = match.score?.fullTime?.away ?? null;

      const { data: updatedRow, error } = await supabase
        .from('matches')
        .update({
          placar_real_a: golsCasa,
          placar_real_b: golsFora,
          status: match.status,
          stage: match.stage,
          time_a: match.homeTeam?.name, // Adicionado para atualizar o nome
          time_b: match.awayTeam?.name  // Adicionado para atualizar o nome
        })
        .eq('api_id', match.id)
        .select();

      if (error) {
        console.error(`Erro ao atualizar o jogo ${match.id}:`, error.message);
      } else if (updatedRow && updatedRow.length > 0) {
        jogosAtualizados++;
      }
    }

    return new Response(JSON.stringify({
      message: `Sincronização concluída! ${jogosAtualizados} placares e nomes foram atualizados.`,
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});