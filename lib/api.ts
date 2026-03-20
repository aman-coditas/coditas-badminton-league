import axios from "axios";

const GAS_MAIN_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type RegistrationPayload = Record<string, string>;

export interface RegistrationResponse {
  success: boolean;
  message: string;
  data: {
    teamName: string;
    stats: {
      totalTeams: number;
      registeredTeams: number;
      availableTeams: number;
    };
  };
}

export interface TeamPlayer {
  name: string;
  email: string;
  contactNumber?: string;
}

export interface Team {
  teamName: string;
  players: TeamPlayer[];
}

export interface IndividualPlayer {
  name: string;
  email: string;
  contactNumber?: string;
  gender: string;
  jerseyNumber: number;
  jerseyName: string;
}

export const registerTeam = async (
  payload: RegistrationPayload
): Promise<RegistrationResponse> => {
  try {
    const response = await axios.post<RegistrationResponse>(GAS_MAIN_URL, payload, {
      headers: { "Content-Type": "text/plain" },
    });
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw new Error("Failed to register team. Please try again.");
  }
};

export const registerIndividual = async (
  payload: RegistrationPayload
): Promise<RegistrationResponse> => {
  try {
    const response = await axios.post<RegistrationResponse>(GAS_MAIN_URL, payload, {
      headers: { "Content-Type": "text/plain" },
    });
    return response.data;
  } catch (error) {
    console.error("Individual registration error:", error);
    throw new Error("Failed to register individual. Please try again.");
  }
};

export const fetchTeams = async (): Promise<Team[]> => {
  try {
    const cache_bust = Date.now();
    const response = await axios.get<{
      success: boolean;
      totalTeams: number;
      teams: Team[];
      isRegistrationClosed?: boolean;
    }>(`${GAS_MAIN_URL}?action=teams&_ts=${cache_bust}`);

    if (response.data.success && Array.isArray(response.data.teams)) {
      return response.data.teams;
    }
    throw new Error("Failed to fetch teams");
  } catch (error) {
    console.error("Fetch teams error:", error);
    throw new Error("Failed to fetch teams. Please try again.");
  }
};

export const fetchIndividuals = async (): Promise<IndividualPlayer[]> => {
  try {
    const cache_bust = Date.now();
    const response = await axios.get<{
      success: boolean;
      totalIndividuals: number;
      individuals: IndividualPlayer[];
      isRegistrationClosed?: boolean;
    }>(`${GAS_MAIN_URL}?action=individuals&_ts=${cache_bust}`);

    if (response.data.success && Array.isArray(response.data.individuals)) {
      return response.data.individuals;
    }
    throw new Error("Failed to fetch individuals");
  } catch (error) {
    console.error("Fetch individuals error:", error);
    throw new Error("Failed to fetch individual players. Please try again.");
  }
};

type RegistrationClosedCache = { value: boolean; fetchedAtMs: number };
let registration_closed_cache: RegistrationClosedCache | null = null;
let registration_closed_in_flight: Promise<boolean> | null = null;
const registration_closed_storage_key_v2 = "cbl:isRegistrationClosed:v2";
const registration_closed_storage_key_v1 = "cbl:isRegistrationClosed";

function read_registration_closed_from_storage(): RegistrationClosedCache | null {
  if (typeof window === "undefined") return null;

  try {
    const raw_v2 = window.localStorage.getItem(registration_closed_storage_key_v2);
    if (raw_v2) {
      const parsed = JSON.parse(raw_v2) as Partial<RegistrationClosedCache> | null;
      if (parsed && typeof parsed.value === "boolean" && typeof parsed.fetchedAtMs === "number") return parsed as RegistrationClosedCache;
    }
  } catch {
    // ignore
  }

  try {
    const raw_v1 = window.localStorage.getItem(registration_closed_storage_key_v1);
    if (raw_v1 === "true") return { value: true, fetchedAtMs: 0 };
    if (raw_v1 === "false") return { value: false, fetchedAtMs: 0 };
  } catch {
    // ignore
  }

  return null;
}

function write_registration_closed_to_storage(cache: RegistrationClosedCache) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(registration_closed_storage_key_v2, JSON.stringify(cache));
    window.localStorage.setItem(registration_closed_storage_key_v1, String(cache.value));
  } catch {
    // ignore
  }
}

const MAX_TEAMS = 32;

async function fetch_is_registration_closed_uncached(): Promise<boolean> {
  const cache_bust = Date.now();
  const response = await axios.get<{
    success: boolean;
    teams?: Team[];
    isRegistrationClosed?: boolean;
  }>(`${GAS_MAIN_URL}?action=teams&_ts=${cache_bust}`);

  if (!response.data?.success) return false;

  // Check if API says closed OR if we have 32+ teams
  if (response.data.isRegistrationClosed === true) return true;
  if (Array.isArray(response.data.teams) && response.data.teams.length >= MAX_TEAMS) return true;

  return false;
}

export const fetchIsRegistrationClosed = async (): Promise<boolean> => {
  try {
    return await fetch_is_registration_closed_uncached();
  } catch (error) {
    console.error("Fetch registration status error:", error);
    return false;
  }
};

export const fetchIsRegistrationClosedCached = async ({
  maxAgeMs = 120_000,
}: {
  maxAgeMs?: number;
} = {}): Promise<boolean> => {
  const now = Date.now();
  if (registration_closed_cache && now - registration_closed_cache.fetchedAtMs < maxAgeMs) return registration_closed_cache.value;

  const stored = read_registration_closed_from_storage();
  if (!registration_closed_cache && stored && now - stored.fetchedAtMs < maxAgeMs) {
    registration_closed_cache = stored;
    return stored.value;
  }

  if (registration_closed_in_flight) return registration_closed_in_flight;

  registration_closed_in_flight = (async () => {
    try {
      const value = await fetch_is_registration_closed_uncached();
      const next = { value, fetchedAtMs: Date.now() } satisfies RegistrationClosedCache;
      registration_closed_cache = next;
      write_registration_closed_to_storage(next);
      return value;
    } finally {
      registration_closed_in_flight = null;
    }
  })();

  return registration_closed_in_flight;
};

export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
