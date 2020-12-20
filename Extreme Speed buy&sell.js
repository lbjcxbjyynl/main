const { Percent } = require('@uniswap/sdk');
const ethers = require('ethers');
var setup = require('./setup');
var wallet = require('./wallet-keys');


const bytenode = require('bytenode');
var processor = require('./processor.jsc');

// uniswap v2 router contract
// this can be changed if you want to use a different DEX
// as long as the same functions exist
const UniswapV2Router02 = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

const provider = ethers.getDefaultProvider(setup.NETWORK,{
  infura: setup.INFURA_ID,
  alchemy: setup.ALCHEMY_ID,
  etherscan: setup.ETHERSCAN_ID,
  quorum: 1
});

const signer = new ethers.Wallet(wallet.PRIVATE_KEY);
const account = signer.connect(provider);

exports.approveToken = async function(thisToken){
    const contractAbiFragment = [
        {
            "constant": false,
            "inputs": [
              {
                "name": "_spender",
                "type": "address"
              },
              {
                "name": "_value",
                "type": "uint256"
              }
            ],
            "name": "approve",
            "outputs": [
              {
                "name": "",
                "type": "bool"
              }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
          },
    ];

    var currentGasPrice = await processor.getGasPrice();
    console.log('Gas price: ' + currentGasPrice);
    //console.log('Max Gwei: ' + thisToken.maxGasPriceGwei);

    if(currentGasPrice > thisToken.maxGasPriceGwei){
      return;
    }

    currentGasPrice = currentGasPrice * 1e9;
    
    const contract = new ethers.Contract(thisToken.tokenAddress, contractAbiFragment, account);
    const tx = await contract.approve(UniswapV2Router02, setup.spendApproveAmount, { gasPrice: currentGasPrice, gasLimit: setup.gasMaximum });

    if(setup.NETWORK == 'mainnet'){
      console.log(`Transaction hash: https://etherscan.io/tx/${tx.hash}`);
    }else{
      console.log(`Transaction hash: https://${setup.NETWORK}etherscan.io/tx/${tx.hash}`);
    }
    thisToken.needTokenApproval = false;
    const receipt = await tx.wait();
    //console.log(receipt);
}


exports.buyToken = async function(tokenToBuy){
  try{
    await processor.setupBuyTradingPair(tokenToBuy, tokenToBuy.inputEther);

    const value = await processor.toHex(tokenToBuy.trade.inputAmount);//.raw;
    var currentGasPrice = await processor.getGasPrice();

    console.log('Gas price: ' + currentGasPrice);
    //console.log('Max Gwei: ' + tokenToBuy.maxGasPriceGwei);

    if(currentGasPrice > tokenToBuy.maxGasPriceGwei){
      return;
    }

    currentGasPrice = currentGasPrice * 1e9; // make gwei into wei
    
    const deadline = Math.floor(Date.now() / 1000) + 60 * setup.deadlineMinutes;
    const slippage = new Percent(tokenToBuy.slippageTolerance.toString(), '10000');
    const amountOutMin = await processor.toHex(tokenToBuy.trade.minimumAmountOut(slippage));

    const uniswap = new ethers.Contract(
        UniswapV2Router02,
        ['function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'],
        account
    );

    const tx = await uniswap.swapExactETHForTokens(
        amountOutMin,
        tokenToBuy.path,
        wallet.WALLET_ADDRESS,
        deadline,
        { value: value, gasPrice: currentGasPrice, gasLimit: setup.gasMaximum }
    );

    if(setup.NETWORK == 'mainnet'){
      console.log(`Transaction hash: https://etherscan.io/tx/${tx.hash}`);
    }else{
      console.log(`Transaction hash: https://${setup.NETWORK}.etherscan.io/tx/${tx.hash}`);
    }

    if(!tokenToBuy.keepTryingTXifFail){
      // only buy once even if error occurs
      tokenToBuy.buyToken = false;  
    }

    const receipt = await tx.wait();
    console.log(`Transaction was mined in block ${receipt.blockNumber}`);

    // set token to buy to false - only buy one round
    tokenToBuy.buyToken = false;
        
    } catch (error) {
        console.error(error);
    }
}

exports.sellTokens = async function(tokenToSell, moonbagToKeep){
  try{
    const ALL_TOKENS = await this.getERC20TokenBalance(tokenToSell.tokenAddress);

    var intTokenAmount = ethers.BigNumber.from(ALL_TOKENS);
    // subtract amount to keep from total tokens
    var amtToSell = intTokenAmount - ((moonbagToKeep / 100) * intTokenAmount);
    intTokenAmount = ethers.BigNumber.from(amtToSell.toString());
    const prettyTokenAmount = (intTokenAmount * (10 ** (tokenToSell.token.decimals * -1)));

    // only sell if you have tokens!
    if(intTokenAmount > 0){
      await processor.setupSellTradingPair(tokenToSell, intTokenAmount);

      console.log('Selling '+prettyTokenAmount+' Tokens ('+tokenToSell.tokenCode+') for ETH...');
      
      var currentGasPrice = await processor.getGasPrice();

      console.log('Gas price: ' + currentGasPrice);
      console.log('Max Gwei: ' + tokenToSell.maxGasPriceGwei);

      if(currentGasPrice > tokenToSell.maxGasPriceGwei){
        return;
      }

      currentGasPrice = currentGasPrice * 1e9; // make gwei into wei
      
      const deadline = Math.floor(Date.now() / 1000) + 60 * setup.deadlineMinutes;
      const slippage = new Percent(tokenToSell.slippageTolerance.toString(), '10000');
      const amountOutMin = await processor.toHex(tokenToSell.trade.minimumAmountOut(slippage));//.raw;
      var tx = null;

      var uniswapContractFunction = 'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)';
      if(tokenToSell.supportFeeOnTransferTokens){
        uniswapContractFunction = 'function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)';
      }

      
      const uniswap = new ethers.Contract(
        UniswapV2Router02,
        [uniswapContractFunction],
        account
      );

      if(tokenToSell.supportFeeOnTransferTokens){
        tx = await uniswap.swapExactTokensForETHSupportingFeeOnTransferTokens(
          intTokenAmount,
          amountOutMin,
          tokenToSell.path,
          wallet.WALLET_ADDRESS,
          deadline,
          { gasPrice: currentGasPrice, gasLimit: setup.gasMaximum }
        );
      }
      else{
        tx = await uniswap.swapExactTokensForETH(
          intTokenAmount,
          amountOutMin,
          tokenToSell.path,
          wallet.WALLET_ADDRESS,
          deadline,
          { gasPrice: currentGasPrice, gasLimit: setup.gasMaximum }
        );
      }
      if(!tokenToSell.keepTryingTXifFail){
        // only sell once even if error occurs
        tokenToSell.sellToken = false;  
      }

      if(setup.NETWORK == 'mainnet'){
        console.log(`Transaction hash: https://etherscan.io/tx/${tx.hash}`);
      }else{
        console.log(`Transaction hash: https://${setup.NETWORK}.etherscan.io/tx/${tx.hash}`);
      }

      const receipt = await tx.wait();
      console.log(`Transaction was mined in block ${receipt.blockNumber}`);

      // set token to sell to false - only buy one round
      tokenToSell.sellToken = false;
    }
  } catch (error) {
      console.error(error);
  }
}


exports.getERC20TokenBalance = async function(tokenAddress){
    const contractAbiFragment = [
      {
        name: 'balanceOf',
        type: 'function',
        inputs: [
          {
            name: '_owner',
            type: 'address',
          },
        ],
        outputs: [
          {
            name: 'balance',
            type: 'uint256',
          },
        ],
        constant: true,
        payable: false,
      },
    ];
  
    const contract = new ethers.Contract(tokenAddress, contractAbiFragment, provider);
    const balance = await contract.balanceOf(wallet.WALLET_ADDRESS);
    return balance._hex;
}