const hexToBinary = require("hex-to-binary");
const Block = require("./block");
const { GENESIS_DATA, Mine_Rate } = require("../config");
const {cryptoHash} = require("../cryptohash_class");

describe ('Block',()=>{
	const timestamp = 2000;
	const lastHash = "foo-hash";
	const hash = "bar-hash";
	const data = ['blockchain','data'];
	const nonce =1;
	const difficulty = 1;
	const block = new Block({timestamp,lastHash,hash,data,nonce,difficulty});
	it('has a timestamp,lastHash,hash and a data', () => {
		expect(block.timestamp).toEqual(timestamp);
		expect(block.lastHash).toEqual(lastHash);
		expect(block.hash).toEqual(hash);
		expect(block.data).toEqual(data);
		expect(block.nonce).toEqual(nonce);
		expect(block.difficulty).toEqual(difficulty);

	});

	describe('genesis()',() => {
		const genesisBlock = Block.genesis();
		it('is a instance of ',() =>{
			expect(genesisBlock instanceof Block).toBe(true);
		});
		it('returns genesis data',()=>{
			expect(genesisBlock).toEqual(GENESIS_DATA);
		});
	});

	describe('mineBlock()',()=>{
		const lastBlock = Block.genesis();
		const data = 'mined data';
		const minedBlock = Block.mineBlock({ lastBlock,data});
		it("it returns instance of ",()=>{ 
			expect(minedBlock instanceof Block).toBe(true);
		});
		it('sets the `lastHash` to be `hash` of the last block',()=>{
			expect(minedBlock.lastHash).toEqual(lastBlock.hash);
		});
		it("sets the value of data",()=>{
			expect(minedBlock.data).toEqual(data);
		});
		it("defines the timestamp",()=>{
			expect(minedBlock.timestamp).not.toEqual(undefined);
		});
		it("checks if the hash of the new block is of SHA512",()=>{
			expect(minedBlock.hash)
			.toEqual(
			  cryptoHash(
			    minedBlock.timestamp,
			    minedBlock.nonce,
			    minedBlock.difficulty,
			    lastBlock.hash,
			    data
			  )
			);
		});
		it("sets a `hash` to meet the difficulty criteria",()=>{
			expect(hexToBinary(minedBlock.hash).substring(0,minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty));
		});
		it("adjusts difficulty",()=>{
			const possibleresults = [lastBlock.difficulty+1,lastBlock.difficulty-1];
			expect(possibleresults.includes(minedBlock.difficulty)).toBe(true);
		})
	});
	describe('adjustDifficulty',()=>{
		it('raises the difficulty for a quickly mined block',()=>{
			expect(Block.adjustdifficulty({
				originalBlock: block, 
				timestamp: block.timestamp + Mine_Rate - 100
			})).toEqual(block.difficulty + 1);
		});
		it('lowers the difficulty for a slowly mined block',()=>{
			expect(Block.adjustdifficulty({
				originalBlock: block, 
				timestamp: block.timestamp + Mine_Rate + 100 
			})).toEqual(block.difficulty - 1);
		});
		it("the lower limit is 1",()=>{
			block.difficulty = -1;
			expect(Block.adjustdifficulty({originalBlock:block})).toEqual(1);
		});
	});

});