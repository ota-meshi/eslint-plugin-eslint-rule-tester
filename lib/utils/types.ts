import type * as ESTree from 'estree';

export type ResolvedExpression = {
	node: ESTree.Expression;
	imports: Map<string, string>;
};
export interface ConfigAST extends Record<string, ResolvedExpression | undefined> {
	filename?: ResolvedExpression;
	options?: ResolvedExpression;
	languageOptions?: ResolvedExpression;
	settings?: ResolvedExpression;
}
export interface Config extends Record<string, unknown> {
	code: string;
	output?: string;
	filename?: string;
	options?: unknown[];
	languageOptions?: unknown;
	settings?: Record<string, unknown>;
	$$ast: ConfigAST;
	$$constructorAst?: ResolvedExpression;
}
export interface RuleTesterConfig extends Record<string, unknown> {
	ast: ConfigAST;
}
export type LinterWorkerService = {
	getLinterResult: (config: Config) => Messages | null;
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
export type WorkerService = {
	call: (ruleName: string, rulePath: string, config: Config) => Messages;
	terminate: () => void;
	isTs: boolean;
};

export type Operations<N extends ESTree.Node, R> = {
	[key in N['type']]: N extends { type: key } ? (node: N) => R : never;
};

export type Evaluated<T = unknown> = {
	value: T;
};
