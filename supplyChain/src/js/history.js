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
        $(".address").text(App.addr);
      console.log(App.addr);
  });
      
  $(document).ready(function(){
        $('.button-showHistory').on('click', function(event){
            var contractInstance;
            var msg = '';
            App.contracts.supplyChain.deployed().then(function(instance) {
            contractInstance = instance;
            return contractInstance.viewPlacedOrders.call({from:App.addr});
            }).then(function(result){
            var txt = "<table border=1><tr><th>Order ID</th><th>Item ID</th><th>Order size</th><th>Order status</th></tr>";
            for(var i=0;i<result[0].length-1;i++){
                for(var j=0; j<result[0].length-1;j++){
                    if(result[0][j]<result[0][j+1]){
                        for(var k=0;k<result.length;k++){
                            var temp=result[k][j];
                            result[k][j]=result[k][j+1];
                            result[k][j+1]=temp;
                        }
                    }
                }
            }
            var status = [];
            for (var l=0;l<result[3].length;l++){
                if(result[3][l]==true){
                    status.push("Confirmed and completed");
                }else{
                    status.push("Delivery remaining");
                }
            }
            for(var m=0;m<result[0].length;m++){
                txt += "<tr><td>"+result[0][m]+"</td><td>"+result[1][m]+"</td><td>"+result[2][m]+"</td><td>"+status[m]+"</td></tr>";
            }
            txt += "</table>";
            $('.container-historyTable').html(txt);
            }).catch( function(err){
            alert("Please register first.")
            });
        });
    });
    
    $(document).ready(function(){
        $('.button-confirmReceive').on('click', function(event){
            var contractInstance;
            App.contracts.supplyChain.deployed().then(function(instance) {
            contractInstance = instance;
            //var c_itemid = $("#confirmItemID").val();
            //var c_orderid = $("#confirmOrderId").val();
            return contractInstance.confirmReceive($("#confirmItemId").val(), $("#confirmOrderId").val(), {from:App.addr});
            }).then(function(result){
            if(result.receipt.status == '0x01'){
                alert("Thankyou for shopping! 0.5 ether have been reverted to your account");}
            else{
                alert("Error! Check the data entered");}
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
