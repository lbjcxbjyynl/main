/**************************************************************************
/****************************** !DISCLAIMER! ******************************
/**************************************************************************
 * USE AT YOUR OWN RISK, THIS PROJECT IS STILL IN BETA. WE HAVE           *
 * EXTENSIVELY TESTED IT, HOWEVER WE SUGGEST YOU FIRST TEST IT USING THE  *
 * ROPSTEN TEST NETWORK TO GET COMFORTABLE WITH IT'S USE. AND USE A       *
 * SEPARATE WALLET FROM YOUR MAIN WALLET!                                 *
 *                                                                        * 
 * YOUR TRADES ARE YOUR OWN! THIS IS NOT A FRONT RUNNING BOT, YOU STILL   *
 * MUST SELECT GOOD TRADES AND GOOD LIMITS!                               *
 *                                                                        *
 *                                                                        *
/**************************************************************************/
/***************************** SETUP VARS *********************************/
/**************************************************************************/
const SCAN_DELAY_RATE_MS = 10000; // pause 10 seconds between every scan

const tokens = [
  {
    active: false, // turn strategy on/off
    tokenCode: 'TBB', // for display only
    tokenAddress: '0x4a7adcb083fe5e3d6b58edc3d260e2e61668e7a2',
    inputEther: 1.0, // how much ether you want to use to buy this token
    buyLimitPrice: 0.33, // buy at this price or under - ETH/TKN rate - set to 0 to not buy
    sellLimitPrice: 0.66, // sell at this price or over - ETH/TKN rate - set to 0 to not sell
    stopLossPrice: 0, // sell all tokens at this price ignoring trailingSellPct and moonbag to prevent capital loss - set to 0 to disable
    trailingSellPct: 1, // set to > 0 to allow selling only if price drops from max recorded down by X pct
    trailingBuyPct: 1, // set to > 0 to allow buying only if price increases from min recorded up by X pct
    moonbagToKeep: 50, // % - sell all tokens except X percent when sell-limit is reached
    maxGasPriceGwei: 200, // gwei
    slippageTolerance: 2000, // 0.50% or 500 bips - 1 bip = 0.001 %
    supportFeeOnTransferTokens: false, // uses contract that allow burn or other fees when selling
    keepTryingTXifFail: false, // if buy or sell fails for any reason, should bot keep trying? safest to keep this false until you know for sure
    needTokenApproval: false // set to true to first approve token with uniswap router - only needs to be done once
  },
  {
    active: false, // turn strategy on/off
    tokenCode: 'AAVE', // for display only
    tokenAddress: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    inputEther: 1.0, // how much ether you want to use to buy this token
    buyLimitPrice: 0.5, // buy at this price or under - ETH/TKN rate - set to 0 to not buy
    sellLimitPrice: 1.6, // sell at this price or over - ETH/TKN rate - set to 0 to not sell
    stopLossPrice: 0.65, // sell all tokens at this price ignoring trailingSellPct and moonbag to prevent capital loss - set to 0 to disable
    trailingSellPct: 1, // set to > 0 to allow selling only if price drops from max recorded down by X pct
    trailingBuyPct: 1, // set to > 0 to allow buying only if price increases from min recorded up by X pct
    moonbagToKeep: 10, // % - sell all tokens except X percent when sell-limit is reached
    maxGasPriceGwei: 100, // gwei
    slippageTolerance: 500, // 0.50% or 500 bips - 1 bip = 0.001 %
    supportFeeOnTransferTokens: false, // uses contract that allow burn or other fees when selling
    keepTryingTXifFail: false, // if buy or sell fails for any reason, should bot keep trying? safest to keep this false until you know for sure
    needTokenApproval: false // set to true to first approve token with uniswap router - only needs to be done once
  },
  {
    active: false,
    tokenCode: 'YAX',
    tokenAddress: '0xb1dc9124c395c1e97773ab855d66e879f053a289',
    inputEther: 1.0, // how much ether you want to use to buy this token
    buyLimitPrice: 0.012, // buy at this price or under - ETH/TKN rate - set to 0 to not buy
    sellLimitPrice: 0.025, // sell at this price or over - ETH/TKN rate - set to 0 to not sell
    stopLossPrice: 0.15, // sell all tokens at this price ignoring trailingSellPct and moonbag to prevent capital loss - set to 0 to disable
    trailingSellPct: 1, // 1% - set to > 0 to allow selling only if price drops from max recorded down by X pct
    trailingBuyPct: 1, // 1% - set to > 0 to allow buying only if price increases from min recorded up by X pct
    moonbagToKeep: 50, // % - sell all tokens except X percent when sell-limit is reached
    maxGasPriceGwei: 80, // gwei
    slippageTolerance: 500, // 0.50% or 500 bips - 1 bip = 0.001 %
    supportFeeOnTransferTokens: false, // uses contract that allow burn or other fees when selling
    keepTryingTXifFail: false, // if buy or sell fails for any reason, should bot keep trying? safest to keep this false until you know for sure
    needTokenApproval: false // set to true to first approve token with uniswap router - only needs to be done once
  },
  {
    active: true,
    tokenCode: 'DAI',
    tokenAddress: '0xad6d458402f60fd3bd25163575031acdce07538d', //ropsten DAI
    inputEther: 0.15, // how much ether you want to use to buy this token
    buyLimitPrice: 0.014, // buy at this price or under - ETH/TKN rate - set to 0 to not buy
    sellLimitPrice: 0.02, // sell at this price or over - ETH/TKN rate - set to 0 to not sell
    stopLossPrice: 0, // sell all tokens at this price ignoring trailingSellPct and moonbag to prevent capital loss - set to 0 to disable
    trailingSellPct: 1, // 1% - set to > 0 to allow selling only if price drops from max recorded down by X pct
    trailingBuyPct: 1, // 1% - set to > 0 to allow buying only if price increases from min recorded up by X pct
    moonbagToKeep: 0, // % - sell all tokens except X percent when sell-limit is reached
    maxGasPriceGwei: 120, // 120 gwei... 65e9 is 65 gwei
    slippageTolerance: 50, // 0.05% or 50 bips - 1 bip = 0.001 %
    supportFeeOnTransferTokens: false, // uses contract that allow burn or other fees when selling
    keepTryingTXifFail: false, // if buy or sell fails for any reason, should bot keep trying? safest to keep this false until you know for sure
    needTokenApproval: false // set to true to first approve token with uniswap router - only needs to be done once
  },
  {
    active: true,
    tokenCode: 'BAT',
    tokenAddress: '0xDb0040451F373949A4Be60dcd7b6B8D6E42658B6', //ropsten BAT
    inputEther: 0.15, // how much ether you want to use to buy this token
    buyLimitPrice: 0.001, // buy at this price or under - ETH/TKN rate - set to 0 to not buy
    sellLimitPrice: 0.02, // sell at this price or over - ETH/TKN rate - set to 0 to not sell
    stopLossPrice: 0, // sell all tokens at this price ignoring trailingSellPct and moonbag to prevent capital loss - set to 0 to disable
    trailingSellPct: 1, // % - set to > 0 to allow selling only if price drops from max recorded down by X pct
    trailingBuyPct: 1, // % - set to > 0 to allow buying only if price increases from min recorded up by X pct
    moonbagToKeep: 0, // % - sell all tokens except X percent when sell-limit is reached
    maxGasPriceGwei: 120, // 120 gwei... 65e9 is 65 gwei
    slippageTolerance: 50, // bips - 0.05% or 50 bips - 1 bip = 0.001 %
    supportFeeOnTransferTokens: false, // uses contract that allow burn or other fees when selling
    keepTryingTXifFail: false, // if buy or sell fails for any reason, should bot keep trying? safest to keep this false until you know for sure
    needTokenApproval: false // set to true to first approve token with uniswap router - only needs to be done once
  }
];
/*******************************************/
/**************** END SETUP ****************/
/*******************************************/

const bytenode = require('bytenode');
var processor = require('./processor.jsc');

let tokensToScan = true;

async function scanPrices() {
  tokensToScan = false;

  tokensToScan = await processor.checkAllTokens(tokens);

  console.log("==============================");
  
  if(tokensToScan) {
    setTimeout(function(){
      scanPrices();
    }, SCAN_DELAY_RATE_MS);
  } else{
    console.log('!!!!FINISHED - No more to scan!!!!');
  }
}

scanPrices();