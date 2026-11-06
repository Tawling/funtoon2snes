// The FUNtoon server this build talks to, chosen at build time with
// REACT_APP_FUNTOON_SERVER:
//
//  - "legacy" (the default): the original FUNtoon server at funtoon.party.
//    `npm run build` / `bd` / `bid` build this, exactly as before.
//  - "fun2n": the new FUNtoon server.  `npm run build:fun2n` builds it into
//    build-fun2n/.  The new server hosts the build itself, so every URL is
//    relative to wherever it's served (beta.funtoon.party now, funtoon.party
//    after the switch-over) and needs no CORS.
//
// Everything that differs between the two servers lives here.  This module
// runs in both the page and the connection worker.

export const SERVER = process.env.REACT_APP_FUNTOON_SERVER === "fun2n" ? "fun2n" : "legacy";

const LEGACY_BASE = "https://funtoon.party";

// localStorage key for the API token.  The servers' tokens aren't
// interchangeable, and once the fun2n build replaces the legacy one at
// funtoon.party it would otherwise read the legacy token saved there and fail
// quietly; a new key makes it ask for a new token instead.  Other settings
// (channel, modules) carry over.
export const TOKEN_STORAGE_KEY = SERVER === "fun2n" ? "fun2nAPIToken" : "funtoonAPIToken";

/**
 * Check a channel + token pair.  Resolves to `{ valid, overlayToken }`;
 * `overlayToken` is what the overlay URL carries (on fun2n, the channel's
 * listen-only token, so a URL pasted into OBS can't send events).
 */
export async function validateToken(token, channel) {
    try {
        if (SERVER === "fun2n") {
            const res = await fetch(`/api/events/custom/check/?channel=${encodeURIComponent(channel)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                return { valid: false, overlayToken: null };
            }
            const body = await res.json();
            return { valid: true, overlayToken: body.listenToken };
        }
        const res = await fetch(`${LEGACY_BASE}/api/token/validate`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: token },
            body: JSON.stringify({ channel }),
        });
        return { valid: res.ok, overlayToken: token };
    } catch (e) {
        return { valid: false, overlayToken: null };
    }
}

/** Send a custom event to the channel's scripts (and its overlay). */
export function sendEvent(token, channel, event, data) {
    if (SERVER === "fun2n") {
        return fetch("/api/events/custom/", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ channel, event: { event, data } }),
        });
    }
    return fetch(`${LEGACY_BASE}/api/events/custom`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ channel, event, data }),
    });
}

/** The room-time overlay's URL, for an OBS browser source. */
export function overlayURL(channel, overlayToken) {
    const query = `channel=${encodeURIComponent(channel.toLowerCase())}&token=${encodeURIComponent(overlayToken || "")}`;
    if (SERVER === "fun2n") {
        // Shipped with this build (overlay/tracking.html), next to index.html.
        return new URL(`tracking.html?${query}`, window.location.href).toString();
    }
    return `${LEGACY_BASE}/tracking.html?${query}`;
}

/** Where the user gets their API token: `{ href, label }`. */
export function tokenPageLink(channel) {
    const login = channel.toLowerCase();
    if (SERVER === "fun2n") {
        const href = new URL(`/c/${login}/integrations`, window.location.href).toString();
        return { href, label: `${window.location.host}/c/${login}/integrations` };
    }
    return { href: `${LEGACY_BASE}/c/${login}/script`, label: `funtoon.party/c/${login}/script` };
}
