import * as borsh from 'borsh';
import type { AccountInfo } from '@solana/web3.js';

/**
 * The state of a greeting account managed by the hello world program
 */
class GreetingAccount {
    counter = 0;
    constructor(fields: { counter: number } | undefined = undefined) {
        if (fields) {
            this.counter = fields.counter;
        }
    }
}
/**
 * Borsh schema definition for greeting accounts
 */
const GreetingSchema = new Map([
    [GreetingAccount, { kind: 'struct', fields: [['counter', 'u32']] }],
]);

/**
 * The expected size of each greeting account.
 */
export const GREETING_SIZE = borsh.serialize(
    GreetingSchema,
    new GreetingAccount(),
).length;

export function getGreeting(accountInfo: AccountInfo<Buffer>): GreetingAccount {
    return borsh.deserialize(
        GreetingSchema,
        GreetingAccount,
        accountInfo.data,
    );
}