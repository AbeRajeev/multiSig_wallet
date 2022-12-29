const { expect } = require('chai');
const { use, expectEvent } = require('@openzeppelin/test-helpers');
const { solidity, artifacts } = require('hardhat');

// Import the compiled contract artifact
const MultiSigWallet = artifacts.require('MultiSigWallet');
//require('./artifacts/contracts/MultiSigWallet.sol/MultiSigWallet.json');


// Set up a testable contract instance
async function getTestableInstance(accounts) {
    // Deploy a new instance of the contract with 2 owners and a required confirmation count of 2
    const instance = await new web3.eth.Contract(MultiSigWallet.abi)
        .deploy({ data: MultiSigWallet.bytecode, arguments: [accounts.slice(0, 2), 2] })
        .send({ from: accounts[0], gas: 2000000 });

    return instance;
}

describe('MultiSigWallet', function () {
    let accounts;
    let instance;

    // Set up test environment before running tests
    before(async function () {
        // Retrieve a list of test accounts
        accounts = await web3.eth.getAccounts();

        // Get a testable instance of the contract
        instance = await getTestableInstance(accounts);
    });

    it('should allow owners to submit and confirm transactions', async function () {
        // Submit a new transaction from the first owner
        const txResult = await instance.methods.submitTransaction(accounts[2], 100, '0x').send({ from: accounts[0] });

        // Expect the function to emit a SubmitTransaction event
        expectEvent(txResult, 'SubmitTransaction', {
            owner: accounts[0],
            to: accounts[2],
            value: '100',
            data: '0x'
        });

        // Retrieve the transaction index from the event
        const txIndex = txResult.events.SubmitTransaction.returnValues.txIndex;

        // Confirm the transaction from the second owner
        const confirmResult = await instance.methods.confirmTransaction(txIndex).send({ from: accounts[1] });

        // Expect the function to emit a ConfirmTransaction event
        expectEvent(confirmResult, 'ConfirmTransaction', {
            owner: accounts[1],
            txIndex: txIndex
        });
    });

    it('should execute confirmed transactions', async function () {
        // Submit a new transaction from the first owner
        const txResult = await instance.methods.submitTransaction(accounts[2], 100, '0x').send({ from: accounts[0] });
        const txIndex = txResult.events.SubmitTransaction.returnValues.txIndex;

        // Confirm the transaction from both owners
        await instance.methods.confirmTransaction(txIndex).send({ from: accounts[0] });
        await instance.methods.confirmTransaction(txIndex).send({ from: accounts[1] });

        // Execute the transaction from the first owner
        const executeResult = await instance.methods.executeTransaction(txIndex).send({ from: accounts[0] });

        // Expect the function to emit an ExecuteTransaction event
        expectEvent(executeResult, 'ExecuteTransaction', {
            owner: accounts[0],
            txIndex: txIndex
        });

        // Retrieve the transaction from the contract
        const transaction = await instance.methods.transactions(txIndex).call();

        // Assert that the transaction has been executed
        expect(transaction.executed).to.be.true;
    });

    // More cases need to be added here
});