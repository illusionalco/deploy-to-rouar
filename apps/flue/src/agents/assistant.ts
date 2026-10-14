'use agent';
import { useModel } from '@flue/runtime';

export function Assistant() {
	useModel('rouar/qwen-small', { thinkingLevel: 'off' });
	return 'You are a helpful assistant running on rouar. Keep replies short and clear.';
}
