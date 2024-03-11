import type { TSESTree } from '@typescript-eslint/types';
import type { Scope } from 'eslint';
import type { StaticValue } from '../../../node_modules/@types/eslint-utils';
export function findVariable(
	initialScope: Scope.Scope,
	nameOrNode: TSESTree.Identifier | string
): Scope.Variable;

/**
 * Get the property name from a MemberExpression node or a Property node.
 */
export function getPropertyName(
	node:
		| TSESTree.MemberExpression
		| TSESTree.MethodDefinition
		| TSESTree.Property
		| TSESTree.PropertyDefinition,
	initialScope?: Scope.Scope
): string | null;

/**
 * Get the value of a given node if it's a static value.
 * @param node The node to get.
 * @param [initialScope] The scope to start finding variable. Optional. If this scope was given, this tries to resolve identifier references which are in the given node as much as possible.
 * @returns The static value of the node, or `null`.
 */
export function getStaticValue(node: TSESTree.Node, initialScope?: Scope.Scope): StaticValue | null;
