/**
 * @typedef {'BLOCK' | 'REVIEW'} RiskLevel
 * @typedef {'EXACT' | 'FUZZY'} MatchType
 * 
 * @typedef {Object} SensitiveWordItem
 * @property {string} word - The sensitive word
 * @property {string} category - The category of the word
 * @property {RiskLevel} level - The risk level
 * @property {MatchType} matchType - The matching strategy
 */

/**
 * @typedef {Object} CheckResult
 * @property {boolean} isBlocked - Whether the content should be blocked immediately
 * @property {boolean} needReview - Whether the content needs manual review
 * @property {SensitiveWordItem[]} hitWords - List of sensitive words detected
 * @property {string} sanitizedText - Text with sensitive words replaced (e.g. with ***)
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Sensitive Word Filter Service
 * Implements strict filtering logic based on risk levels and match types.
 */
class SensitiveFilter {
    /**
     * @param {SensitiveWordItem[]} wordList 
     */
    constructor(wordList) {
        /** @type {SensitiveWordItem[]} */
        this.exactWords = [];
        /** @type {SensitiveWordItem[]} */
        this.fuzzyWords = [];

        // Initialize and classify words for performance
        this._classifyWords(wordList);
    }

    /**
     * Internal method to classify words into matching strategies
     * @param {SensitiveWordItem[]} wordList 
     * @returns {void}
     */
    _classifyWords(wordList) {
        for (const item of wordList) {
            if (item.matchType === 'EXACT') {
                this.exactWords.push(item);
            } else {
                this.fuzzyWords.push(item);
            }
        }
    }

    /**
     * Check text for sensitive content
     * @param {string} text - The input text to check
     * @returns {CheckResult} The check result
     */
    check(text) {
        if (!text) {
            return {
                isBlocked: false,
                needReview: false,
                hitWords: [],
                sanitizedText: text
            };
        }

        /** @type {SensitiveWordItem[]} */
        const hits = [];
        let isBlocked = false;
        let needReview = false;
        let sanitized = text;

        // 1. Check Exact Matches (Fast)
        // Optimization: Use Set or Map for O(1) lookups if needed, 
        // but for "includes" check we iterate. 
        // For EXACT match type in this context, it usually means "Whole word match" 
        // or "Short word strict match". 
        // Here we assume "EXACT" means strict substring match but only for short high-risk words
        // to avoid "false positives" like embedded characters. 
        // However, based on the previous plan, EXACT was for short words to prevent "包子" matching "肉包子".
        // Let's implement strict includes for now.
        
        for (const item of this.exactWords) {
            if (text.includes(item.word)) {
                hits.push(item);
                if (item.level === 'BLOCK') isBlocked = true;
                if (item.level === 'REVIEW') needReview = true;
                sanitized = sanitized.replaceAll(item.word, '*'.repeat(item.word.length));
            }
        }

        // 2. Check Fuzzy Matches (Standard)
        if (!isBlocked) {
            for (const item of this.fuzzyWords) {
                if (text.includes(item.word)) {
                    hits.push(item);
                    if (item.level === 'BLOCK') isBlocked = true;
                    if (item.level === 'REVIEW') needReview = true;
                    sanitized = sanitized.replaceAll(item.word, '*'.repeat(item.word.length));
                }
            }
        }

        return {
            isBlocked,
            needReview,
            hitWords: hits,
            sanitizedText: sanitized
        };
    }
}

/**
 * Factory for creating SensitiveFilter instances
 */
export class SensitiveFilterFactory {
    /**
     * Create a filter instance from a JSON file
     * @param {string} filePath - Absolute path to the JSON file
     * @returns {Promise<SensitiveFilter>}
     */
    static async createFromFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            /** @type {SensitiveWordItem[]} */
            const data = JSON.parse(content);
            return new SensitiveFilter(data);
        } catch (error) {
            throw new Error(`Failed to load sensitive words from ${filePath}: ${error.message}`);
        }
    }
}
