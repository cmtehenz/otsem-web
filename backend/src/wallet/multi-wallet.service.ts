import { Injectable } from '@nestjs/common';
import { Wallet as EvmWallet } from 'ethers';
import * as bitcoin from 'bitcoinjs-lib';
import * as bip39 from 'bip39';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import TronWeb from 'tronweb';
import * as solanaWeb3 from '@solana/web3.js';
import bs58 from 'bs58';

const bip32 = BIP32Factory(ecc);

@Injectable()
export class MultiWalletService {
    async gerarCarteiras() {
        // 1. Ethereum (EVM)
        const ethereumWallet = EvmWallet.createRandom();

        if (!ethereumWallet.mnemonic || !ethereumWallet.mnemonic.phrase) {
            throw new Error('Mnemonic não gerado para a carteira Ethereum!');
        }

        // 2. Bitcoin
        const mnemonicBTC = bip39.generateMnemonic();
        const seedBTC = await bip39.mnemonicToSeed(mnemonicBTC);
        const rootBTC = bip32.fromSeed(seedBTC);
        const childBTC = rootBTC.derivePath("m/84'/0'/0'/0/0");
        const { address: btcAddress } = bitcoin.payments.p2wpkh({
            pubkey: Buffer.from(childBTC.publicKey), // <--- CORRIGIDO!
            network: bitcoin.networks.bitcoin,
        });

        // 3. Tron
        const tron = TronWeb.utils.accounts.generateAccount();
        const tronAddress = tron.address.base58;
        const tronPrivateKey = tron.privateKey;

        // 4. Solana
        const solanaKeypair = solanaWeb3.Keypair.generate();
        const solanaAddress = solanaKeypair.publicKey.toBase58();
        const solanaPrivateKey = bs58.encode(solanaKeypair.secretKey);

        return {
            ethereum: {
                address: ethereumWallet.address,
                privateKey: ethereumWallet.privateKey,
                phrase: ethereumWallet.mnemonic.phrase,
            },
            bitcoin: {
                address: btcAddress,
                privateKey: childBTC.toWIF(),
                mnemonic: mnemonicBTC,
            },
            tron: {
                address: tronAddress,
                privateKey: tronPrivateKey,
            },
            solana: {
                address: solanaAddress,
                privateKey: solanaPrivateKey,
            },
        };
    }
}
