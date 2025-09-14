interface ValorantRankStats {
    score: number;
    kills: number;
    deaths: number;
    assists: number;
    bodyshots: number;
    headshots: number;
    legshots: number;
    damage_made: number;
    damage_received: number;
}

interface ValorantRankGame {
    puuid: string;
    match_id: string;
    raw_date_int: number;
    date: string;
    mmr_change_to_last_game: number;
    map: string;
    character: string;
    stats: ValorantRankStats;
    rounds_won: number;
    rounds_lost: number;
}

interface ValorantRankHistoryLastFetchKeys {
    last_eval_key_puuid_match: string;
    last_eval_key_raw_date_int: number;
}

interface ValorantRankApi {
    rank_history: Array<ValorantRankGame>;
    last_eval_keys: ValorantRankHistoryLastFetchKeys
}

interface AIOutput {
    type: string;
    text: string;
}

export { ValorantRankApi, ValorantRankGame, AIOutput };