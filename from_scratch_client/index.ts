import {
    PublicKey,
} from '@solana/web3.js';

import {
    mintNFTforSneaker,
    transferNFT
} from './client';

// TODO express server setup

async function mint(
    creator: string,
    seed: String,
    amount: number
): Promise<number> {
    let creatorPubKey: PublicKey
    // turn creator to publickey
    await mintNFTforSneaker(creatorPubKey, seed, amount);
    return 0;
}

async function transfer(nft: string, from: string, to: string)
    : Promise<number> {
    let fromPubKey: PublicKey
    let toPubKey: PublicKey
    let nftPubKey: PublicKey

    // convert to, from, and nft, from API to their respecful types 
    await transferNFT(nftPubKey, fromPubKey, toPubKey)
    return 0
}

async function getLeaderBoardAll(top: number)
    : Promise<Array<number>> {
    // grab top "top" owners of sneakers
    return []
}

async function getLeaderBoardBrand(top: number, brand: string)
    : Promise<Array<number>> {
    // get top owners of brand    
    return []
}