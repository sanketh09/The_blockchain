const Blockchain = require("./index");
const Block = require("./block");
const {cryptoHash} = require("../cryptohash_class");

describe('Blockchain',()=>{
	let blockchain,newChain,originalChain;

	beforeEach(()=>{
		blockchain = new Blockchain();
		newChain = new Blockchain();
		originalChain = blockchain.chain;
	});

	it("should contain a chain array",()=>{
		expect(blockchain.chain instanceof Array).toBe(true);
	});
	it("should have genesis block",()=>{
		expect(blockchain.chain[0]).toEqual(Block.genesis());
	});
	it("ability to add a box",()=>{
		const newData = "new foo";
		blockchain.addBlock({data: newData});
		expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData);
	});
	
	describe('isValidChain()',()=>{
		describe('checks if the blockchain starts with genesis block',()=>{
			it('returns False',()=>{
				blockchain.chain[0] = {data:'fake data'};
				expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
			});
		});
		describe('when the chain starts with multiple blocks and has a genesis block',()=>{
			beforeEach(()=>{
				blockchain.addBlock({data:'bears'});
				blockchain.addBlock({data:'bats'});
				blockchain.addBlock({data:'kaboom'});
			});
			describe('when the lastHash reference is wrong',()=>{
				it('returns False',()=>{
					blockchain.chain[2].lastHash = 'broken-lastHash';
					expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
				});
			});
			describe('there is a jumped difficulty',()=>{
				it('returns false',()=>{
					const lastBlock = blockchain.chain[blockchain.chain.length-1];
					const lastHash = lastBlock.hash;
					const timestamp = Date.now();
					const nonce = 0;
					const data = [];
					const difficulty = lastBlock.difficulty - 3;

					const hash = cryptoHash(timestamp,lastHash,difficulty,nonce,data);
					const badBlock = new Blockchain({timestamp,lastHash,hash,nonce,difficulty,data});
					blockchain.chain.push(badBlock);
					expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
				});
			});
			describe('when there is an invaild field',()=>{
				it('returns false',()=>{
					blockchain.chain[2].data='some-wrong-data';
					expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
				});
			});
			describe('when the blocks are all fine',()=>{
				it('return True',()=>{
					expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
				});
			});
		});
	});
	describe('replaceChain()',()=>{
		let errormock , logmock;
		beforeEach(()=>{
			errormock = jest.fn();
			logmock = jest.fn();

			global.console.error = errormock;
			global.console.log = logmock;
		});

		describe('replace the chain if new chain is not longer',()=>{
			beforeEach(()=>{
				newChain[0] = {new:'chain'};
				blockchain.replaceChain(newChain.chain);
			})
			it('does not replace the chain',()=>{
				expect(blockchain.chain).toEqual(originalChain);
			});
			it('Log an Error',()=>{
				expect(errormock).toHaveBeenCalled();
			});
		});
		describe('replace the chain when the chain is longer',()=>{
			beforeEach(()=>{
				newChain.addBlock({data:'bears'});
				newChain.addBlock({data:'bats'});
				newChain.addBlock({data:'kaboom'});
			});
			describe('if the chain is invalid',()=>{
				beforeEach(()=>{
				newChain.chain[2].hash = 'some-fake-hash';
				blockchain.replaceChain(newChain.chain);
				});
				it('does not replace the chain',()=>{
				expect(blockchain.chain).toEqual(originalChain);
				});
				it('Log an Error',()=>{
					expect(errormock).toHaveBeenCalled();
				});
			});
			describe('and the chain is valid', () => {
				beforeEach(() => {
				  blockchain.replaceChain(newChain.chain);
				});
			
				it('replaces the chain', () => {
				  expect(blockchain.chain).toEqual(newChain.chain);
				});
			
				it('logs about the chain replacement', () => {
				  expect(logmock).toHaveBeenCalled();
				});
			      });
			});
	});
	
});