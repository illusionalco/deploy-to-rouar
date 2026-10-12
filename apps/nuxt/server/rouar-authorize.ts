// Lets browsers call the agent without an access token.
// For testing only: every visitor is allowed, identified by the random id in their cookie.
export default defineRouarAuthorize((event) => ({
	principal: `visitor:${ensureVisitorId(event)}`,
}));
