const hexToBinary = require("hex-to-binary");
const { GENESIS_DATA, Mine_Rate } = require("../config");
const {cryptoHash} = require("../cryptohash_class");

class Block{
	constructor({timestamp,lastHash,hash,data,nonce,difficulty}) {
		this.timestamp = timestamp;
		this.lastHash = lastHash;
		this.hash = hash;
		this.data = data;
		this.nonce = nonce;
		this.difficulty = difficulty;
	}
	static genesis(){
		return new this(GENESIS_DATA);
	}
	static mineBlock({ lastBlock,data}){
		let hash,timestamp;
		//const timestamp = Date.now();
		const lastHash = lastBlock.hash;
		let {difficulty} = lastBlock; 
		let nonce = 0;
		do{
			nonce++;
			timestamp = Date.now();
			difficulty = Block.adjustdifficulty({originalBlock: lastBlock,timestamp}); 
			hash= cryptoHash(timestamp,lastHash,data,nonce,difficulty);
		}while(hexToBinary(hash).substring(0,difficulty)!=='0'.repeat(difficulty));

		return new this({
			timestamp,
			lastHash,
			data,
			nonce,
			difficulty,
			hash
		});
	}
	static adjustdifficulty({originalBlock, timestamp}){
		const {difficulty} = originalBlock;
		const difference = timestamp - originalBlock.timestamp;
		if(difficulty<1) return 1;
		if(difference>Mine_Rate) return difficulty-1;
		return difficulty +1;	
	}
}

module.exports = Block; 