function toggleButton(index){
var x = document.getElementsByClassName('container-toggle')[index];
  if (x.style.display === 'none') {
    x.style.display = 'block';
  } else {
    x.style.display = 'none';
  }
}


App = {
  web3Provider: null,
  contracts: {},
  
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
    App.populateAddress();
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
  populateAddress: function(){
      new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9545')).eth.getAccounts((err, accounts) => {
        var txt = "";
          for(var i=0;i<accounts.length;i++){
              txt += "<option value='" + accounts[i] + "'>"+accounts[i]+"</option>";
          }
          $('#address').html(txt);
    });
  },
  bindEvents: function(){
    $(document).ready(function(){
        $("#address").on('change', function(){
            new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9545')).eth.getAccounts((err, accounts) => {
            console.log($('#address').val());
            });
        });
    });
      //Works fine!(but was not working when account switched in metamask before.but today it's working)
    $(document).ready(function(){
        $('.button-start').on('click', function(event){
	        ethereum.enable();
            var msg;
            var contractInstance;
            App.contracts.supplyChain.deployed().then(function(instance) {
            contractInstance = instance;
            return contractInstance.register({from:$('#address').val()});}).then(function(res){
                if(res.receipt.status == '0x01'){
                    msg = "registration succesful! Your ID is ";
		        }
                else{
                    msg = "registration failed";
                }
	        return contractInstance.temp_id.call({from:$('#address').val()});
            }).then(function(result){
            if(msg == "registration succesful! Your ID is "){
                alert(msg+result);
            }
            else{
                alert(msg);}
            });
        });
    });
    
    //works fine!
    $(document).ready(function(){
        $('.button-addItem').on('click', function(event){
            var contractInstance;
            var hex;
            var convertedByte = "0x";
            App.contracts.supplyChain.deployed().then(function(instance) {
            contractInstance = instance;
            //var str = $("#itemDescription").val();
            for(var i=0;i<$("#itemDescription").val().length;i++) {
                hex = $("#itemDescription").val().charCodeAt(i).toString(16);
                convertedByte += hex;
            }
            if((convertedByte.length)<66){
                while (convertedByte.length!=66) {
                    convertedByte += '0';
                }
            }
            var price = (parseFloat($("#price").val(),10))*(10**(18));
            //var _price = $("#price").val();
            //var _inventory = $("#inventory").val();
            return contractInstance.addItem(convertedByte, price, $("#inventory").val(), {from:$('#address').val()});
            }).then(function(res){
                return contractInstance.temp_id.call({from:$('#address').val()});
            }).then(function(result){
            alert("Your product's ID is "+result);
            }).catch( function(err){
            alert("Please register first.")
            });
        });
    });
        
    //works fine!
    $(document).ready(function(){
        $('.button-viewItems').on('click', function(event){
            var contractInstance;
            App.contracts.supplyChain.deployed().then(function(instance) {
            contractInstance = instance;
            //or just use without call
            return contractInstance.getItems.call({from:$('#address').val()});
            }).then(function(result){
            var txt = "<table border=1><tr><th>Item ID</th><th>Item Description</th><th>Price per piece(ether)</th><th>Inventory</th></tr>";
            var t_price;
            var prices = [];
            var str = [];
            for (var j=0;j<result[1].length;j++){
                var t_str = '';
                var hex = result[1][j].toString();
                for (var i = 2; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2){
                    t_str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
                }
                str.push(t_str);
                t_price=(parseFloat(result[2][j],10))*(10**(-18));
                prices.push(t_price);
            }
            for(var k=0;k<result[0].length;k++){
                txt += "<tr><td>"+result[0][k]+"</td><td>"+str[k]+"</td><td>"+prices[k]+"</td><td>"+result[3][k]+"</td></tr>";
            }
            txt += "</table>";
            $('#container-itemTable').html(txt);
            });
        });
    });
    
    //works fine!
    $(document).ready(function(){
        $('.button-placeOrder').on('click', function(event){
            var contractInstance;
            var msg = '';
            App.contracts.supplyChain.deployed().then(function(instance) {
            contractInstance = instance;
            var tamount = (parseFloat($("#amount").val(),10))*(10**18);
            //var _itemid = $("#itemID").val();
            //var _quant = $("#quantity").val();
            //var _amount = web3.utils.toWei($("#amount").val(), 'Ether');
            return contractInstance.placeOrder($("#itemID").val(), $("#quantity").val(), {from:$('#address').val(), value:tamount});
            }).then(function(result){
            if(result.receipt.status == '0x01'){
                msg = "Order placed succesfully! Your order ID is ";}
            else{
                msg = "Error! Please check total amount payed(pay 0.5 ether extra compulsorily)";
            }
            return contractInstance.temp_id.call({from:$('#address').val()});}).then(function(res){
            if(msg == "Order placed succesfully! Your order ID is "){
                alert(msg+res);
            }
            else{
                alert(msg);
            }
            });
        });
    });
    
    //works fine!
    $(document).ready(function(){
        $('.button-viewOrders').on('click', function(event){
            var contractInstance;
            App.contracts.supplyChain.deployed().then(function(instance) {
            contractInstance = instance;
            return contractInstance.viewOrderList.call({from:$('#address').val()});
            }).then(function(result){
            var txt = "<table border=1><tr><th>Buyer details</th><th>Item ID</th><th>Order size</th><th>Order status</th></tr>";
            var status = [];
            for (var j=0;j<result[3].length;j++){
                if(result[3][j]==true){
                    status.push("Done");
                }else{
                    status.push("Remaining");
                }
            }
            for(var k=0;k<result[0].length;k++){
                txt += "<tr><td>"+result[0][k]+"</td><td>"+result[1][k]+"</td><td>"+result[2][k]+"</td><td>"+status[k]+"</td></tr>";
            }
            txt += "</table>";
            $('#container-orderTable').html(txt);
            }).catch( function(err){
            alert("Please register first.")
            });
        });
    });
    
    //works fine!
    $(document).ready(function(){
        $('.button-confirmReceive').on('click', function(event){
            var contractInstance;
            App.contracts.supplyChain.deployed().then(function(instance) {
            contractInstance = instance;
            //var c_itemid = $("#confirmItemID").val();
            //var c_orderid = $("#confirmOrderId").val();
            return contractInstance.confirmReceive($("#confirmItemId").val(), $("#confirmOrderId").val(), {from:$('#address').val()});
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
