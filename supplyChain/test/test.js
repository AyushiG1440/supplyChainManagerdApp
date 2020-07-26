let supplyChain = artifacts.require("./supplyChain.sol");
let contractInstance;

contract('supplyChain Contract', function (accounts) {
//accounts[0] is the default account
//Test case 1
	it("Contract deployment", function() {
		return supplyChain.deployed().then(function (instance) {
			contractInstance = instance;
		assert(contractInstance !== undefined, 'supplyChain contract should be defined');
		});
	});
//Test case 2
	it("Valid registration", function(){
		return contractInstance.register({from:accounts[1]}).then(function(result){
		assert.equal('0x01', result.receipt.status, 'Registration is valid');
		return contractInstance.register({from:accounts[2]});
		}).then(function(result){
		assert.equal('0x01', result.receipt.status, 'Registration is valid');
		});
	});
//Test case 3
	it("Succesfully added item", function(){
		return contractInstance.addItem(0x7465737400000000000000000000000000000000000000000000000000000000, 100000000000000000, 3, {from:accounts[1]}).then(
		function(result){
		assert.equal('0x01', result.receipt.status, 'item is added');
		});
	});
//Test case 4
	it("succesfully placed order", function(){
		return contractInstance.placeOrder(0, 1, {from:accounts[2], value:600000000000000000}).then(function(result){
		assert.equal('0x01', result.receipt.status, 'order is placed');
		});
	});	
//Test case 5
	it("successfully confirmed order fulfillment",function(){
		return contractInstance.confirmReceive(0, 1, {from:accounts[2]}).then(function(result){
		assert.equal('0x01', result.receipt.status, 'order is received');
		});	
	});
});
