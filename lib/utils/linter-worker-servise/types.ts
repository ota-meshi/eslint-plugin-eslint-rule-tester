export type AnyConfig = {
	[key in string]: unknown;
};
export interface Config extends AnyConfig {
	code: string;
	output?: string;
	filename?: string;
	options?: unknown[];
	languageOptions?: unknown;
	settings?: Record<string, unknown>;
}
export type LinterWorkerServise = {
	getLinterResule: (config: Config) => Messages | null;
	terminate: () => void;
};
export type Messages = {
	errors: Message[];
	output?: string | null;
};

export type Message = {
	line: number;
	column: number;
	endLine?: number;
	endColumn?: number;
	ruleId: string | null;
	message: string;
	messageId?: string;
	suggestions: Suggestion[];
};

export type Suggestion = {
	desc: string;
	messageId?: string;
	output: string;
};

export type WorkerServise = {
	call: (ruleName: string, rulePath: string, config: Config) => Messages;
	terminate: () => void;
	isTs: boolean;
};
