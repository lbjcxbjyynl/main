# main
Node. scripting technology to give you more control over your trading. Security and trading efficiency are core goals.

# TH - Trade Hunter
Token Address -

wallet-keys.js - add your private key and wallet address. Note that ONLY buysell.js uses these keys for the standard uniswap contracts and token spending approval.

setup.js - get an Infura and/or Alchemy API key, both aren't necessary but it's a good idea to have at least one for rate limits. You can setup most other configuration variables here.

RUN.js - add tokens you want to scan here. Make sure your wallet is either already approved to spend on uniswap, or you turn variable needTokenApproval to true. Make sure to turn it to false after allowing one round of approval or else the script will approve each time. If uniswap router cannot spend your tokens, you will fail tx when trying to sell!

Install Node.JS for your OS: https://nodejs.org/en/download/

Make sure your Node.js is the correct version (using npm): 14.15.1 npm cache clean -f npm install -g n n 14.15.1

Extract files into a folder and run the following commands to install modules, you only need to run this command once: npm install

To start running the bot: npm start
money!
