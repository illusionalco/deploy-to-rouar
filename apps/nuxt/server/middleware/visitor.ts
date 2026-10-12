// Set the visitor cookie when a page is loaded, before the browser opens a conversation.
// Agent requests do not pass through Nitro on rouar; the authorize function reads the same cookie.
export default defineEventHandler((event) => {
	ensureVisitorId(event);
});
