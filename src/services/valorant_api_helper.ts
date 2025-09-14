import { ValorantRankApi, ValorantRankGame, AIOutput } from "../model/interfaces.js";
import { BEANBALLER_API } from "../model/environment.js";

const BEANBALLER_VALORANT_API_BASE = BEANBALLER_API;

async function makeBeanBallerRequest<T>(url: string): Promise<T | null> {
    const headers = {
        Accept: "application/json",
    };

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return (await response.json()) as T;
    } catch (error) {
        console.error("Error making BeanBaller Valorant request:", error);
        return null;
    }
}

function formatValorantRank(game: ValorantRankGame): string {
    return [
        `Match ID: ${game.match_id || "Unknown"}`,
        `Date: ${game.date || "Unknown"}`,
        `Character: ${game.character || "Unknown"}`,
        `Map: ${game.map || "Unknown"}`,
        `RR Change: ${(game.mmr_change_to_last_game > -50 && game.mmr_change_to_last_game < 50) ? game.mmr_change_to_last_game.toString(10) : "Unknown"}`,
        `Rounds Won: ${(game.rounds_won >= 0) ? game.rounds_won.toString(10) : "Unknown"}`,
        `Rounds Lost: ${(game.rounds_lost >= 0) ? game.rounds_lost.toString(10) : "Unknown"}`,
        `Score: ${(game.stats.score >= 0) ? game.stats.score.toString(10) : "Unknown"}`,
        `Kills: ${(game.stats.kills >= 0) ? game.stats.kills.toString(10) : "Unknown"}`,
        `Deaths: ${(game.stats.deaths >= 0) ? game.stats.deaths.toString(10) : "Unknown"}`,
        `Assists: ${(game.stats.assists >= 0) ? game.stats.assists.toString(10) : "Unknown"}`,
        `Body Shots: ${(game.stats.bodyshots >= 0) ? game.stats.bodyshots.toString(10) : "Unknown"}`,
        `Head Shots: ${(game.stats.headshots >= 0) ? game.stats.headshots.toString(10) : "Unknown"}`,
        `Leg Shots: ${(game.stats.legshots >= 0) ? game.stats.legshots.toString(10) : "Unknown"}`,
        `Damage Made: ${(game.stats.damage_made >= 0) ? game.stats.damage_made.toString(10) : "Unknown"}`,
        `Damage Received: ${(game.stats.damage_received >= 0) ? game.stats.damage_received.toString(10) : "Unknown"}`,
        "---",
    ].join("\n");
}

async function getBeanBallerValorantRankHistory(pageNumber: number): Promise<AIOutput> {
    const rankHistoryUrl = `${BEANBALLER_VALORANT_API_BASE}/history?pageLength=${pageNumber}`;
    const rankHistoryData = await makeBeanBallerRequest<ValorantRankApi>(rankHistoryUrl);

    if (!rankHistoryData) {
        return {
            type: "text",
            text: `Failed to retrieve BeanBaller's Valorant rank history data "${rankHistoryData}" with API call ${rankHistoryUrl}`
        };
    }

    const games = rankHistoryData.rank_history || [];
    if (games.length === 0) {
        return {
            type: "text",
            text: "No Valorant rank history data",
        };
    }

    const formattedRankHistory = games.map(formatValorantRank);
    const outputText = `BeanBaller's Valorant rank history data below from last ${pageNumber.toString(10)} games with last evaluated PUUID key of ${rankHistoryData.last_eval_keys.last_eval_key_puuid_match} and last evaluated raw date int key of ${rankHistoryData.last_eval_keys.last_eval_key_raw_date_int.toString(10)}.:\n\n${formattedRankHistory.join("\n")}`;

    return {
        type: "text",
        text: outputText,
    };
}

export { getBeanBallerValorantRankHistory };
