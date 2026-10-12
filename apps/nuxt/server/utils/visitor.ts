import type { H3Event } from 'h3';

/**
 * Anonymous visitor ids for this test app.
 * Each browser gets a random id in an httpOnly cookie, and the id is used as the rouar principal,
 * so every browser sees only its own conversations. There is no sign-in: anyone who opens the
 * site can talk to the agent, limited only by rouar's per-principal send limits.
 */
export const VISITOR_COOKIE = 'rouar_visitor';

const VISITOR_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Returns the visitor id from the cookie, or creates one and sets the cookie. */
export function ensureVisitorId(event: H3Event): string {
	const current = getCookie(event, VISITOR_COOKIE);
	if (current && VISITOR_ID.test(current)) return current;
	const id = crypto.randomUUID();
	setCookie(event, VISITOR_COOKIE, id, {
		httpOnly: true,
		sameSite: 'lax',
		secure: !import.meta.dev,
		path: '/',
		maxAge: 60 * 60 * 24 * 365,
	});
	return id;
}
