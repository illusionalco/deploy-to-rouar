export default defineNuxtConfig({
	compatibilityDate: '2026-10-01',
	modules: ['@rouar/sdk/nuxt'],
	rouar: { authorize: '~~/server/rouar-authorize' },
	app: {
		head: {
			title: 'deploy-to-rouar',
			htmlAttrs: { lang: 'en' },
		},
	},
});
