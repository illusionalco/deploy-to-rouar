<script setup lang="ts">
import type { FlueConversationMessage } from '@rouar/sdk/vue';

const agent = useAgent('assistant');
const input = ref('');

const busy = computed(() => agent.status === 'submitted' || agent.status === 'streaming');
const visibleMessages = computed(() =>
	agent.messages.filter((message) => message.display === 'visible'),
);

const roleLabel = { user: 'You', assistant: 'Assistant', system: 'System' } as const;

function textOf(message: FlueConversationMessage): string {
	return message.parts
		.map((part) => (part.type === 'text' ? part.text : ''))
		.join('');
}

async function send() {
	const text = input.value.trim();
	if (!text || busy.value) return;
	input.value = '';
	await agent.sendMessage(text);
}
</script>

<template>
	<main>
		<h1>Chat with the assistant</h1>
		<p class="status" role="status">
			Status: <strong>{{ agent.status }}</strong>
			<span v-if="agent.error"> ({{ agent.error.message }})</span>
		</p>
		<ol class="messages" aria-live="polite">
			<li v-for="message in visibleMessages" :key="message.id" :class="message.role">
				<span class="role">{{ roleLabel[message.role] }}</span>
				<p>{{ textOf(message) }}</p>
			</li>
			<li v-if="agent.historyReady && visibleMessages.length === 0" class="empty">
				No messages yet.
			</li>
		</ol>
		<form @submit.prevent="send">
			<label for="message">Message</label>
			<input id="message" v-model="input" autocomplete="off" placeholder="Say hello" />
			<button type="submit" :disabled="busy || !input.trim()">Send</button>
		</form>
	</main>
</template>

<style>
body {
	margin: 0;
	font-family: system-ui, sans-serif;
	background: #fafafa;
	color: #111;
}
main {
	max-width: 40rem;
	margin: 0 auto;
	padding: 1.5rem 1rem;
}
.status {
	color: #555;
}
.messages {
	list-style: none;
	padding: 0;
	display: grid;
	gap: 0.75rem;
}
.messages li {
	padding: 0.75rem;
	border-radius: 0.5rem;
	background: #fff;
	border: 1px solid #ddd;
}
.messages li.user {
	background: #eef4ff;
}
.messages .role {
	font-size: 0.8rem;
	font-weight: 600;
	color: #555;
}
.messages p {
	margin: 0.25rem 0 0;
	white-space: pre-wrap;
}
.messages .empty {
	color: #777;
}
form {
	display: flex;
	gap: 0.5rem;
	align-items: center;
}
form label {
	position: absolute;
	width: 1px;
	height: 1px;
	overflow: hidden;
	clip: rect(0 0 0 0);
}
form input {
	flex: 1;
	padding: 0.5rem;
	font: inherit;
}
form button {
	padding: 0.5rem 1rem;
	font: inherit;
}
</style>
