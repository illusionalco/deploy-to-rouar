'use agent';
import { useModel } from '@flue/runtime';

export function Assistant() {
	useModel('rouar/openai/gpt-6-luna');
	return 'You are a helpful assistant running on rouar. Keep replies short and clear.';
}
