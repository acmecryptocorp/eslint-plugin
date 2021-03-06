// @flow

import path from 'path';

import {
  isObjectTypeAnnotation,
  isDeclareClass,
  isDeclareInterface,
  isInterfaceDeclaration,
  isInterfaceTypeAnnotation,
} from '@babel/types';
import type {
  RuleMetaType,
  RuleObjectType,
  TestObjectType,
  ContextType,
  VisitorType,
} from 'eslint';

import type { RuleBundleType } from '../../types/index.flow';

import getAssertions from './assertions';

const ruleName: string = path.basename(__dirname);
const meta: RuleMetaType = {
  messages: {
    [ruleName]: 'Object must be explicitly exact or inexact',
  },
  type: 'problem',
  docs: {
    description: '', // TODO
    recommended: true,
    // TODO url
  },
  fixable: 'code',
};

// const doc: DocType = {}; // TODO
const assertions: TestObjectType = getAssertions(ruleName);

const mustBeExact = (
  node: BabelNodeObjectTypeAnnotation,
  parent: BabelNode,
): boolean =>
  node.properties.length > 0 &&
  !(
    isDeclareClass(parent) ||
    isDeclareInterface(parent) ||
    isInterfaceDeclaration(parent) ||
    isInterfaceTypeAnnotation(parent)
  );

const create = (context: ContextType): VisitorType => ({
  ObjectTypeAnnotation(node: BabelNode) {
    /* istanbul ignore next */
    if (!isObjectTypeAnnotation(node)) {
      return;
    }

    const nodeIsExact: boolean = node.exact != null && node.exact;
    if (nodeIsExact) {
      return;
    }

    const explicitlyInexact: boolean = node.inexact != null && node.inexact;
    if (explicitlyInexact) {
      return;
    }

    const ancestors: $ReadOnlyArray<BabelNode> = context.getAncestors();
    const parent: BabelNode = ancestors[ancestors.length - 1];

    if (!mustBeExact(node, parent)) {
      return;
    }

    context.report({
      node,
      messageId: ruleName,
      loc: node.loc,
    });
  },
});

const ruleObject: RuleObjectType = { meta, create };

export { ruleName, meta, assertions, ruleObject };

export default ({
  ruleName,
  meta,
  // doc,
  assertions,
  ruleObject,
}: RuleBundleType);
