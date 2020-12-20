module.exports = {
    INFURA_ID: '', // Get an infura API key from: https://infura.io/
    ALCHEMY_ID: '', // (Optional) Get an alchemy API key from: https://dashboard.alchemyapi.io/
    ETHERSCAN_ID: '', // Get an etherscan API key from: https://etherscan.io/myapikey
    NETWORK: 'ropsten', // mainnet or ropsten
    defaultGasGwei: 65, // used if gas cannot be estimated to selected speed from etherscan
    gasSpeed: 'fast', // slow, normal, fast
    gasMaximum: 1000000, // 1,000,000 max gas - contracts only use actual gas needed, this just makes sure they have enough
    deadlineMinutes: 20, // 20 minute default to wait for a tx before failure
    gasAdd: 2, // add 2 gwei to all tx
    spendApproveAmount: '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', // approve max spending
};