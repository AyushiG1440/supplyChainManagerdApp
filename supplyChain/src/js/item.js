App = {
  web3Provider: null,
  contracts: {},
  addr:'',
  
  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
        // Is there is an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fallback to the TestRPC
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545');
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },
  initContract: function() {
    $.getJSON('supplyChain.json', function(data) {
    // Get the necessary contract artifact file and instantiate it with truffle-contract
    var contractArtifact = data;
    App.contracts.supplyChain = TruffleContract(contractArtifact);

    // Set the provider for our contract
    App.contracts.supplyChain.setProvider(App.web3Provider);
    
    return App.bindEvents();
    });
  },
  bindEvents: function(){
  $(document).ready(function(){
        App.addr = JSON.parse(window.localStorage.getItem('selected_addr'));
        var obj1= JSON.parse(window.localStorage.getItem('id'));
        var obj2= JSON.parse(window.localStorage.getItem('description'));
        var obj3= JSON.parse(window.localStorage.getItem('price'));
        var obj4= JSON.parse(window.localStorage.getItem('inventory'));
        $(".item-id").text(obj1);
        $(".item-description").text(obj2);
        $(".item-price").text(obj3);
        $(".item-inventory").text(obj4);
        $(".address").text(App.addr);
      console.log(App.addr);
  });
      
      
  $(document).ready(function(){
        $('.button-placeOrder').on('click', function(event){
            var contractInstance;
            var msg = '';
            App.contracts.supplyChain.deployed().then(function(instance) {
            contractInstance = instance;
            var amount = (($(".item-price").text())*($(".orderSize").val()))+0.5;
            var tamount = (parseFloat(amount,10))*(10**18);
            //var _itemid = $("#itemID").val();
            //var _quant = $("#quantity").val();
            //var _amount = web3.utils.toWei($("#amount").val(), 'Ether');
            return contractInstance.placeOrder($(".item-id").text(), $(".orderSize").val(), {from:App.addr, value:tamount});
            }).then(function(result){
            if(result.receipt.status == '0x01'){
                msg = "Order placed succesfully! Your order ID is ";}
            else{
                msg = "Error! Please check total amount payed(pay 0.5 ether extra compulsorily)";
            }
            return contractInstance.temp_id.call({from:App.addr});}).then(function(res){
            if(msg == "Order placed succesfully! Your order ID is "){
                $(".container-receipt-order").text(msg+res);
            }
            else{
                $(".container-receipt-order").text(msg);
            }
            });
        });
    });
}
};
$(function() {
    $(window).load(function() {
        App.init();
        console.log('starting app.js');
    });
});
